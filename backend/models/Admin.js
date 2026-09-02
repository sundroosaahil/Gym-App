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
  },
  fcmTokens: {
    type: [String],
    default: []
  },
  notificationPrefs: {
    memberPaid: { type: Boolean, default: true },
    newMember: { type: Boolean, default: true },
    dailyPending: { type: Boolean, default: true },
    dailyInactive: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);