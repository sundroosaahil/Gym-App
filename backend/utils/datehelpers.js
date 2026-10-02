// Zeroes out the time portion of a date, in server-local time.
// Why this matters: JS Date objects carry hours/minutes/seconds. If you
// subtract two Dates that both "mean" the same calendar day but have
// different times-of-day baked in (e.g. one from a date-picker at midnight,
// one from `new Date()` at 8pm), you get a fractional day difference —
// Math.floor/round on that can silently land on the wrong day.
// Always pass dates through this before doing calendar-day math.
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Turns a "YYYY-MM-DD" string (what <input type="date"> sends) into a Date at
// local midnight. Returns null for anything invalid.
// Why not just new Date("2026-10-02")? JS reads that as UTC midnight, while
// startOfDay() above works in server-local time, so the two can disagree by
// a day. Building the date from its parts keeps everything on one clock.
function parseDateInput(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  // 2026-02-31 would silently roll over into March, so check the parts survived.
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

module.exports = { startOfDay, parseDateInput };