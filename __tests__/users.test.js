const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('user routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });


  it('gets specific user description by id via GET', () => {
    return User.create({
      name: 'hunter',
      phone: '1234567890',
      email: 'fakeemail@gmail.com',
      communicationMedium: 'phone',
      imageUrl: 'pic.png'
    })
      .then(user => request(app).get(`/api/v1/users/${user._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'hunter',
          phone: '1234567890',
          email: 'fakeemail@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'pic.png',
          __v: 0
        });
      });
  });

  // it('updates a org by id via PATCH', () => {
  //   return User.create({
  //     title: 'random company',
  //     description: 'rand desc',
  //     imageUrl: 'old.png',
  //   })
  //     .then(organization => {
  //       return request(app)
  //         .patch(`/api/v1/organizations/${organization._id}`)
  //         .send({ imageUrl: 'otherpic.png' });
  //     })
  //     .then(res => {
  //       expect(res.body).toEqual({
  //         _id: expect.anything(),
  //         title: 'random company',
  //         description: 'rand desc',
  //         imageUrl: 'otherpic.png',
  //         __v: 0
  //       });
  //     });
  // });

  // it('can del a org by id via DELETE', () => {
  //   return User.create({
  //     name: 'hunter',
  //     phone: '1234567890'
  //   })
  //     .then(organization => {
  //       return request(app)
  //         .delete(`/api/v1/organizations/${organization._id}`)
  //         .send({ imageUrl: 'otherpic.png' });
  //     })
  //     .then(res => {
  //       expect(res.body).toEqual({
  //         _id: expect.anything(),
  //         title: 'random company',
  //         description: 'rand desc',
  //         imageUrl: 'random.png',
  //         __v: 0
  //       });
  //     });
  // });

});
