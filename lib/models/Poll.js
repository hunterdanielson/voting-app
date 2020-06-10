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
  options: {
    type: String,
    enum: ['Agree', 'Neither', 'Disagree']
  }
});

module.exports = mongoose.model('Poll', schema);
