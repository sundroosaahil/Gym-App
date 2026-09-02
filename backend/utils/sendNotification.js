require('./firebaseAdmin'); // ensures the Firebase app is initialized first
const { getMessaging } = require('firebase-admin/messaging');
const Admin = require('../models/Admin');

// prefKey: which notificationPrefs field must be true for an admin to receive this.
// Pass null to notify all admins regardless of prefs.
async function sendNotificationToAdmins(prefKey, title, body, data = {}) {
  const filter = prefKey ? { [`notificationPrefs.${prefKey}`]: true } : {};
  const admins = await Admin.find(filter).select('fcmTokens');

  const tokens = [...new Set(admins.flatMap((a) => a.fcmTokens))];
  if (tokens.length === 0) return;

  try {
    const response = await getMessaging().sendEachForMulticast({
      notification: { title, body },
      data,
      tokens
    });

    const deadTokens = [];
    response.responses.forEach((res, idx) => {
      const code = res.error?.code;
      if (
        !res.success &&
        (code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token')
      ) {
        deadTokens.push(tokens[idx]);
      }
    });
    if (deadTokens.length > 0) {
      await Admin.updateMany({}, { $pull: { fcmTokens: { $in: deadTokens } } });
    }
  } catch (err) {
    console.error('FCM send error:', err.message);
  }
}

module.exports = sendNotificationToAdmins;