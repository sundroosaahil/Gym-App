const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const requireAuth = require('../middleware/requireAuth');
const logAction = require('../utils/logAction');
const { getDeviceInfo } = require('../utils/deviceInfo');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, deviceModel } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'strict',
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

router.get('/me', requireAuth, (req, res) => {
  res.json({ adminId: req.adminId });
});

module.exports = router;