require('../lib/data-helpers/seedMemoryServer');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Vote = require('../lib/models/Vote');
const Membership = require('../lib/models/Membership');

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
    options: ['option1', 'option2', 'option3']
  });
});

let user;
let user2;
beforeEach(async() => {
  user = await User.create({
    name: 'hunter',
    phone: '1234567890',
    password: 'password123',
    email: 'newfakeemail@gmail.com',
    communicationMedium: 'phone',
    imageUrl: 'pic.png',
  });
  user2 = await User.create({
    name: 'h',
    phone: '2222222222',
    password: 'pass',
    email: 'l@gmail.com',
    communicationMedium: 'email',
    imageUrl: 'picture.png',
  });
});

beforeEach(async() => {
  await Membership.create({
    user: user._id,
    organization: organization._id
  });
  await Membership.create({
    user: user2._id,
    organization: organization._id
  });

  await Vote.create({
    poll: poll._id,
    user: user._id,
    option: 'option1'
  });
  await Vote.create({
    poll: poll._id,
    user: user2._id,
    option: 'option1'
  });
});

describe('aggregation tests', () => {
  it('will count the number of votes on a poll', async() => {
    const expected = [{ '_id': expect.anything(), 'count': expect.any(Number) }];
    return request(app)
      .get('/api/v1/votes/vote-count')
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining(expected));
      });
  });
  // works on compass but needs jwt locally
  // it('will get the count of each option on a poll', async() => {
  //   return request(app)
  //     .get(`/api/v1/votes/option-count${poll._id}`)
  //     .then(res => {
  //       expect(res.body).toEqual('something');
  //     });
  // });
});
