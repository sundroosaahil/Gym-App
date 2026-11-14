import ContactButton from '../components/ContactButton';
import { Dumbbell } from 'lucide-react';

function Header() {
  return (
    <header className="flex items-center justify-between gap-3 border-b-4 border-[#F2C230] bg-black px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <img src="/images/logo.png" alt="Bodyworks Gym" className="h-10 w-auto shrink-0 sm:h-14" />
        <span className="truncate text-lg font-black uppercase tracking-tight text-[#F2C230] sm:text-2xl">
          Bodyworks <span className="text-[#F5F5F0]">Gym</span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <a
          href="#tracker"
          aria-label="Workout tracker: learn more and open the tracker"
          title="Plan workouts and track your progress"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ff3e]/35 px-2.5 py-2 text-[10px] font-black uppercase tracking-wide text-[#d8ff3e] transition-colors hover:bg-[#d8ff3e]/10 sm:gap-2 sm:px-3 sm:text-xs"
        >
          <Dumbbell className="h-4 w-4" />
          <span className="hidden sm:inline">Workout tracker</span>
          <span className="sm:hidden">Tracker</span>
        </a>
        <ContactButton variant="icon" />
      </div>
    </header>
  );
}

export default Header;
