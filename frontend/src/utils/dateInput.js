// Helpers for <input type="date">, which always speaks in "YYYY-MM-DD" strings.
//
// Why not use date.toISOString().slice(0, 10)?  toISOString() converts to UTC
// first, so between midnight and 5:30 AM in India it would give you
// *yesterday's* date. Reading the local year/month/day avoids that.

export function toDateInputValue(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// "2026-10-02" -> Date at local midnight, or null if it isn't a full date yet
// (the browser gives '' while the user is still half-way through typing one).
export function fromDateInputValue(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}