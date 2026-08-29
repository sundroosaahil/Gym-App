const jwt = require('jsonwebtoken');

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function signToken(admin) {
  return jwt.sign(
    { adminId: admin._id, email: admin.email, tokenVersion: admin.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: COOKIE_MAX_AGE
  };
}

module.exports = { signToken, cookieOptions };