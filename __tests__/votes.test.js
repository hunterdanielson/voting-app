const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Vote = require('../lib/models/Vote');
const Membership = require('../lib/models/Membership');
require('dotenv').config();

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

  let poll;
  beforeEach(async() => {
    poll = await Poll.create({
      organization: organization._id,
      title: 'water poll',
      description: 'do you drink water',
      options: ['Yes', 'No']
    });
  });

  let user;
  beforeEach(async() => {
    user = await User.create({
      name: 'hunter',
      phone: '1234567890',
      password: 'password123',
      email: 'newfakeemail@gmail.com',
      communicationMedium: 'phone',
      imageUrl: 'pic.png',
    });
  });

  beforeEach(async() => {
    await Membership.create({
      user: user._id,
      organization: organization._id
    });
  });

  const agent = request.agent(app);
  beforeEach(() => {
    return agent
      .post('/api/v1/users/login')
      .send({
        email: 'newfakeemail@gmail.com',
        password: 'password123'
      });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });
  
  it('creates a vote via if they are a member POST', () => {
    return agent
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: 'Yes'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'Yes',
          __v: 0
        });
      });
  });

  it('fails to create a vote if not a member via POST', async() => {
    const nonMember = await User.create({
      name: 'nonmember',
      phone: '111111111',
      password: 'pass123',
      email: 'l@gmail.com',
      communicationMedium: 'phone',
      imageUrl: 'pic.png',
    });
    const newAgent = request.agent(app);
    await newAgent
      .post('/api/v1/users/login')
      .send({
        email: 'l@gmail.com',
        password: 'pass123'
      });

    return newAgent
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: nonMember._id,
        option: 'Yes'
      })
      .then(res => {
        expect(res.body).toEqual({
          message: 'Not a member',
          status: 500
        });
      });
  });

  it('only allows a user to create one vote on a poll', async() => {
    await Vote.create({
      poll: poll._id,
      user: user._id,
      option: 'No'
    });

    return agent
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user._id,
        option: 'Yes'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'Yes',
          __v: 0
        });
      });
  });

  it('gets all votes by poll via GET', () => {
    return Vote.create({
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    })
      .then(() => agent.get(`/api/v1/votes?poll=${poll.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          __v: 0,
          user: {
            _id: user.id
          },
          option: 'Yes',
          poll: poll.id
        }]);
      });
  });

  it('gets all votes by user via GET', () => {
    return Vote.create({
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    })
      .then(() => agent.get(`/api/v1/votes?user=${user.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          __v: 0,
          user: {
            _id: user.id
          },
          option: 'Yes',
          poll: poll.id
        }]);
      });
  });

  it('gets a vote by vote id via GET', () => {
    return Vote.create({
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    })
      .then(vote => agent.get(`/api/v1/votes/${vote._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          __v: 0,
          user: {
            _id: user.id
          },
          option: 'Yes',
          poll: poll.id
        });
      });
  });

  it('updates a vote via PATCH', () => {
    return Vote.create({
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    })
      .then(vote => agent.patch(`/api/v1/votes/${vote._id}`)
        .send({ option: 'No' }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          __v: 0,
          user: user.id,
          option: 'No',
          poll: poll.id
        });
      });
  });

  it('deletes a vote via DELETE', () => {
    return Vote.create({
      poll: poll._id,
      user: user._id,
      option: 'Yes'
    })
      .then(vote => agent.delete(`/api/v1/votes/${vote._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          __v: 0,
          user: user.id,
          option: 'Yes',
          poll: poll.id
        });
      });
  });
});
