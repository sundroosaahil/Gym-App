// Central place to decide which member fields count as "missing" and how
// to show that to the admin. If you want to flag another field later
// (e.g. emergency contact), add ONE line to the `missing` array below —
// don't add a new conditional block in MemberCard.jsx / MemberRow.jsx.
export function getMissingDetails(member) {
  // A receipt entry now always exists once a payment is saved (see
  // memberRoutes.js — mark-paid and add-member push one even with no
  // receiptNo yet), so `receipts.length > 0` is no longer a useful signal
  // on its own. What actually matters is whether the MOST RECENT payment
  // has a receiptNo attached — that's the one still missing its paperwork.
  const latestReceipt = member.receipts && member.receipts.length > 0
    ? member.receipts[member.receipts.length - 1]
    : null;
  const hasReceipt = !!(latestReceipt && latestReceipt.receiptNo);

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