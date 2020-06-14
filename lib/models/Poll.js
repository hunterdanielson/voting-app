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

// if we need to delete poll and associated votes
// schema.statics.deletePollVotes = function(id) {
//   return Promise.all([
//     this.findByIdAndDelete(id),
//     this.model('Vote').deleteMany({ poll: id })
//   ])
//     .then(([poll]) => poll);
// };

module.exports = mongoose.model('Poll', schema);
