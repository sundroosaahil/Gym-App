const express = require('express');
const router = express.Router();
const AdminLog = require('../models/AdminLog');
const Admin = require('../models/Admin');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(200).lean();

    const admins = await Admin.find().select('email name').lean();
    const nameByEmail = new Map(admins.map((admin) => [admin.email, admin.name]));

    const enrichedLogs = logs.map((log) => ({
      ...log,
      adminName: nameByEmail.get(log.adminEmail) || log.adminEmail
    }));

    res.json(enrichedLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contribution counts per admin — how many logs exist under each admin's
// name, across everything currently in the collection. Deliberately NOT
// scoped by the /logs list's 200-doc cap: this aggregates the full
// collection so the comparison stays accurate even when total log volume
// exceeds 200. Because AdminLog has a 60-day TTL, "all logs" already means
// "activity in roughly the last 60 days" with no extra date filtering needed.
router.get('/contributions', async (req, res) => {
  try {
    const counts = await AdminLog.aggregate([
      { $group: { _id: '$adminEmail', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const admins = await Admin.find().select('email name').lean();
    const nameByEmail = new Map(admins.map((admin) => [admin.email, admin.name]));

    const contributions = counts.map((c) => ({
      adminEmail: c._id,
      adminName: nameByEmail.get(c._id) || c._id,
      count: c.count
    }));

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;