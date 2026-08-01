const AdminLog = require('../models/AdminLog');

async function logAction(action, details, adminEmail) {
  try {
    await AdminLog.create({ action, details, adminEmail });
  } catch (error) {
    console.error('Failed to write admin log:', error.message);
  }
}

module.exports = logAction;