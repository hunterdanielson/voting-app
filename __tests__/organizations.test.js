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
          imageUrl: 'random.png'
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

  it('gets all orgs title, imageUrl by GET', () => {
    return Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'random.png',
    })
      .then(() => request(app).get('/api/v1/organizations'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'random company',
          imageUrl: 'random.png'
        }]);
      });
  });

  it('gets specific org description by GET id', () => {
    return Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'random.png',
    })
      .then(organization => request(app).get(`/api/v1/organizations/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          description: 'rand desc'
        });
      });
  });

  it('updates a org by id via PATCH', () => {
    return Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'old.png',
    })
      .then(organization => {
        return request(app)
          .patch(`/api/v1/organizations/${organization._id}`)
          .send({ imageUrl: 'otherpic.png' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'random company',
          description: 'rand desc',
          imageUrl: 'otherpic.png'
        });
      });
  });

  it('can del a org by id via DELETE', () => {
    return Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'random.png',
    })
      .then(organization => {
        return request(app)
          .delete(`/api/v1/organizations/${organization._id}`)
          .send({ imageUrl: 'otherpic.png' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'random company',
          description: 'rand desc',
          imageUrl: 'random.png'
        });
      });
  });

});
