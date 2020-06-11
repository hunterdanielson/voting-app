const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id,
      delete ret.__v;
    }
  },
  toObject: {
    virtuals: true
  }
});

schema.virtual('polls', {
  ref: 'Poll',
  localField: '_id',
  foreignField: 'organization'
});

schema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'organization'
});

schema.statics.deleteOrgPolls = async function(id) {
  // get the schema for poll
  const Poll = this.model('Poll');
  // make array of all polls with same org id
  const polls = await Poll.find({ organization: id });

  const deletePollPromises = polls.map(poll => Poll.deletePollVotes(poll._id));

  return Promise.all([
    this.findByIdAndDelete(id),
    ...deletePollPromises
  ])
    .then(([organization]) => organization);
};

module.exports = mongoose.model('Organization', schema);
