import ContactButton from '../components/ContactButton';

function Header() {
  return (
    <header className="flex items-center justify-between gap-3 border-b-4 border-[#F2C230] bg-black px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <img src="/images/logo.png" alt="Bodyworks Gym" className="h-10 w-auto shrink-0 sm:h-14" />
        <span className="truncate text-lg font-black uppercase tracking-tight text-[#F2C230] sm:text-2xl">
          Bodyworks <span className="text-[#F5F5F0]">Gym</span>
        </span>
      </div>

      <ContactButton variant="icon" />
    </header>
  );
}

export default Header;