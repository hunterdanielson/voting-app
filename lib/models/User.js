const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  phone: {
    type: Number,
    required: true,
    maxlength: 15
  },
  email: {
    type: String,
    required: true,
    maxlength: 50
  },
  communicationMedium: {
    type: String,
    required: true,
    enum: ['phone', 'email']
  },
  imageUrl: {
    type: String,
    maxlength: 50
  }
});

module.exports = mongoose.model('User', schema);
