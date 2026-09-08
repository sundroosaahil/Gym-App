// Turns a member's status + daysPastExpiry into the label/colour the UI shows.
//
// daysPastExpiry is negative while a membership is still running (days
// remaining), 0 on the day it's due (still 'active' — they haven't missed
// a day yet), 1-7 while it's in the pending/grace window, and positive once
// it's properly lapsed — see backend/utils/calculateStatus.js.
//
// IMPORTANT: a member can be marked "not_renewing" at ANY point, including
// while their membership is still active. That means daysPastExpiry can be
// negative (or zero) even when status is 'not_renewing' — it does NOT imply
// overdue. This is why 'not_renewing' needs its own branch instead of being
// lumped in with 'inactive' (which is always genuinely overdue).
export function getRenewalLabel(member) {
  const days = member.daysPastExpiry;

  if (member.status === 'active') {
    if (days === 0) {
      return { text: 'Renewal today', colorClass: 'text-[#C6FF3D]' };
    }
    const daysRemaining = Math.abs(days);
    return {
      text: `Renewal in: ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
      colorClass: 'text-[#C6FF3D]',
    };
  }

  if (member.status === 'pending') {
    return {
      text: `Days past: ${days} day${days === 1 ? '' : 's'}`,
      colorClass: 'text-orange-400',
    };
  }

  if (member.status === 'not_renewing') {
    if (days === 0) {
      return { text: 'Not renewing: ends today', colorClass: 'text-gray-400' };
    }
    if (days < 0) {
      // Membership is still running, just won't be renewed.
      const daysRemaining = Math.abs(days);
      return {
        text: `Not renewing: ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`,
        colorClass: 'text-gray-400',
      };
    }
    // Membership already lapsed and won't be renewed.
    return {
      text: `Not renewing: ${days} day${days === 1 ? '' : 's'} ago`,
      colorClass: 'text-gray-400',
    };
  }

  // inactive
  return {
    text: `Days past: ${days} day${days === 1 ? '' : 's'}`,
    colorClass: 'text-red-400',
  };
}