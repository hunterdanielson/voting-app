const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true
  },
  options: [String]
});

schema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'option',
  count: true
});


schema.statics.notifyUsersInOrg = function(pollBody) {
  return Promise.all([
    this.create(pollBody),
    // in this below promise is where it would send the notification to all users in the organization
    this.model('User').find({ organization: pollBody.organization }).exec(console.log('you have a new message'))
  ])
    .then(([poll]) => poll);
};

module.exports = mongoose.model('Poll', schema);
