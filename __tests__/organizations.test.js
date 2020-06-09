const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');

describe('organization routes', () => {
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

  it('can create a org by POST', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        title: 'random company',
        description: 'rand desc',
        imageUrl: 'random.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'random company',
          description: 'rand desc',
          imageUrl: 'random.png',
          __v: 0
        });
      });
  });

  it('can fails to create with bad data by POST', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        name: 'random company',
        description: 'rand desc',
        imageUrl: 'random.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          status: 400,
          message: 'Organization validation failed: title: Path `title` is required.'
        });
      });
  });

  it('gets all org data by GET', () => {
    return Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'random.png',
    })
      .then(() => request(app).get('/api/v1/organizations'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'random company'
        }]);
      });
  });

});
