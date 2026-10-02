import { CalendarDays } from 'lucide-react';

// Keep the native date input visible and tappable so mobile browsers open
// their date picker from the field itself.
function DateField({ value, onChange, min, max, required = false, ariaLabel = 'Pick a date', className = '' }) {
  return (
    <div
      className={`relative h-11 flex items-center gap-2.5 px-3 rounded-lg border border-[#333] bg-[#0D0D0D] focus-within:border-[#F2C230] transition-colors ${className}`}
    >
      <CalendarDays className="w-4 h-4 text-[#F2C230] shrink-0 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        aria-label={ariaLabel}
        className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#F5F5F0] focus:outline-none scheme-dark"
      />
    </div>
  );
}

export default DateField;