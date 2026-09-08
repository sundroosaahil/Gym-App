// Builds a display name from firstName/lastName, trimming so a blank
// lastName (legacy single-name members like "Adil") doesn't leave a
// trailing space anywhere it's used — cards, rows, receipts, dialogs, logs.
export function getDisplayName(member) {
  return `${member.firstName || ''} ${member.lastName || ''}`.trim();
}