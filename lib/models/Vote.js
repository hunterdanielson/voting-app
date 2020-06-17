const mongoose = require('mongoose');
const memberships = require('../routes/memberships');

const schema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  option: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
    }
  }
});

schema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'vote'
});

schema.statics.createIfValidMember = async function(vote, loggedInUser) {
  const poll = await this.model('Poll').findById(vote.poll);
  const membership = await this.model('Membership').findOne({ user: loggedInUser._id, organization: poll.organization });
  if(!membership) throw new Error('Not a member');
  return this.findOneAndUpdate(
    { poll: vote.poll, user: loggedInUser._id }, 
    { ...vote, user: loggedInUser._id }, 
    { new: true, upsert: true });
};

module.exports = mongoose.model('Vote', schema);
