import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import ContactButton from '../components/ContactButton';
import Facilities from '../components/Facilities';
import { useInView } from '../hooks/useInView';
import { GYM_PHONE_DISPLAY, GYM_PHONE } from '../constants/gymInfo';

const durationTiers = [
  { key: '1m', label: '1 month', months: 1, discount: 0 },
  { key: '3m', label: '3 months', months: 3, discount: 0.2 },
  { key: '6m', label: '6 months', months: 6, discount: 0.3, popular: true },
  { key: '1y', label: '1 year', months: 12, discount: 0.35 }
];

function buildPlans(monthlyRate) {
  return durationTiers.map((tier) => ({ ...tier, price: Math.round(monthlyRate * tier.months * (1 - tier.discount)) }));
}

const strengthPlans = buildPlans(1200);
const strengthCardioPlans = buildPlans(1500);

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function PlanToggle({ active, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/[0.06] p-1">
      {[['strength', 'Strength'], ['cardio', 'Strength + Cardio']].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-full px-4 py-2.5 text-[11px] font-black uppercase transition-all sm:px-6 ${
            active === key ? 'bg-[#d8ff3e] text-[#111]' : 'text-white/55 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// The "Best value" tag lives inside its own button now, not floating above
// it. A floating tag reads fine in a single row of 4, but the moment the
// grid wraps to 2 columns on mobile, a tag poking out above one button can
// visually land on top of a completely different button in the row above.
// Attaching it to its own button's content removes that ambiguity for good,
// regardless of how the grid reflows.
function PricingDisplay({ plans, selectedIndex, onSelect }) {
  const selected = plans[selectedIndex];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 sm:grid-cols-4 sm:gap-1 sm:p-1">
        {plans.map((plan, index) => (
          <button
            key={plan.key}
            onClick={() => onSelect(index)}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-xs font-black uppercase leading-tight transition-all sm:text-[11px] ${
              index === selectedIndex ? 'bg-[#f5b83d] text-[#111]' : 'text-white/45 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <span>{plan.label}</span>
            {plan.popular && (
              <span className="rounded-full bg-[#d8ff3e] px-2 py-0.5 text-[8px] font-black text-[#111]">Best value</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-0 sm:px-10">
        <div className="text-center sm:text-left">
          <p className="text-6xl font-black tracking-[-0.06em] text-white sm:text-8xl">
            ₹{selected.price.toLocaleString('en-IN')}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d8ff3e]">
            ₹{Math.round(selected.price / selected.months).toLocaleString('en-IN')} / month
          </p>
        </div>
        <div className="max-w-[220px] text-center sm:text-left">
          <p className="text-sm font-bold text-white">Train on your terms.</p>
          <p className="mt-1 text-xs leading-relaxed text-white/45">No confusing tiers. Just a plan that fits your rhythm.</p>
          {selected.discount > 0 && (
            <p className="mt-3 text-xs font-black uppercase text-[#f5b83d]">Save {Math.round(selected.discount * 100)}%</p>
          )}
        </div>
      </div>
    </div>
  );
}

// The tilt-on-hover / drift-on-touch interaction still works — only the
// "Move the picture" hint label was removed, per feedback. A small sticker
// with the founder's title replaces it for visual interest, using copy
// that's already stated elsewhere on the page rather than inventing new claims.
//
// Interaction is device-appropriate rather than one gesture for everyone:
// - Desktop (mouse): the photo tilts gently toward the cursor.
// - Touch (phone): there's no cursor, and dragging on the photo would fight
//   normal page scrolling — so instead the photo drifts a few pixels as you
//   scroll past it, tied to something the user is already doing.
// Both are skipped if the OS has "reduce motion" turned on.
function FounderPortrait() {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let rafId = null;

    if (isFinePointer) {
      const handleMouseMove = (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `rotateX(${y * -10}deg) rotateY(${x * 12}deg) scale(1.02)`;
        });
      };
      const handleMouseLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
      };
      wrap.addEventListener('mousemove', handleMouseMove);
      wrap.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        wrap.removeEventListener('mousemove', handleMouseMove);
        wrap.removeEventListener('mouseleave', handleMouseLeave);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const progress = 1 - rect.top / window.innerHeight;
        const clamped = Math.min(Math.max(progress, 0), 1);
        card.style.transform = `translateY(${(clamped - 0.5) * 16}px)`;
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
    <div ref={wrapRef} className="group relative mx-auto w-full max-w-[320px] sm:max-w-[440px]" style={{ perspective: '900px' }}>
      <div className="absolute inset-4 rounded-[2rem] bg-[#f5b83d] transition-transform duration-500 group-hover:rotate-2" />
      <div
        ref={cardRef}
        className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/20 bg-[#222] shadow-2xl transition-transform duration-150 will-change-transform"
      >
        <img
          src="/images/gym-hero.png"
          alt="Bhat Mudasir, founder and head coach of Bodyworks Gym"
          className="h-full w-full object-contain object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      <span className="absolute -bottom-4 -right-4 -rotate-3 rounded-xl bg-[#d8ff3e] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#111] shadow-lg sm:-right-6">
        Founder & Head Coach
      </span>
    </div>
  );
}

function PublicHome() {
  const [activeTab, setActiveTab] = useState('strength');
  const [durationIndex, setDurationIndex] = useState(2);
  const [plansRef, plansInView] = useInView();
  const activePlans = activeTab === 'strength' ? strengthPlans : strengthCardioPlans;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#101010] text-[#f4f1e9] selection:bg-[#d8ff3e] selection:text-[#111]">
      <Header />
      <main>
        {/* HERO — no photo. Content is centered as a single column since
            there's no image to balance against on the other side. */}
        <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#171717]">
          <div
            className="absolute inset-0 -z-10 opacity-30"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
              backgroundSize: '54px 54px'
            }}
          />
          <div className="absolute -right-32 top-16 -z-10 h-[480px] w-[480px] rounded-full bg-[#f5b83d]/20 blur-[120px]" />
          <div className="absolute -left-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-[#d8ff3e]/10 blur-[120px]" />
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28 lg:py-36">
            <div className="mb-6 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#d8ff3e]">
              <span className="h-2 w-2 rounded-full bg-[#d8ff3e] shadow-[0_0_16px_#d8ff3e]" /> Sopore, Kashmir / est. 2021
            </div>
            <h1 className="text-[clamp(3rem,13vw,7.5rem)] font-black uppercase leading-[0.92] tracking-[-.05em] text-white">
              Stop
              <br />
              <span className="text-[#f5b83d]">Wishing.</span>
              <br />
              Start <span className="text-[#d8ff3e]">Doing.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-white/60 sm:text-lg">
              The unisex gym in Sopore, built for people who actually show up.
            </p>
            <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
              <a
                href="#plans"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d8ff3e] px-5 py-4 text-xs font-black uppercase tracking-wide text-[#111] transition-transform hover:-translate-y-1"
              >
                Become a member
              </a>
              <a
                href={`tel:+${GYM_PHONE}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-4 text-xs font-black uppercase tracking-wide text-white transition-colors hover:border-[#f5b83d] hover:text-[#f5b83d]"
              >
                <Phone className="h-4 w-4" /> Call us
              </a>
            </div>
          </div>
        </section>

        <Facilities />

        {/* BUILT FOR SHOWING UP — same grid-pattern + glow treatment as the
            hero for visual continuity, larger photo since it's now the only
            one on the page, and a sticker tag instead of a flat caption. */}
        <section className="relative overflow-hidden bg-[#101010] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
          <div
            className="absolute inset-0 -z-10 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
              backgroundSize: '54px 54px'
            }}
          />
          <div className="absolute -left-24 top-1/4 -z-10 h-[380px] w-[380px] rounded-full bg-[#f5b83d]/10 blur-[120px]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal>
              <p className="text-xs font-black uppercase tracking-[.3em] text-[#f5b83d]">Bhat Mudasir</p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-[-.05em] text-white sm:text-6xl lg:leading-[0.86]">
                Built for
                <br />
                <span className="text-[#d8ff3e]">showing up.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/55">
                Founder & Head Coach. Bodyworks is a space for consistent people, first-timers, and anyone ready to take their
                next rep seriously.
              </p>
              <div className="mt-7 flex items-center gap-3 text-xs font-black uppercase tracking-wide text-white/45">
                <ShieldCheck className="h-5 w-5 text-[#d8ff3e]" /> Coaching with intent
              </div>
            </Reveal>
            <Reveal delay={120}>
              <FounderPortrait />
            </Reveal>
          </div>
        </section>

        <section
          id="plans"
          ref={plansRef}
          className={`border-y border-white/10 bg-[#171717] px-5 py-12 transition-all duration-700 sm:px-8 sm:py-16 lg:px-12 lg:py-24 ${
            plansInView ? 'opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[.3em] text-[#d8ff3e]">Membership</p>
                <h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-[-.05em] text-white sm:text-6xl lg:leading-[0.88]">
                  Start
                  <br />
                  <span className="text-[#f5b83d]">doing.</span>
                </h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/45">
                  One registration. All the momentum. Pick your pace and we&apos;ll see you on the floor.
                </p>
                <div className="mt-7 rounded-2xl border border-white/10 p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-[#f5b83d]">Registration fee</p>
                  <p className="mt-2 text-3xl font-black">₹1500</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">
                    One-time payment, lifetime validity, plus your first month free.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#101010] p-5 sm:p-8">
                <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm font-black uppercase tracking-widest text-white/55">Choose your access</p>
                  <PlanToggle active={activeTab} onChange={setActiveTab} />
                </div>
                <PricingDisplay plans={activePlans} selectedIndex={durationIndex} onSelect={setDurationIndex} />
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#d8ff3e]" /> AC training floor
                    </span>
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#d8ff3e]" /> Locker facility
                    </span>
                  </div>
                  <ContactButton variant="button" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f5b83d] px-5 py-12 text-[#111] sm:px-8 sm:py-16 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <Reveal>
              <p className="text-xs font-black uppercase tracking-[.3em]">Find us</p>
              <h2 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-[-.05em] sm:text-6xl lg:leading-[0.86]">
                Your
                <br />
                floor
                <br />
                <span className="text-white">is here.</span>
              </h2>
              <p className="mt-6 flex items-center gap-2 text-sm font-bold">
                <MapPin className="h-5 w-5" /> Sopore, Jammu & Kashmir
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="overflow-hidden rounded-3xl border-4 border-[#111]">
                <MapSection />
              </div>
            </Reveal>
          </div>
        </section>

        {/* This CTA links back up to #plans, which sits above it on the
            page — so the arrow points up, not down, toward what it targets. */}
        <section className="bg-[#101010] px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-28">
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[.3em] text-[#d8ff3e]">Ready when you are</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[-.05em] sm:text-7xl lg:leading-[0.86]">
              Stop wishing.
              <br />
              <span className="text-[#f5b83d]">Start doing.</span>
            </h2>
            <a
              href="#plans"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#d8ff3e] px-7 py-4 text-xs font-black uppercase tracking-wide text-[#111] transition-transform hover:-translate-y-1"
            >
              Become a member <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </section>
      </main>

      {/* Footer: brand on the left, the four public links on the right in
          two rows, and Admin centered below in its own row, set apart by
          spacing rather than by being unreadably dim. */}
      <footer className="border-t border-white/10 bg-[#0b0b0b] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-lg font-black uppercase tracking-tight">
                Bodyworks<span className="text-[#f5b83d]">.</span>
              </p>
              <p className="mt-1 text-xs text-white/35">The unisex gym in Sopore.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-wide text-white/45 sm:justify-items-end">
              <a href={`tel:+${GYM_PHONE}`} className="hover:text-[#d8ff3e]">
                {GYM_PHONE_DISPLAY}
              </a>
              <a
                href="https://www.instagram.com/bodyworks_thegym/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d8ff3e]"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/p/Body-Works-The-Unisex-Gym-100065390232576/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d8ff3e]"
              >
                Facebook
              </a>
              <a
                href="https://www.threads.com/@bodyworks_thegym?xmt=AQG0TlVNSLMZS9USgnTaLGRAZjbpMZJqr54H0Re0oKpwpDA"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d8ff3e]"
              >
                Threads
              </a>
            </div>
          </div>
          <div className="mt-6 flex justify-center border-t border-white/5 pt-4">
            <Link to="/login" className="text-[10px] uppercase tracking-wide text-white/40 hover:text-white/70">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicHome;