import { CalendarDays } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { fromDateInputValue } from '../utils/dateInput';

// Shared by MemberCard (mobile) and MemberRow (desktop) so the Start Date UI
// lives in exactly one place.
//
// value / dueDate / today are all "YYYY-MM-DD" strings.
// The two chips are shortcuts — they just set the date. The date field is the
// real control, so any date can be picked.
function shortDate(value) {
  const d = fromDateInputValue(value);
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';
}

function StartDatePicker({ value, onChange, dueDate, today, durationDays }) {
  const chips = [
    { label: 'Due date', date: dueDate },
    { label: 'Today', date: today },
  ];

  // Live preview of the cycle that will be saved, so a wrong date is spotted
  // before pressing Confirm rather than after.
  const start = fromDateInputValue(value);
  const days = Number(durationDays);
  const end =
    start && days > 0
      ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + days)
      : null;

  // Stops the picker offering dates far in the future (backend enforces this too).
  const todayDate = fromDateInputValue(today);
  const maxDate = todayDate
    ? new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 366)
    : null;
  const maxValue = maxDate
    ? `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`
    : undefined;

  return (
    <div>
      <label className="block text-xs text-[#999] uppercase mb-1">Start Date</label>

      <div className="grid grid-cols-2 gap-2 mb-2">
        {chips.map(({ label, date }) => {
          const selected = value === date;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(date)}
              className={`flex flex-col items-center py-2 rounded border transition-colors ${
                selected
                  ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                  : 'border-[#333] text-[#999] hover:border-[#555]'
              }`}
            >
              <span className="text-sm font-bold uppercase">{label}</span>
              <span className="text-xs opacity-80">{shortDate(date)}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={maxValue}
          required
          aria-label="Pick any start date"
          className="bg-[#0D0D0D] border border-[#333] rounded pl-9 pr-3 py-2 text-sm w-full text-[#F5F5F0] focus:outline-none focus:border-[#F2C230] [color-scheme:dark]"
        />
      </div>

      {start && end && (
        <p className="text-xs text-[#999] mt-2">
          New cycle: {formatDate(start)} → {formatDate(end)}
        </p>
      )}
    </div>
  );
}

export default StartDatePicker;