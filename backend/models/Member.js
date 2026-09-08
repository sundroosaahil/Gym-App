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
  // Legacy field. Members created before the firstName/lastName split still
  // have this populated; new members won't. Kept temporarily so nothing
  // reading it directly breaks mid-migration — remove once every member has
  // been migrated and nothing references `name` anymore.
  name: {
    type: String
  },
  // Deliberately NOT required:true here. If it were, any existing member
  // who hasn't been migrated yet would fail validation the next time ANY
  // route calls .save() on them (e.g. Mark Paid) — crashing an unrelated
  // action in production. Required-ness for NEW members is enforced in the
  // POST /members route instead, where we control exactly when it applies.
  firstName: {
    type: String
  },
  // Optional on purpose — some members genuinely have a single name.
  lastName: {
    type: String,
    default: ''
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
  // Mode of the most recent payment. Optional — admin can leave it unset.
  // Not part of receiptSchema because receipts are only created when a
  // receipt number is entered, while paymentMode should be recordable
  // independent of that.
  paymentMode: {
    type: String,
    enum: ['cash', 'upi']
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