// Central place for the country code, so it only needs to change in one
// spot if BodyWorks Gym ever needs a different one.
const COUNTRY_CODE = '91';

// Staff types only the 10-digit local number — this turns it into the
// full number (e.g. "9876543210" -> "919876543210") for storage and wa.me links.
export function toFullPhone(localDigits) {
  const digits = localDigits.replace(/\D/g, '').slice(-10);
  return digits ? `${COUNTRY_CODE}${digits}` : '';
}

// Reverse: takes what's stored in the DB and strips the country code back
// off, so edit forms can show just the 10-digit number to type into.
export function toLocalPhone(fullPhone) {
  if (!fullPhone) return '';
  const digits = fullPhone.replace(/\D/g, '');
  return digits.startsWith(COUNTRY_CODE) ? digits.slice(COUNTRY_CODE.length) : digits;
}