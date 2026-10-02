import DateField from './DateField';
import { fromDateInputValue, toDateInputValue } from '../utils/dateInput';
import { formatDate } from '../utils/formatDate';

// Start-date control for the Mark Paid modal.
// The two chips are shortcuts — they just set the date. The date field is the
// real control, so any date can be picked.
//
// value / dueDate / today are all "YYYY-MM-DD" strings.
function StartDatePicker({ value, onChange, dueDate, today }) {
  const chips = [
    { label: 'Due date', date: dueDate },
    { label: 'Today', date: today },
  ];

  // Stops the picker offering dates far in the future (backend enforces this too).
  const todayDate = fromDateInputValue(today);
  const maxValue = todayDate
    ? toDateInputValue(new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 366))
    : undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {chips.map(({ label, date }) => {
          const selected = value === date;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onChange(date)}
              className={`h-12 flex flex-col items-center justify-center rounded-lg border transition-colors ${
                selected
                  ? 'border-[#F2C230] bg-[#F2C230]/10 text-[#F2C230]'
                  : 'border-[#333] text-[#999] hover:border-[#555]'
              }`}
            >
              <span className="text-xs font-bold uppercase leading-tight">{label}</span>
              <span className="text-xs tabular-nums opacity-80 leading-tight">{formatDate(fromDateInputValue(date))}</span>
            </button>
          );
        })}
      </div>
      <DateField value={value} onChange={onChange} max={maxValue} required ariaLabel="Pick any start date" />
    </div>
  );
}

export default StartDatePicker;