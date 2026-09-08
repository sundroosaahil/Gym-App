// Builds a human-readable name for logs, notifications, and receipts.
// Falls back to the legacy `name` field for members who haven't been
// migrated to firstName/lastName yet, so nothing shows up blank or
// "undefined" for old records mid-migration.
function getDisplayName(member) {
  const combined = `${member.firstName || ''} ${member.lastName || ''}`.trim();
  return combined || member.name || 'Unknown Member';
}

module.exports = getDisplayName;