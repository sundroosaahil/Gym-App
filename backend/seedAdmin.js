const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Admin = require('./models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.env.SEED_ADMIN_EMAIL;
  const plainPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !plainPassword) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env file first.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const admin = new Admin({ email, passwordHash });
  await admin.save();

  console.log('Admin created:', email);
  process.exit();
}

createAdmin();