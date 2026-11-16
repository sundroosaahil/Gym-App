import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Download, EllipsisVertical, Share, SquarePlus } from 'lucide-react';
import Modal from './Modal';
import { useInView } from '../hooks/useInView';

// Where the tracker lives. Set VITE_TRACKER_URL in Vercel. Optionally set
// VITE_TRACKER_APK_URL to a GitHub release link to show an Android download.
const TRACKER_URL = import.meta.env.VITE_TRACKER_URL || 'http://127.0.0.1:5174/';
const TRACKER_APK_URL = import.meta.env.VITE_TRACKER_APK_URL || '';

// Screenshots are real screens of the tracker, shown with sample data.
// 720x1280 = exactly 9:16, so the frame never crops or stretches them.
const SCREENS = [
  { src: '/images/tracker/home.webp', title: 'Your day, at a glance', text: 'This week, today’s workout and your body weight on one screen.', alt: 'Tracker home screen showing the week and today’s Push Day workout' },
  { src: '/images/tracker/workout.webp', title: 'Log every set', text: 'Weight, reps and effort in a couple of taps, with a rest timer built in.', alt: 'Workout screen logging sets of barbell bench press with a rest timer' },
  { src: '/images/tracker/plan.webp', title: 'Plan your week', text: 'Build routines and place them on the days you train.', alt: 'Plan screen showing a weekly schedule of workouts' },
  { src: '/images/tracker/stats.webp', title: 'Watch the streak grow', text: 'Workouts done, total weight lifted and your week streak.', alt: 'Stats screen with workout count, total lifted and a week streak badge' },
  { src: '/images/tracker/body.webp', title: 'Track your body weight', text: 'Log weigh-ins and see the trend toward your goal.', alt: 'Body weight chart trending down toward a goal line' },
  { src: '/images/tracker/lifts.webp', title: 'See your lifts climb', text: 'Chart your best set for any exercise over time.', alt: 'Lifts chart showing leg press weight increasing over time' }
];

const FACTS = [
  ['Free', 'to use'],
  ['No', 'sign-up'],
  ['On your', 'phone'],
  ['Any', 'device']
];

const PERKS = ['Build workout plans', 'Log each session', 'Review your history', 'Keep your data on your device'];

// Scoped styles: everything is prefixed tk- so nothing can leak into the rest
// of the site, and deleting this component removes all of it.
const css = `
.tk-rail{scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.tk-rail::-webkit-scrollbar{display:none}
.tk-card{scroll-snap-align:center;flex:0 0 var(--card-w);opacity:0;transform:translateY(36px)}
.tk-rail[data-in="true"] .tk-card{animation:tk-rise .8s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i) * 90ms)}
@keyframes tk-rise{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:none}}
.tk-glow{animation:tk-glow 6s ease-in-out infinite}
@keyframes tk-glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}
.tk-shine{opacity:0;transition:opacity .25s;background:radial-gradient(circle at var(--mx,50%) var(--my,30%),rgba(255,255,255,.18),transparent 45%)}
.tk-card:hover .tk-shine{opacity:1}
.tk-caption{animation:tk-fade .45s ease both}
@keyframes tk-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.tk-sheen{position:relative;overflow:hidden}
.tk-sheen::after{content:'';position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%);animation:tk-sheen 3.6s ease-in-out infinite}
@keyframes tk-sheen{0%,55%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
@media (prefers-reduced-motion: reduce){
  .tk-card{opacity:1;transform:none;animation:none!important}
  .tk-glow,.tk-sheen::after,.tk-caption{animation:none!important}
  .tk-rail{scroll-behavior:auto}
}
`;

