const { startOfDay } = require('./datehelpers');

// daysPastExpiry is a whole-number CALENDAR day difference:
//   < 0   -> membership still running, that many days left
//   === 0 -> due today (still counts as active — they haven't missed a day yet)
//   1-7   -> pending / grace window
//   > 7   -> inactive
//
// IMPORTANT: both sides are normalized with startOfDay() before subtracting.
// Without that, two members due on the exact same calendar date can end up
// with different daysPastExpiry just because their endDate timestamps have
// different times-of-day baked in (e.g. one set from a date-picker at
// midnight, another from a "mark paid" click at 8pm) — the raw ms
// difference is a fraction of a day off, and flooring/rounding it lands on
// different day counts even though, on a calendar, they're due the same day.
function calculateStatus(member) {
  const today = startOfDay(new Date());
  const endDate = startOfDay(member.endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysPastExpiry = Math.round((today - endDate) / msPerDay);

  if (member.renewalIntent === 'not_renewing') {
    return { status: 'not_renewing', daysPastExpiry };
  }

  if (daysPastExpiry <= 0) {
    return { status: 'active', daysPastExpiry };
  } else if (daysPastExpiry <= 7) {
    return { status: 'pending', daysPastExpiry };
  } else {
    return { status: 'inactive', daysPastExpiry };
  }
}

module.exports = calculateStatus;