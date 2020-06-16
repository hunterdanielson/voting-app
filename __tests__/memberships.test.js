const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');
const Vote = require('../lib/models/Vote');
const Poll = require('../lib/models/Poll');
require('dotenv').config();

describe('membership routes', () => {
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

  const agent = request.agent(app);
  beforeEach(() => {
    return agent
      .post('/api/v1/users/login')
      .send({
        email: 'test@gmail.com',
        password: 'testpassword'
      });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });
  
  it('creates a membership via POST', () => {
    return agent
      .post('/api/v1/memberships')
      .send({
        organization: organization._id,
        user: user._id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });

  it('gets all memberships for an org using query via GET', () => {
    return Membership.create({
      organization: organization._id,
      user: user._id
    })
      .then(() => agent.get(`/api/v1/memberships?organization=${organization.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          __v: 0,
          organization: {
            _id: organization.id,
            title: 'water company',
            imageUrl: 'water.png'
          },
          user: {
            _id: user.id,
            name: 'test',
            imageUrl: 'testpic.png'
          }
        }]);
      });
  });

  it('gets all memberships for a user using query via GET', () => {
    return Membership.create({
      organization: organization._id,
      user: user._id
    })
      .then(() => agent.get(`/api/v1/memberships?user=${user.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          __v: 0,
          organization: {
            _id: organization.id,
            title: 'water company',
            imageUrl: 'water.png'
          },
          user: {
            _id: user.id,
            name: 'test',
            imageUrl: 'testpic.png'
          }
        }]);
      });
  });

  it('deletes a membership and all associated votes via DELETE', async() => {
    const poll = await Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'You drink water',
      options: ['Yes', 'No']
    });
    const poll2 = await Poll.create({
      organization: organization._id,
      title: 'food poll',
      description: 'You eat food',
      options: ['Yes', 'No']
    });
    await Vote.create([{
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    }, {
      poll: poll2._id,
      user: user._id,
      option: 'No'
    }]);
    const member = await Membership.create({
      organization: organization._id,
      user: user._id
    });

    return agent
      .delete(`/api/v1/memberships/${member._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          __v: 0,
          organization: organization.id,
          user: user.id
        });
        return Vote.find({ membership: member._id });
      })
      .then(vote => {
        expect(vote).toEqual([]);
      });
  });
});
