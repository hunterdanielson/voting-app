const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
require('dotenv').config();

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });


  beforeEach(async() => {
    return mongoose.connection.dropDatabase();
  });

  beforeEach(async() => {
    await User.create({
      name: 'test',
      phone: '1234567899',
      email: 'test@gmail.com',
      password: 'testpassword',
      communicationMedium: 'phone',
      imageUrl: 'testpic.png'
    });
  });

  const agent = request.agent(app);
  beforeEach(() => {
    return agent
      .post('/api/v1/users/login')
      .send({
        email: 'test@gmail.com',
        password: 'testpassword'
      });
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

    return agent
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
      .then(() => agent.get(`/api/v1/polls?organization=${organization.id}`))
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
      .then(poll => agent.get(`/api/v1/polls/${poll._id}`))
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
      .then(poll => agent.patch(`/api/v1/polls/${poll._id}`)
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

  it('deletes a specific poll by id via DELETE', async() => {
    const poll = await Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    });

    return agent
      .delete(`/api/v1/polls/${poll._id}`)
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
