import { useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { fromDateInputValue, toDateInputValue } from '../utils/dateInput';

// Start-date control for the Mark Paid modal.
// The two chips are shortcuts — they just set the date. The date field is the
// real control, so any date can be picked.
//
// value / dueDate / today are all "YYYY-MM-DD" strings.
function StartDatePicker({ value, onChange, dueDate, today }) {
  const customDateInputRef = useRef(null);
  const chips = [
    { label: 'Due date', date: dueDate },
    { label: 'Today', date: today },
  ];

  // Stops the picker offering dates far in the future (backend enforces this too).
  const todayDate = fromDateInputValue(today);
  const maxValue = todayDate
    ? toDateInputValue(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 366))
    : undefined;
  const selectedDate = fromDateInputValue(value);
  const customSelected = value !== dueDate && value !== today;
  const customLabel = customSelected && selectedDate
    ? selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : 'Custom';

  function openCustomDatePicker() {
    const input = customDateInputRef.current;
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {
      // Fall back to click for browsers that block showPicker().
    }
    input.focus();
    input.click();
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#333] bg-[#0D0D0D] p-1">
      {chips.map(({ label, date }) => {
        const selected = value === date;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(date)}
            className={`h-10 rounded-lg px-1 text-[11px] font-bold uppercase transition-colors sm:text-xs ${
              selected
                ? 'bg-[#F2C230] text-black'
                : 'text-[#999] hover:bg-white/5 hover:text-[#F5F5F0]'
            }`}
          >
            {label}
          </button>
        );
      })}
      <div className={`relative min-w-0 rounded-lg text-[11px] font-bold uppercase transition-colors sm:text-xs ${
        customSelected
          ? 'bg-[#F2C230] text-black'
          : 'text-[#999] hover:bg-white/5 hover:text-[#F5F5F0]'
      }`}>
        <button
          type="button"
          onClick={openCustomDatePicker}
          aria-label={customSelected ? `Change start date, ${customLabel}` : 'Choose a custom start date'}
          className="flex h-10 w-full items-center justify-center gap-1 rounded-lg px-1"
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{customLabel}</span>
        </button>
        <input
          ref={customDateInputRef}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          max={maxValue}
          required
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      </div>
    </div>
  );
}

export default StartDatePicker;