import { useState, useRef } from 'react';
import { Dumbbell, Users, Snowflake, Lock, ShieldCheck, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const features = [
  {
    label: 'Advanced gym equipment',
    icon: Dumbbell,
    image: '/images/treadmill.jpg',
    position: 'left center'
  },
  {
    label: 'Friendly environment',
    icon: Users,
    image: '/images/chest-machine.jpg',
    position: 'left center'
  },
  {
    label: 'Fully air conditioned',
    icon: Snowflake,
    image: '/images/gym-2.jpg',
    position: 'center'
  },
  {
    label: 'Locker facility',
    icon: Lock,
    image: '/images/locker.jpg',
    position: 'center'
  },
  {
    label: 'Trusted supplements',
    icon: ShieldCheck,
    image: '/images/supplements.jpg',
    position: '5% center'
  },
  {
    label: 'Experienced trainers',
    icon: Award,
    image: '/images/tricep-machine.jpg',
    position: 'left center'
  }
];

// Ignore touch movement smaller than this — otherwise normal taps
// or slight finger jitter get misread as swipes.
const MIN_SWIPE_DISTANCE = 50;

function Features() {
  const [active, setActive] = useState(0);
  const Active = features[active];

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  function goToPrev() {
    setActive((current) => (current - 1 + features.length) % features.length);
  }

  function goToNext() {
    setActive((current) => (current + 1) % features.length);
  }

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

    if (distance > MIN_SWIPE_DISTANCE) {
      goToNext();
    } else if (distance < -MIN_SWIPE_DISTANCE) {
      goToPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  }

  return (
    <section
      className="relative h-[32rem] md:h-[40rem] lg:h-[46rem] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {features.map((f, i) => (
        <img
          key={f.label}
          src={f.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: f.position }}
        />
      ))}

      <div className="absolute inset-0 bg-black/70" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 30%, rgba(242,194,48,0.15), transparent 60%)' }}
      />

      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
          <span className="text-transparent" style={{ WebkitTextStroke: '2px #F2C230' }}>
            Why
          </span>{' '}
          <span className="text-[#F5F5F0]">Bodyworks</span>
        </h2>

        <div key={active} className="animate-fade-up flex flex-col items-center gap-4">
          <Active.icon className="w-12 h-12 text-[#C6FF3D]" strokeWidth={1.5} />
          <p className="text-2xl md:text-3xl font-bold text-[#F5F5F0]">{Active.label}</p>
        </div>
      </div>

      <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-6">
        <button
          onClick={goToPrev}
          aria-label="Previous feature"
          className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#F5F5F0]/30 text-[#F5F5F0] hover:border-[#F2C230] hover:text-[#F2C230] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {features.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setActive(i)}
              aria-label={`Show ${f.label}`}
              className="p-1.5"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 h-2.5 bg-[#F2C230]' : 'w-2.5 h-2.5 bg-[#F5F5F0]/40 hover:bg-[#F5F5F0]/70'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={goToNext}
          aria-label="Next feature"
          className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#F5F5F0]/30 text-[#F5F5F0] hover:border-[#F2C230] hover:text-[#F2C230] transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

export default Features;