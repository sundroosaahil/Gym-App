const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  // Bump this to instantly invalidate every existing session for this admin
  // (e.g. lost phone). Existing tokens fail the check in requireAuth even
  // though they haven't technically expired yet.
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);