function InstallSheet({ onClose }) {
  const [platform, setPlatform] = useState(() =>
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios' : 'android'
  );

  const steps =
    platform === 'ios'
      ? [
          ['Open the tracker in Safari', 'Tap “Open tracker” below.', null],
          ['Tap the Share button', 'The square with an arrow, at the bottom of Safari.', Share],
          ['Choose “Add to Home Screen”', 'Then tap Add. The tracker now opens like an app.', SquarePlus]
        ]
      : [
          ['Open the tracker in Chrome', 'Tap “Open tracker” below.', null],
          ['Tap the menu', 'The three dots at the top right of Chrome.', EllipsisVertical],
          ['Choose “Install app”', 'If you only see “Add to Home screen”, pick that instead.', Download]
        ];

  return (
    <Modal onClose={onClose}>
      <div className="rounded-3xl border border-white/10 bg-[#171717] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.3em] text-[#d8ff3e]">Install tracker</p>
        <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">Add it to your home screen</h3>

        <div className="mt-5 inline-flex rounded-full border border-white/15 bg-white/[0.06] p-1">
          {[['android', 'Android'], ['ios', 'iPhone']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPlatform(key)}
              className={`rounded-full px-5 py-2 text-[11px] font-black uppercase transition-all ${
                platform === key ? 'bg-[#d8ff3e] text-[#111]' : 'text-white/55 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <ol className="mt-6 space-y-3">
          {steps.map(([title, text, Icon], i) => (
            <li key={title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d8ff3e] text-xs font-black text-[#111]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{text}</p>
              </div>
              {Icon && <Icon className="mt-1 h-5 w-5 shrink-0 text-[#f5b83d]" />}
            </li>
          ))}
        </ol>

        <p className="mt-5 text-xs leading-relaxed text-white/45">
          Tip: install it before you start logging. Your workouts are saved on your phone, and on iPhone the installed
          app keeps its own saved data.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={TRACKER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#d8ff3e] px-6 py-4 text-xs font-black uppercase tracking-wide text-[#111] transition-transform hover:-translate-y-0.5"
          >
            Open tracker <ArrowUpRight className="h-4 w-4" />
          </a>
          {TRACKER_APK_URL && (
            <a
              href={TRACKER_APK_URL}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-4 text-xs font-black uppercase tracking-wide text-white transition-colors hover:border-[#f5b83d] hover:text-[#f5b83d]"
            >
              <Download className="h-4 w-4" /> Android app (APK)
            </a>
          )}
        </div>
        <p className="mt-4 text-center text-[11px] text-white/35">On a computer? Open this page on your phone to install.</p>
      </div>
    </Modal>
  );
}

function TrackerShowcase() {
  const railRef = useRef(null);
  const cardRefs = useRef([]);
  const rafRef = useRef(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [active, setActive] = useState(1);
  const [showInstall, setShowInstall] = useState(false);
  const [sectionRef, inView] = useInView({ threshold: 0.2 });

  // Coverflow: cards further from the centre turn, shrink and fade. This is
  // plain CSS 3D (no three.js). Styles go straight onto the DOM nodes, so
  // scrolling does not re-render React on every frame.
  const update = useCallback(() => {
    rafRef.current = null;
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const center = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const dist = card.offsetLeft + card.offsetWidth / 2 - center;
      if (Math.abs(dist) < bestDist) {
        bestDist = Math.abs(dist);
        best = i;
      }
      const inner = card.firstElementChild;
      if (!inner || reduce) return;
      const d = dist / (card.offsetWidth * 1.05);
      const a = Math.min(Math.abs(d), 2);
      inner.style.transform = `rotateY(${Math.max(-1, Math.min(1, d)) * -24}deg) scale(${1 - a * 0.09})`;
      inner.style.opacity = String(Math.max(1 - a * 0.3, 0.35));
    });
    setActive(best);
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(update);
  }, [update]);

  const goTo = useCallback((index) => {
    const rail = railRef.current;
    const card = cardRefs.current[Math.max(0, Math.min(SCREENS.length - 1, index))];
    if (!rail || !card) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // Start with the 2nd screen centred so both sides look populated.
    const start = cardRefs.current[1];
    if (start) rail.scrollLeft = start.offsetLeft + start.offsetWidth / 2 - rail.clientWidth / 2;
    update();
    rail.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      rail.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [schedule, update]);

  // Mouse users cannot swipe, so let them drag the rail. Touch keeps native scrolling.
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const rail = railRef.current;
    drag.current = { down: true, startX: e.clientX, startLeft: rail.scrollLeft, moved: false };
    rail.style.scrollSnapType = 'none';
    const move = (ev) => {
      const dx = ev.clientX - drag.current.startX;
      if (Math.abs(dx) > 5) drag.current.moved = true;
      rail.scrollLeft = drag.current.startLeft - dx;
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      rail.style.scrollSnapType = '';
      drag.current.down = false;
      if (drag.current.moved) {
        // Let the browser settle first, then glide to the nearest card.
        setTimeout(() => {
          drag.current.moved = false;
        }, 0);
        requestAnimationFrame(() => goTo(cardRefs.current.reduce((best, card, i, all) => {
          if (!card) return best;
          const c = card.offsetLeft + card.offsetWidth / 2 - (rail.scrollLeft + rail.clientWidth / 2);
          const b = all[best].offsetLeft + all[best].offsetWidth / 2 - (rail.scrollLeft + rail.clientWidth / 2);
          return Math.abs(c) < Math.abs(b) ? i : best;
        }, 0)));
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onCardMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const current = SCREENS[active] || SCREENS[0];

  return (
    <section id="tracker" className="relative overflow-hidden bg-[#101010] px-4 py-16 sm:px-8 sm:py-20 lg:py-28">
      <style>{css}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#d8ff3e]/10 blur-[130px]"
      />

      <div ref={sectionRef} className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[.3em] text-[#d8ff3e]">
            <span className="h-2 w-2 rounded-full bg-[#d8ff3e] shadow-[0_0_16px_#d8ff3e]" /> Bodyworks workout tracker
          </p>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black uppercase leading-[0.94] tracking-[-.05em] text-white sm:text-6xl lg:text-7xl">
            Your training.
            <br />
            <span className="text-[#f5b83d]">Your progress.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
            Plan workouts, log your sessions, and look back at the work you have put in, all in one simple tracker.
          </p>
        </div>

        {/* The "store page" card */}
        <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#1b1b1b] to-[#121212] shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:mt-14">
          <div className="p-5 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <img
                  src="/images/tracker/icon.png"
                  alt="Bodyworks Tracker app icon"
                  width="96"
                  height="96"
                  className="h-20 w-20 shrink-0 rounded-[22%] border border-white/15 bg-black shadow-[0_12px_40px_rgba(216,255,62,0.2)] sm:h-24 sm:w-24"
                />
                <div className="min-w-0">
                  <h3 className="text-2xl font-black tracking-tight text-white sm:text-4xl">Bodyworks Tracker</h3>
                  <p className="mt-1 text-sm font-bold text-[#d8ff3e]">Bodyworks Gym</p>
                  <p className="mt-0.5 text-xs text-white/45">Workout tracker for members</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:items-end">
                <button
                  onClick={() => setShowInstall(true)}
                  className="tk-sheen inline-flex items-center justify-center gap-3 rounded-full bg-[#d8ff3e] px-9 py-4 text-sm font-black uppercase tracking-wide text-[#111] shadow-[0_0_40px_rgba(216,255,62,0.25)] transition-transform hover:-translate-y-1 active:scale-95"
                >
                  <Download className="h-5 w-5" /> Install tracker
                </button>
                <a
                  href={TRACKER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white/45 transition-colors hover:text-[#d8ff3e]"
                >
                  Or open in your browser <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Play-Store-style fact strip. Every item is true of the web build. */}
            <div className="mt-6 grid grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/25 py-3.5">
              {FACTS.map(([big, small]) => (
                <div key={big + small} className="px-1 text-center">
                  <p className="text-sm font-black text-white sm:text-lg">{big}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white/40 sm:text-[11px]">{small}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshot rail */}
          <div className="relative border-t border-white/10 pb-6 pt-8 sm:pb-8 sm:pt-10">
            <div
              aria-hidden="true"
              className="tk-glow pointer-events-none absolute left-1/2 top-1/2 h-[75%] w-[min(560px,85%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,184,61,0.35),rgba(216,255,62,0.12)_55%,transparent_75%)] blur-3xl"
            />
            <p className="relative px-5 text-xs font-black uppercase tracking-[.25em] text-white/40 sm:px-8">Screenshots</p>

            <div className="relative mt-5">
              <div
                ref={railRef}
                data-in={inView}
                role="region"
                aria-label="Tracker screenshots. Scroll sideways to see more."
                tabIndex={0}
                onPointerDown={onPointerDown}
                className="tk-rail relative flex cursor-grab select-none gap-4 overflow-x-auto py-8 active:cursor-grabbing sm:gap-6"
                style={{
                  '--card-w': 'clamp(170px, 52vw, 270px)',
                  paddingInline: 'calc(50% - var(--card-w) / 2)',
                  perspective: '1100px'
                }}
              >
                {SCREENS.map((screen, i) => (
                  <div
                    key={screen.src}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="tk-card"
                    style={{ '--i': i }}
                    onPointerMove={onCardMove}
                    onClick={() => {
                      if (!drag.current.moved) goTo(i);
                    }}
                  >
                    <div className="will-change-transform" style={{ transition: 'transform .12s linear' }}>
                      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.7rem] border-[5px] border-[#2b2b2b] bg-black shadow-[0_30px_60px_rgba(0,0,0,0.65)] ring-1 ring-white/10">
                        <img
                          src={screen.src}
                          alt={screen.alt}
                          width="720"
                          height="1280"
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                          className="h-full w-full object-cover"
                        />
                        <div className="tk-shine pointer-events-none absolute inset-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#161616] to-transparent sm:w-24" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#161616] to-transparent sm:w-24" />

              <button
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label="Previous screenshot"
                className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition hover:border-[#d8ff3e] hover:text-[#d8ff3e] disabled:opacity-25 md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => goTo(active + 1)}
                disabled={active === SCREENS.length - 1}
                aria-label="Next screenshot"
                className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition hover:border-[#d8ff3e] hover:text-[#d8ff3e] disabled:opacity-25 md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="relative px-5 text-center">
              <div key={active} className="tk-caption mx-auto min-h-[4.5rem] max-w-sm" aria-live="polite">
                <p className="text-lg font-black text-white sm:text-xl">{current.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/55">{current.text}</p>
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                {SCREENS.map((screen, i) => (
                  <button
                    key={screen.src}
                    onClick={() => goTo(i)}
                    aria-label={`Show screenshot ${i + 1}: ${screen.title}`}
                    aria-current={i === active}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === active ? 'w-7 bg-[#d8ff3e]' : 'w-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[.15em] text-white/30">Screenshots show sample data</p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold text-white/75">
          {PERKS.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d8ff3e]/10 text-[#d8ff3e]">
                <Check className="h-3.5 w-3.5" />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {showInstall && <InstallSheet onClose={() => setShowInstall(false)} />}
    </section>
  );
}

export default TrackerShowcase;
