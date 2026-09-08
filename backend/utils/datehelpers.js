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

module.exports = { startOfDay };