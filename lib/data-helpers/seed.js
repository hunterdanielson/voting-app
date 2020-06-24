
const chance = require('chance').Chance();
const Membership = require('../lib/models/Membership');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const User = require('../lib/models/User');
const Vote = require('../lib/models/Vote');

module.exports = async({ organizations = 5, memberships = 10, polls = 15, users = 15, votes = 10 } = {}) => {
  const createdOrgs = await Organization.create([...Array(organizations)].map(() => ({
    title: chance.company(),
    description: chance.sentence(),
    imageUrl: chance.url()
  })));

  const createdUsers = await User.create([...Array(users)].map(() => ({
    name: chance.name(),
    phone: chance.phone(),
    email: chance.email(),
    password: chance.string(),
    communicationMedium: chance.pickone(['email', 'phone']),
    imageUrl: chance.url()
  })));

  await Membership.create([...Array(memberships)].map(() => ({
    organization: chance.pickone(createdOrgs)._id,
    user: chance.pickone(createdUsers)._id
  })));

  const createdPolls = await Poll.create([...Array(polls)].map(() => ({
    organization: chance.pickone(createdOrgs)._id,
    title: chance.name(),
    description: chance.paragraph(),
    options: ['option1', 'option2', 'option3']
  })));

  await Vote.create([...Array(votes)].map(() => ({
    poll: chance.pickone(createdPolls)._id,
    user: chance.pickone(createdUsers)._id,
    option: chance.pickone(['option1', 'option2', 'option3'])
  })));
};
