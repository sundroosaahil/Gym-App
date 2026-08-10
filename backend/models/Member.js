const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
  },
  amount: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const memberSchema = new mongoose.Schema({
  gymCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  residence: {
    type: String
  },
  phone: {
    type: String
  },
  amountPaid: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  renewalIntent: {
    type: String,
    enum: ['continuing', 'not_renewing'],
    default: 'continuing'
  },
  receipts: [receiptSchema],
  contactLog: [
    {
      note: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);