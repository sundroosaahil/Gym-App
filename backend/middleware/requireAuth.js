const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { signToken, cookieOptions } = require('../utils/authToken');

async function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.adminId).select('email tokenVersion');
    if (!admin || admin.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: 'Session revoked, please log in again' });
    }

    req.adminId = admin._id;
    req.adminEmail = admin.email;

    // Sliding session: every authenticated request resets the 7-day clock,
    // so regular use never logs you out. A phone untouched for 7+ days will.
    res.cookie('token', signToken(admin), cookieOptions());

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = requireAuth;