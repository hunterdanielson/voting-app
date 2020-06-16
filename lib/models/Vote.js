const mongoose = require('mongoose');

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

module.exports = mongoose.model('Vote', schema);
