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

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'water company',
      description: 'we make water',
      imageUrl: 'water.png'
    });
    return mongoose.connection.dropDatabase();
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
          organization: expect.anything(),
          title: 'water poll',
          description: 'do you drink water',
          options: ['Yes', 'No'],
          __v: 0
        });
      });
  });

  it('gets all polls via GET', () => {
    return Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    })
      .then(() => request(app).get('/api/v1/polls'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'water poll'
        }]);
      });
  });

  // it('updates a poll by id via PATCH', () => {
  //   return Poll.create({
  //     name: 'hunter',
  //     phone: '1234567890',
  //     email: 'fakeemail@gmail.com',
  //     communicationMedium: 'phone',
  //     imageUrl: 'pic.png'
  //   })
  //     .then(poll => {
  //       return request(app)
  //         .patch(`/api/v1/polls/${poll._id}`)
  //         .send({ email: 'newfakeemail@gmail.com' });
  //     })
  //     .then(res => {
  //       expect(res.body).toEqual({
  //         _id: expect.anything(),
  //         name: 'hunter',
  //         phone: '1234567890',
  //         email: 'newfakeemail@gmail.com',
  //         communicationMedium: 'phone',
  //         imageUrl: 'pic.png',
  //         __v: 0
  //       });
  //     });
  // });

  // it('can del a poll by id via DELETE', () => {
  //   return Poll.create({
  //     name: 'hunter',
  //     phone: '1234567890',
  //     email: 'fakeemail@gmail.com',
  //     communicationMedium: 'phone',
  //     imageUrl: 'pic.png'
  //   })
  //     .then(poll => {
  //       return request(app)
  //         .delete(`/api/v1/polls/${poll._id}`)
  //         .send({ imageUrl: 'otherpic.png' });
  //     })
  //     .then(res => {
  //       expect(res.body).toEqual({
  //         _id: expect.anything(),
  //         name: 'hunter',
  //         phone: '1234567890',
  //         email: 'fakeemail@gmail.com',
  //         communicationMedium: 'phone',
  //         imageUrl: 'pic.png',
  //         __v: 0
  //       });
  //     });
  // });
});
