const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  adminEmail: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Auto-delete logs 30 days after creation.
// MongoDB checks this in the background roughly every 60 seconds — no manual cleanup needed.
adminLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AdminLog', adminLogSchema);