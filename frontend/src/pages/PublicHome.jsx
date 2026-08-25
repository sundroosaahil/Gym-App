import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import Features from '../components/Features';
import ContactButton from '../components/ContactButton';
import { useInView } from '../hooks/useInView';
import { GYM_PHONE_DISPLAY, GYM_PHONE } from '../constants/gymInfo';

const durationTiers = [
  { key: '1m', label: '1 Month', months: 1, discount: 0 },
  { key: '3m', label: '3 Months', months: 3, discount: 0.2 },
  { key: '6m', label: '6 Months', months: 6, discount: 0.3, popular: true },
  { key: '1y', label: '1 Year', months: 12, discount: 0.35 }
];

function buildPlans(monthlyRate) {
  return durationTiers.map((tier) => ({
    ...tier,
    price: Math.round(monthlyRate * tier.months * (1 - tier.discount))
  }));
}

const strengthPlans = buildPlans(1200);
const strengthCardioPlans = buildPlans(1500);

function PlanToggle({ active, onChange }) {
  const options = [
    { key: 'strength', label: 'Strength Training' },
    { key: 'cardio', label: 'Strength + Cardio' }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-[#1A1A1A] border-2 border-[#F2C230] rounded-full p-1">
        {options.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors ${
              active === key ? 'bg-[#F2C230] text-black' : 'text-[#F5F5F0] hover:text-[#F2C230]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PricingDisplay({ plans, selectedIndex, onSelect }) {
  const selected = plans[selectedIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative grid grid-cols-4 bg-[#1A1A1A] border-2 border-[#F2C230] rounded-full p-1 mt-8">
        <div
          className="absolute inset-y-1 w-1/4 bg-[#F2C230] rounded-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${selectedIndex * 100}%)` }}
        />
        {plans.map((plan, i) => (
          <button
            key={plan.key}
            onClick={() => onSelect(i)}
            className={`relative z-10 py-3 text-xs sm:text-sm font-bold uppercase transition-colors ${
              i === selectedIndex ? 'text-black' : 'text-[#F5F5F0] hover:text-[#F2C230]'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase text-[#F2C230] whitespace-nowrap">
                ★ Popular
              </span>
            )}
            {plan.label}
          </button>
        ))}
      </div>

      <div key={selected.key} className="animate-fade-up text-center mt-10">
        <p className="text-6xl md:text-7xl font-black text-[#F5F5F0]">
          ₹{selected.price.toLocaleString('en-IN')}
        </p>
        <p className="text-[#C6FF3D] font-semibold mt-2">
          ₹{Math.round(selected.price / selected.months).toLocaleString('en-IN')} / month
        </p>
        {selected.discount > 0 && (
          <span className="inline-block mt-3 bg-[#C6FF3D] text-black text-xs font-black uppercase px-3 py-1 rounded-full">
            {Math.round(selected.discount * 100)}% off monthly rate
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * HeroPhoto — the owner's photo, treated so it feels grounded in the page
 * instead of pasted on top of it.
 *
 * Two layers do the "grounding":
 * 1. Two blurred, brand-colored glow blobs sit behind the photo.
 * 2. A CSS mask fades the bottom of the photo into transparent, so there's
 *    no hard rectangular edge — it dissolves into the black background.
 *
 * Interactivity is device-appropriate rather than one-size-fits-all:
 * - Desktop (mouse): the photo tilts gently toward the cursor.
 * - Touch (phone): there's no cursor, so instead the photo drifts a few
 *   pixels as you scroll past it — real feedback tied to something the
 *   user is actually doing, not a fake gimmick.
 * Both are skipped entirely if the OS has "reduce motion" turned on.
 */
function HeroPhoto() {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let rafId = null;

    if (isFinePointer) {
      // --- Desktop: cursor-driven tilt ---
      const handleMouseMove = (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 -> 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rotateY = x * 10; // deg, left/right tilt
          const rotateX = y * -8; // deg, up/down tilt
          img.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
      };

      const handleMouseLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        img.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      };

      wrap.addEventListener('mousemove', handleMouseMove);
      wrap.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        wrap.removeEventListener('mousemove', handleMouseMove);
        wrap.removeEventListener('mouseleave', handleMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    // --- Touch: scroll-linked drift ---
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const progress = 1 - rect.top / window.innerHeight;
        const clamped = Math.min(Math.max(progress, 0), 1);
        const translateY = (clamped - 0.5) * 18; // -9px -> 9px
        img.style.transform = `translateY(${translateY}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative z-10 flex w-full min-w-0 flex-col items-center md:items-end animate-fade-up opacity-0 pointer-events-auto"
      style={{ animationDelay: '0.3s' }}
    >
      {/* Primary glow — sits behind the subject's chest/shoulders */}
      <div
        className="hero-glow absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.22), transparent 62%)',
          filter: 'blur(60px)',
          transform: 'scale(0.9)'
        }}
      />
      {/* Secondary glow — a restrained brand accent, offset for depth */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(circle at 68% 62%, rgba(242,194,48,0.12), transparent 55%)',
          filter: 'blur(60px)'
        }}
      />

      <img
        ref={imgRef}
        src="/images/gym-hero.png"
        alt="Bodyworks Gym owner"
        className="relative z-10 -ml-16 w-200 max-w-none h-auto md:ml-0 md:w-208 md:-mr-12 will-change-transform transition-transform duration-200 ease-out"
        style={{
          filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.5))',
          WebkitMaskImage: 'linear-gradient(to bottom, black 62%, rgba(0,0,0,0.9) 73%, rgba(0,0,0,0.55) 87%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 62%, rgba(0,0,0,0.9) 73%, rgba(0,0,0,0.55) 87%, transparent 100%)'
        }}
      />

      <div className="absolute right-2 bottom-16 z-20 text-right md:relative md:right-auto md:bottom-auto md:-mt-20 md:mr-8">
        <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#F5F5F0]">
          Bhat Mudasir
        </p>
        <p className="mt-1 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#C6FF3D]">
          Founder &amp; Head Coach
        </p>
      </div>
    </div>
  );
}

function PublicHome() {
  const [plansRef, plansInView] = useInView();
  const [mapRef, mapInView] = useInView();
  const [activeTab, setActiveTab] = useState('strength');
  const [durationIndex, setDurationIndex] = useState(0);
  const [marqueePaused, setMarqueePaused] = useState(false);

  const activePlans = activeTab === 'strength' ? strengthPlans : strengthCardioPlans;

  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      <Header />

      <div
        className="h-3 w-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #F2C230, #F2C230 20px, #0D0D0D 20px, #0D0D0D 40px)'
        }}
      />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(242,194,48,0.12), transparent 55%)'
          }}
        />

        <div
          className="absolute inset-0 flex flex-col justify-around overflow-hidden cursor-pointer"
          aria-hidden="true"
          onMouseEnter={() => setMarqueePaused(true)}
          onMouseLeave={() => setMarqueePaused(false)}
          onClick={() => setMarqueePaused((p) => !p)}
        >
          <div
            className="flex animate-marquee whitespace-nowrap opacity-[0.14]"
            style={{ animationDuration: '20s', animationPlayState: marqueePaused ? 'paused' : 'running' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[4rem] sm:text-[5.5rem] md:text-[6rem] lg:text-[7rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.9)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div
            className="flex animate-marquee [animation-direction:reverse] whitespace-nowrap opacity-[0.09]"
            style={{ animationDuration: '26s', animationPlayState: marqueePaused ? 'paused' : 'running' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[3.5rem] sm:text-[5rem] md:text-[6rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.8)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div
            className="flex animate-marquee whitespace-nowrap opacity-[0.11]"
            style={{ animationDuration: '16s', animationPlayState: marqueePaused ? 'paused' : 'running' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[3rem] sm:text-[4.5rem] md:text-[5rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.9)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div
            className="flex animate-marquee [animation-direction:reverse] whitespace-nowrap opacity-[0.07]"
            style={{ animationDuration: '34s', animationPlayState: marqueePaused ? 'paused' : 'running' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[2.5rem] sm:text-[3.5rem] md:text-[4rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.75)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative px-6 py-24 md:py-32 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center pointer-events-none">
          <div>
            <h1
              className="text-5xl md:text-6xl font-black uppercase tracking-tight text-[#F5F5F0] leading-tight animate-fade-up opacity-0"
              style={{ animationDelay: '0.1s' }}
            >
              Stop Wishing<br />
              <span className="text-[#F2C230]">Start Doing</span>
            </h1>

            <p
              className="mt-6 text-lg text-[#C6FF3D] animate-fade-up opacity-0"
              style={{ animationDelay: '0.25s' }}
            >
              The unisex gym in Sopore, built for people who actually show up.
            </p>

            <a
              href="#plans"
              className="pointer-events-auto inline-block mt-8 bg-[#F2C230] text-black font-bold uppercase px-8 py-3 rounded hover:bg-[#C6FF3D] transition-colors animate-fade-up opacity-0"
              style={{ animationDelay: '0.4s' }}
            >
              Become a Member
            </a>
          </div>

          <HeroPhoto />
        </div>
      </section>

      <Features />

      <section
        id="plans"
        ref={plansRef}
        className={`relative px-6 py-16 bg-black transition-opacity duration-700 ${
          plansInView ? 'opacity-100' : 'opacity-0 translate-y-6'
        }`}
      >
        <h2 className="relative text-3xl font-black uppercase tracking-tight text-[#F2C230] mb-4 text-center">
          Membership Plans
        </h2>

        <div className="relative max-w-2xl mx-auto bg-[#1A1A1A] border-2 border-[#C6FF3D] rounded-lg p-6 mb-10 text-center">
          <p className="text-[#C6FF3D] font-bold uppercase text-sm tracking-wide">
            Registration Fee
          </p>
          <p className="text-[#F5F5F0] text-3xl font-black mt-1">₹1500</p>
          <ul className="mt-4 text-[#F5F5F0] text-sm space-y-1">
            <li>One-time payment, valid for lifetime</li>
            <li>Includes 1 month free membership (starts from day of registration)</li>
            <li>Access to locker facility, AC training area & trusted supplements</li>
          </ul>
        </div>

        <PlanToggle active={activeTab} onChange={setActiveTab} />

        <PricingDisplay plans={activePlans} selectedIndex={durationIndex} onSelect={setDurationIndex} />

        <div className="relative flex justify-center mt-10">
          <ContactButton variant="button" />
        </div>
      </section>

      <div
        ref={mapRef}
        className={`transition-opacity duration-700 ${mapInView ? 'opacity-100' : 'opacity-0 translate-y-6'}`}
      >
        <MapSection />
      </div>

      <footer className="px-6 py-8 text-center border-t border-[#333]">
        <div className="mb-3 flex justify-center items-center gap-4 flex-wrap">
          <a
            href="https://www.instagram.com/bodyworks_thegym/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F5F5F0] hover:text-[#F2C230] transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/p/Body-Works-The-Unisex-Gym-100065390232576/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F5F5F0] hover:text-[#F2C230] transition-colors"
          >
            Facebook
          </a>
          <a
            href="https://www.threads.com/@bodyworks_thegym?xmt=AQG0TlVNSLMZS9USgnTaLGRAZjbpMZJqr54H0Re0oKpwpDA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F5F5F0] hover:text-[#F2C230] transition-colors"
          >
            Threads
          </a>
          <a
            href={`tel:+${GYM_PHONE}`}
            className="text-[#F5F5F0] hover:text-[#F2C230] transition-colors"
          >
            {GYM_PHONE_DISPLAY}
          </a>
        </div>
        <Link to="/login" className="text-xs text-[#555] hover:text-[#888]">
          admin
        </Link>
      </footer>
    </div>
  );
}

export default PublicHome;