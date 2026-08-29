const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const requireAuth = require('../middleware/requireAuth');
const logAction = require('../utils/logAction');
const { getDeviceInfo } = require('../utils/deviceInfo');
const { signToken, cookieOptions } = require('../utils/authToken');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, deviceModel } = req.body;

    // Type + length guard — closes NoSQL operator injection on `email`
    // (rejects objects like { "$ne": null }) and stops oversized `password`
    // strings from being fed into bcrypt (long-password DoS).
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length > 128
    ) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.cookie('token', signToken(admin), cookieOptions());

    const device = getDeviceInfo(req.headers['user-agent'], deviceModel);
    await logAction('Logged In', device, admin.email);

    res.json({ message: 'Logged in successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  const token = req.cookies.token;
  const { deviceModel } = req.body || {};

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const device = getDeviceInfo(req.headers['user-agent'], deviceModel);
      await logAction('Logged Out', device, decoded.email);
    } catch (error) {
      // token invalid/expired — nothing meaningful to log
    }
  }

  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

router.post('/logout-all', requireAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    admin.tokenVersion += 1;
    await admin.save();

    const { deviceModel } = req.body || {};
    const device = getDeviceInfo(req.headers['user-agent'], deviceModel);
    await logAction('Logged Out (All Devices)', device, admin.email);

    res.clearCookie('token');
    res.json({ message: 'Logged out of all devices' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ adminId: req.adminId });
});

module.exports = router;