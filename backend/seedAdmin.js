const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Admin = require('./models/Admin');

async function addAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SEED_ADMIN_EMAIL;
  const name = process.env.SEED_ADMIN_NAME;
  const plainPassword = process.env.SEED_ADMIN_PASSWORD; // optional — leave unset for a Google-only admin

  if (!email || !name) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_NAME in your .env file first.');
    process.exit(1);
  }

  const passwordHash = plainPassword ? await bcrypt.hash(plainPassword, 10) : undefined;

  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.name = name;
    if (passwordHash) existing.passwordHash = passwordHash; // only touches password if one was given
    await existing.save();
    console.log('Updated:', name, `(${email})`, passwordHash ? '[password set]' : '[unchanged]');
    process.exit();
  }

  const admin = new Admin({ email, name, passwordHash });
  await admin.save();

  console.log('Admin created:', name, `(${email})`, passwordHash ? '[password set]' : '[Google-only]');
  process.exit();
}

addAdmin();
// Google-only admin: set SEED_ADMIN_EMAIL and SEED_ADMIN_NAME, leave SEED_ADMIN_PASSWORD unset.
// Password admin (old style, still supported): also set SEED_ADMIN_PASSWORD.
// Run: node seedAdmin.js