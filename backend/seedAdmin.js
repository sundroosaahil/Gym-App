const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Admin = require('./models/Admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin2@bodyworks.com';
  const plainPassword = 'bodyworksadmin2';

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const admin = new Admin({ email, passwordHash });
  await admin.save();

  console.log('Admin created:', email);
  process.exit();
}

createAdmin();