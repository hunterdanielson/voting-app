const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');

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

  // this test logs the error, which is huge
  // skipping it for now lets me look at other tests easier
  // but it still works
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

  it('gets specific org and all members by GET id', async() => {
    const org = await Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'random.png',
    });
    const user = await User.create({
      name: 'hunter',
      phone: '1234567890',
      email: 'fakeemail@gmail.com',
      communicationMedium: 'phone',
      imageUrl: 'pic.png'
    });
    await Membership.create(
      {
        organization: org._id,
        user: user._id
      });
    return request(app)
      .get(`/api/v1/organizations/${org._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          description: 'rand desc',
          imageUrl: 'random.png',
          title: 'random company',
          memberships: [{
            __v: 0,
            _id: expect.anything(),
            organization: org.id,
            user: user.id
          }]
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

  it('can del a org and all polls and votes associated by id via DELETE', async() => {
    const org = await Organization.create({
      title: 'random company',
      description: 'rand desc',
      imageUrl: 'random.png',
    });
    const poll = await Poll.create(
      {
        organization: org._id,
        title: 'water poll',
        description: 'You drink water',
        options: ['Yes', 'No']
      });
    const poll2 = await Poll.create(
      {
        organization: org._id,
        title: 'random poll',
        description: 'random word',
        options: ['Rand', 'Random']
      });
    const user = await User.create({
      name: 'hunter',
      phone: '1234567890',
      email: 'fakeemail@gmail.com',
      communicationMedium: 'phone',
      imageUrl: 'pic.png'
    });
    await Vote.create([{
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    }, {
      poll: poll2._id,
      user: user._id,
      option: 'Rand'
    }]);
      
    return request(app)
      .delete(`/api/v1/organizations/${org._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'random company',
          description: 'rand desc',
          imageUrl: 'random.png'
        });
        return Poll.find({ organization: org._id });
      })
      .then(polls => {
        expect(polls).toEqual([]);
      });
  });
});
