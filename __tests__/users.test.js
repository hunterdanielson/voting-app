const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
require('dotenv').config();

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
  let user;
  beforeEach(async() => {
    user = await User.create({
      name: 'test',
      phone: '1234567899',
      email: 'test@gmail.com',
      password: 'testpassword',
      communicationMedium: 'phone',
      imageUrl: 'testpic.png'
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('can sign up a new user via POST', () => {
    return request(app)
      .post('/api/v1/users/signup')
      .send({
        name: 'hunter',
        phone: '1234567890',
        email: 'fakeemail@gmail.com',
        password: 'password',
        communicationMedium: 'phone',
        imageUrl: 'pic.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'hunter',
          phone: '1234567890',
          email: 'fakeemail@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'pic.png'
        });
      });
  });

  it('can login a user via POST', () => {
    return request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'test@gmail.com',
        password: 'testpassword'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'test',
          phone: '1234567899',
          email: 'test@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'testpic.png'
        });
      });
  });

  it('can verify a user via GET', () => {
    const agent = request.agent(app);
    
    return agent
      .post('/api/v1/users/login')
      .send({
        email: 'test@gmail.com',
        password: 'testpassword'
      })
      .then(() => {
        return agent
          .get('/api/v1/users/verify');
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: 'test',
          phone: '1234567899',
          email: 'test@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'testpic.png'
        });
      });
  });

  it('gets specific user and all orgs they are part of by id via GET', () => {
   
    return request(app).get(`/api/v1/users/${user._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'test',
          phone: '1234567899',
          email: 'test@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'testpic.png',
          organizations: []
        });
      });
  });

  it('updates a user by id via PATCH', () => {
    return request(app)
      .patch(`/api/v1/users/${user._id}`)
      .send({ imageUrl: 'newpic.png' })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'test',
          phone: '1234567899',
          email: 'test@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'newpic.png'
        });
      });
  });

  it('can del a org by id via DELETE', () => {

     
    return request(app)
      .delete(`/api/v1/users/${user._id}`)
      .send({ imageUrl: 'otherpic.png' })
     
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'test',
          phone: '1234567899',
          email: 'test@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'testpic.png'
        });
      });
  });
});
