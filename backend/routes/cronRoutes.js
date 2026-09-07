const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const calculateStatus = require('../utils/calculateStatus');
const sendNotificationToAdmins = require('../utils/sendNotification');

// Triggered by an external scheduler (cron-job.org), not by anything inside
// this app — Render's free tier can't be trusted to wake itself up on time.
router.post('/daily-digest', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const members = await Member.find();
    let pending = 0;
    let inactive = 0;

    members.forEach((m) => {
      const { status } = calculateStatus(m);
      if (status === 'pending') pending++;
      if (status === 'inactive') inactive++;
    });

    if (pending > 0) {
      await sendNotificationToAdmins(
        'dailyPending',
        'Pending Renewals',
        `${pending} member${pending === 1 ? '' : 's'} pending renewal`,
        { type: 'daily_pending' }
      );
    }
    if (inactive > 0) {
      await sendNotificationToAdmins(
        'dailyInactive',
        'Inactive Members',
        `${inactive} member${inactive === 1 ? '' : 's'} inactive`,
        { type: 'daily_inactive' }
      );
    }

    res.json({ pending, inactive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;