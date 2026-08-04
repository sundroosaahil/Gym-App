const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const calculateStatus = require('../utils/calculateStatus');
const requireAuth = require('../middleware/requireAuth');
const logAction = require('../utils/logAction');

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { name, residence, phone, amountPaid, startDate, durationDays } = req.body;

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
      // omit phone entirely if blank, so the sparse unique index
      // doesn't collide with other members who also have no phone
      ...(phone ? { phone } : {}),
      amountPaid,
      startDate: start,
      endDate: end
    });

    await member.save();
    await logAction('Added Member', `${member.name} (${member.gymCode})`, req.adminEmail);
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

// UPDATE a member
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Treat an empty phone string as "no phone" — unset the field entirely
    // (rather than storing ""), so the sparse unique index doesn't collide
    // with other members whose phone was also cleared
    const updateOps = { $set: updateData };
    if (updateData.phone === '') {
      delete updateData.phone;
      updateOps.$unset = { phone: '' };
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      updateOps,
      { new: true, runValidators: true }
    );
    if (!updatedMember) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await logAction('Edited Member', `${updatedMember.name} (${updatedMember.gymCode})`, req.adminEmail);
    res.json(updatedMember);
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
    const { durationDays, amountPaid } = req.body;
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const today = new Date();
    const currentEnd = new Date(member.endDate);
    const baseDate = currentEnd > today ? currentEnd : today;

    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + Number(durationDays));

    member.startDate = baseDate;
    member.endDate = newEndDate;
    member.amountPaid = amountPaid;
    member.renewalIntent = 'continuing';

    await member.save();
    await logAction(
      'Marked Paid',
      `${member.name} (${member.gymCode}) — ₹${amountPaid}, ${durationDays} days`,
      req.adminEmail
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