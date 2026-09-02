const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const Admin = require('../models/Admin');
const requireAuth = require('../middleware/requireAuth');
const logAction = require('../utils/logAction');
const { getDeviceInfo } = require('../utils/deviceInfo');
const { signToken, cookieOptions } = require('../utils/authToken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, deviceModel } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length > 128
    ) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const admin = await Admin.findOne({ email });

    // No account, or a Google-only account with no password set —
    // same generic error either way, so we don't reveal which case it is.
    if (!admin || !admin.passwordHash) {
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

// Verifies a Google OAuth access token (used by the "choose a different
// account" flow, which requests an access token via prompt: 'select_account'
// rather than the personalized ID-token button). We check the token against
// Google's tokeninfo endpoint rather than trusting the client, confirming it
// was actually issued for our client_id and that the email is verified.
async function verifyGoogleAccessToken(accessToken) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
  );
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`tokeninfo rejected access token (${response.status}): ${body}`);
  }
  const info = await response.json();
  if (info.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error(`Access token aud "${info.aud}" does not match GOOGLE_CLIENT_ID`);
  }
  return info;
}

router.post('/google', loginLimiter, async (req, res) => {
  try {
    const { credential, accessToken, deviceModel } = req.body;

    if (typeof credential !== 'string' && typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'Missing Google credential' });
    }

    let payload;
    try {
      if (typeof credential === 'string') {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
      } else {
        payload = await verifyGoogleAccessToken(accessToken);
      }
    } catch (err) {
      console.error('Google sign-in verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid Google sign-in' });
    }

    if (!payload.email_verified && payload.email_verified !== 'true') {
      return res.status(401).json({ error: 'Google email not verified' });
    }

    const admin = await Admin.findOne({ email: payload.email });
    if (!admin) {
      return res.status(403).json({ error: 'This Google account is not authorized as an admin' });
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

router.post('/fcm-token', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ error: 'Invalid token' });
    }
    await Admin.findByIdAndUpdate(req.adminId, { $addToSet: { fcmTokens: token } });
    res.json({ message: 'Token saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notification-prefs', requireAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('notificationPrefs');
    res.json(admin.notificationPrefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notification-prefs', requireAuth, async (req, res) => {
  try {
    const { memberPaid, newMember, dailyPending, dailyInactive } = req.body;
    const admin = await Admin.findById(req.adminId);
    admin.notificationPrefs = {
      memberPaid: !!memberPaid,
      newMember: !!newMember,
      dailyPending: !!dailyPending,
      dailyInactive: !!dailyInactive
    };
    await admin.save();
    res.json(admin.notificationPrefs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;