// Turns a member's status + daysPastExpiry into the label/colour the UI shows.
//
// daysPastExpiry is negative while a membership is still running (days
// remaining), 0-7 while it's in the pending/grace window, and positive once
// it's properly lapsed — see backend/utils/calculateStatus.js.
//
// Active members should read as a countdown ("Renewal in: N days") in green,
// while pending/inactive/not_renewing members should read as an overdue
// counter ("Days past: N days") in an escalating colour.
export function getRenewalLabel(member) {
  const days = member.daysPastExpiry;

  if (member.status === 'active') {
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

  // inactive / not_renewing
  return {
    text: `Days past: ${days} day${days === 1 ? '' : 's'}`,
    colorClass: 'text-red-400',
  };
}