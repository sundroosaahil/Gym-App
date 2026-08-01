const express = require('express');
const router = express.Router();
const AdminLog = require('../models/AdminLog');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;