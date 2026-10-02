import { CalendarDays } from 'lucide-react';
import { fromDateInputValue } from '../utils/dateInput';

// A date input that ALWAYS reads dd/mm/yyyy.
//
// Why not just <input type="date">? The browser draws it in the *device's*
// locale, so one phone shows 10/02/2026 and another 02/10/2026 for the same
// day, and we can't change that from CSS. Instead we draw the text ourselves
// and lay the real (invisible) date input on top, so a tap still opens the
// native picker — but what the staff reads is always day/month/year.
//
// value / min / max are "YYYY-MM-DD" strings; onChange gets the same.
function DateField({ value, onChange, min, max, required = false, ariaLabel = 'Pick a date', className = '' }) {
  const date = fromDateInputValue(value);
  const text = date
    ? date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div
      className={`relative h-11 flex items-center gap-2.5 px-3 rounded-lg border border-[#333] bg-[#0D0D0D] focus-within:border-[#F2C230] transition-colors ${className}`}
    >
      <CalendarDays className="w-4 h-4 text-[#F2C230] shrink-0" />
      <span className={`text-sm font-semibold tabular-nums ${text ? 'text-[#F5F5F0]' : 'text-[#666]'}`}>
        {text || 'dd/mm/yyyy'}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [color-scheme:dark]"
      />
    </div>
  );
}

export default DateField;