const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });


  beforeEach(async() => {
    return mongoose.connection.dropDatabase();
  });

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'water company',
      description: 'we make water',
      imageUrl: 'water.png'
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });
  
  it('creates a poll via POST', () => {
    return request(app)
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: 'water poll',
        description: 'do you drink water',
        options: ['Yes', 'No']
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: `${organization._id}`,
          title: 'water poll',
          description: 'do you drink water',
          options: ['Yes', 'No'],
          __v: 0
        });
      });
  });

  it('gets all org polls via GET', () => {
    return Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    })
      .then(() => request(app).get(`/api/v1/polls?organization=${organization.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'water poll',
          organization: {
            _id: organization.id,
            title: 'water company'
          }
        }]);
      });
  });

  it('gets specific poll by id via GET', () => {
    return Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    })
      .then(poll => request(app).get(`/api/v1/polls/${poll._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: {
            _id: organization.id,
            title: 'water company'
          },
          title: 'water poll',
          description: 'You drink water',
          options: ['Yes', 'No'],
          __v: 0 
        });
      });
  });

  it('updates a specific poll by id via PATCH', () => {
    return Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    })
      .then(poll => request(app).patch(`/api/v1/polls/${poll._id}`)
        .send({ title: 'drink water poll' }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'drink water poll',
          description: 'You drink water',
          options: ['Yes', 'No'],
          __v: 0 
        });
      });
  });

  it('deletes a specific poll by id via DELETE', () => {
    return Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    })
      .then(poll => request(app).delete(`/api/v1/polls/${poll._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'water poll',
          description: 'You drink water',
          options: ['Yes', 'No'],
          __v: 0 
        });
      });
  });
});
