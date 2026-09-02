const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const calculateStatus = require('../utils/calculateStatus');
const requireAuth = require('../middleware/requireAuth');
const logAction = require('../utils/logAction');
const sendNotificationToAdmins = require('../utils/sendNotification');

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { name, residence, phone, amountPaid, startDate, durationDays, receiptNo } = req.body;

    const lastMember = await Member.findOne().sort({ gymCode: -1 });

    let nextCodeNumber = 1;
    if (lastMember) {
      nextCodeNumber = parseInt(lastMember.gymCode) + 1;
    }
    const gymCode = String(nextCodeNumber).padStart(4, '0');

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(durationDays));

    const member = new Member({
      gymCode,
      name,
      residence,
      phone,
      amountPaid,
      startDate: start,
      endDate: end,
      receipts: receiptNo ? [{ receiptNo, amount: amountPaid }] : []
    });

    await member.save();
    await logAction('Added Member', `${member.name} (${member.gymCode})`, req.adminEmail);
        sendNotificationToAdmins(
      'newMember',
      'New Member Added',
      `${member.name} (${member.gymCode}) joined`,
      { type: 'new_member', memberId: member._id.toString() }
    );
    res.status(201).json(member);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ gymCode: 1 });

    const membersWithStatus = members.map((member) => {
      const { status, daysPastExpiry } = calculateStatus(member);
      return {
        ...member.toObject(),
        status,
        daysPastExpiry
      };
    });

    res.json(membersWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for existing member(s) with the same name AND residence (case-insensitive).
// Used by the Add Member form to warn the admin before creating a duplicate.
// Matching on name alone would false-positive on common names in different
// areas (e.g. two "Saahil"s — one Kashmir, one Delhi); matching on phone
// doesn't work since many members share placeholder numbers.
// Must be defined before GET /:id, or Express treats "check-duplicate" as an id.
router.get('/check-duplicate', async (req, res) => {
  try {
    const { name, residence } = req.query;
    const trimmedResidence = typeof residence === 'string' ? residence.trim() : '';
    if (typeof name !== 'string' || !name.trim() || !trimmedResidence) {
      // Can't disambiguate without a residence — skip rather than flooding
      // the admin with false positives from every same-named, no-address member.
      return res.json({ matches: [] });
    }

    const matches = await Member.find({ name: name.trim(), residence: trimmedResidence })
      .collation({ locale: 'en', strength: 2 }) // case-insensitive exact match, no regex
      .select('name gymCode residence');

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET one member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a member (correction, not a new payment)
router.put('/:id', async (req, res) => {
  try {
    const { name, residence, phone, amountPaid, receiptNo } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.name = name;
    member.residence = residence;
    member.phone = phone;
    member.amountPaid = amountPaid;

    if (receiptNo) {
      if (member.receipts.length > 0) {
        member.receipts[member.receipts.length - 1].receiptNo = receiptNo;
      } else {
        member.receipts.push({ receiptNo, amount: amountPaid });
      }
    }

    await member.save();
    await logAction('Edited Member', `${member.name} (${member.gymCode})`, req.adminEmail);
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a member
router.delete('/:id', async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await logAction('Deleted Member', `${deletedMember.name} (${deletedMember.gymCode})`, req.adminEmail);
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark member as paid — extend membership
router.put('/:id/mark-paid', async (req, res) => {
  try {
    const { durationDays, amountPaid, receiptNo, mode } = req.body;

    if (!mode || !['reset', 'renewal'].includes(mode)) {
      return res.status(400).json({ error: 'mode is required and must be "reset" or "renewal"' });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const today = new Date();
    const currentEnd = new Date(member.endDate);

    // reset   -> new cycle starts today (member didn't use the gym during the gap)
    // renewal -> new cycle starts from old due date (recovers days already used, or extends an active member cleanly)
    const baseDate = mode === 'renewal' ? currentEnd : today;

    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + Number(durationDays));

    member.startDate = baseDate;
    member.endDate = newEndDate;
    member.amountPaid = amountPaid;
    member.renewalIntent = 'continuing';

    if (receiptNo) {
      member.receipts.push({ receiptNo, amount: amountPaid });
    }

    await member.save();
    await logAction(
      'Marked Paid',
      `${member.name} (${member.gymCode}) — ₹${amountPaid}, ${durationDays} days, mode: ${mode}${receiptNo ? `, Receipt #${receiptNo}` : ''}`,
      req.adminEmail
    );
        sendNotificationToAdmins(
      'memberPaid',
      'Payment Received',
      `${member.name} (${member.gymCode}) — ₹${amountPaid}`,
      { type: 'member_paid', memberId: member._id.toString() }
    );
    res.json(member);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mark member as not renewing
router.put('/:id/not-renewing', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { renewalIntent: 'not_renewing' },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await logAction('Marked Not Renewing', `${member.name} (${member.gymCode})`, req.adminEmail);
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reactivate (undo not-renewing)
router.put('/:id/reactivate', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { renewalIntent: 'continuing' },
      { new: true }
    );
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await logAction('Reactivated', `${member.name} (${member.gymCode})`, req.adminEmail);
    res.json(member);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;