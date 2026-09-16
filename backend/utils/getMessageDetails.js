// Central place to decide which member fields count as "missing" and how
// to show that to the admin. If you want to flag another field later
// (e.g. emergency contact), add ONE line to the `missing` array below —
// don't add a new conditional block in MemberCard.jsx / MemberRow.jsx.
export function getMissingDetails(member) {
  const hasReceipt = member.receipts && member.receipts.length > 0;

  const missing = [
    !member.lastName && 'last name',
    !member.residence && 'address',
    !member.phone && 'phone number',
    !hasReceipt && 'receipt',
  ].filter(Boolean);

  if (missing.length === 0) {
    return { missing, color: null, message: null };
  }

  // A missing receipt means money isn't tracked properly — that's urgent
  // (red). Everything else is just an incomplete profile (blue).
  const isUrgent = missing.includes('receipt');
  const color = isUrgent ? 'red' : 'blue';

  const message = missing.length === 1 ? `Edit to add ${missing[0]}` : 'Edit details';

  return { missing, color, message };
}