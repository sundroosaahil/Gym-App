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

module.exports = mongoose.model('AdminLog', adminLogSchema);