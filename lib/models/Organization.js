const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 15
  },
  imageUrl: {
    type: String,
    maxlength: 50
  }
});

module.exports = mongoose.model('Organization', schema);
