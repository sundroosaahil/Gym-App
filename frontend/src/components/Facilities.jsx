import { useState, useRef, useEffect, useCallback } from 'react';
import { Dumbbell, Users, Snowflake, Lock, ShieldCheck, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const facilities = [
  { label: 'Advanced gym equipment', icon: Dumbbell, image: '/images/treadmill.jpg', position: 'left center' },
  { label: 'Friendly environment', icon: Users, image: '/images/chest-machine.jpg', position: 'left center' },
  { label: 'Fully air conditioned', icon: Snowflake, image: '/images/gym-2.jpg', position: 'center' },
  { label: 'Locker facility', icon: Lock, image: '/images/locker.jpg', position: 'center' },
  { label: 'Trusted supplements', icon: ShieldCheck, image: '/images/supplements.jpg', position: '15% center' },
  { label: 'Experienced trainers', icon: Award, image: '/images/tricep-machine.jpg', position: 'left center' }
];

// Ignore touch movement smaller than this so a normal tap isn't misread as a swipe.
const MIN_SWIPE_DISTANCE = 50;
// How long each slide stays up before auto-advancing.
const AUTOPLAY_INTERVAL = 4500;

function Facilities() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const Active = facilities[active];

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const goToPrev = useCallback(() => {
    setActive((current) => (current - 1 + facilities.length) % facilities.length);
  }, []);

  const goToNext = useCallback(() => {
    setActive((current) => (current + 1) % facilities.length);
  }, []);

  // Resets on every manual nav, so a click/swipe pushes the next auto-advance
  // a full interval out instead of firing right after.
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [active, isPaused, goToNext]);

  function handleTouchStart(e) {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e) {
    touchEndX.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > MIN_SWIPE_DISTANCE) goToNext();
    else if (distance < -MIN_SWIPE_DISTANCE) goToPrev();
    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <section
      id="facilities"
      className="relative h-[30rem] overflow-hidden sm:h-[36rem] lg:h-[44rem]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {facilities.map((f, i) => (
        <img
          key={f.label}
          src={f.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: f.position }}
        />
      ))}

      <div className="absolute inset-0 bg-black/70" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(216,255,62,0.14), transparent 60%)' }}
      />

      <div className="relative flex h-full flex-col items-center justify-center px-5 text-center sm:px-8">
        <p className="text-xs font-black uppercase tracking-[.3em] text-[#d8ff3e]">Inside Bodyworks</p>
        <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-[-.05em] text-white sm:text-6xl">
          Why train here
        </h2>

        <div key={active} className="mt-8 flex flex-col items-center gap-4 transition-opacity duration-500">
          <Active.icon className="h-11 w-11 text-[#f5b83d]" strokeWidth={1.5} />
          <p className="max-w-xs text-xl font-bold leading-snug text-white sm:max-w-none sm:text-3xl">{Active.label}</p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-5 sm:bottom-8 sm:gap-6">
        <button
          onClick={goToPrev}
          aria-label="Previous facility"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 text-white transition-colors hover:border-[#d8ff3e] hover:text-[#d8ff3e]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {facilities.map((f, i) => (
            <button key={f.label} onClick={() => setActive(i)} aria-label={`Show ${f.label}`} className="p-1.5">
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active ? 'h-2.5 w-6 bg-[#d8ff3e]' : 'h-2.5 w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={goToNext}
          aria-label="Next facility"
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/30 text-white transition-colors hover:border-[#d8ff3e] hover:text-[#d8ff3e]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

export default Facilities;