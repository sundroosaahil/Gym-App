const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String
  },
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);