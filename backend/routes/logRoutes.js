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

module.exports = router;