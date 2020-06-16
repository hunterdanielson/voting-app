const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
    }
  }, toObject: {
    virtuals: true
  }
});

schema.statics.deleteMemberVotes = function(id) {
  
  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany({ membership: id })
  ])
    .then(([membership]) => membership);
};

module.exports = mongoose.model('Membership', schema);
