import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowDownRight, ArrowUpRight, Check, Dumbbell, MapPin, Phone, ShieldCheck, Sparkles, Timer, Users, Zap } from 'lucide-react';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import ContactButton from '../components/ContactButton';
import { useInView } from '../hooks/useInView';
import { GYM_PHONE_DISPLAY, GYM_PHONE } from '../constants/gymInfo';

const durationTiers = [
  { key: '1m', label: '01 month', months: 1, discount: 0 },
  { key: '3m', label: '03 months', months: 3, discount: 0.2 },
  { key: '6m', label: '06 months', months: 6, discount: 0.3, popular: true },
  { key: '1y', label: '01 year', months: 12, discount: 0.35 }
];

function buildPlans(monthlyRate) {
  return durationTiers.map((tier) => ({ ...tier, price: Math.round(monthlyRate * tier.months * (1 - tier.discount)) }));
}

const strengthPlans = buildPlans(1200);
const strengthCardioPlans = buildPlans(1500);

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView();
  return <div ref={ref} className={`transition-all duration-700 ${inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function PlanToggle({ active, onChange }) {
  return <div className="inline-flex rounded-full border border-white/15 bg-white/[0.06] p-1 backdrop-blur-sm">
    {[['strength', 'Strength'], ['cardio', 'Strength + Cardio']].map(([key, label]) => <button key={key} onClick={() => onChange(key)} className={`rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-wide transition-all sm:px-6 ${active === key ? 'bg-[#d8ff3e] text-[#111]' : 'text-white/55 hover:text-white'}`}>{label}</button>)}
  </div>;
}

function PricingDisplay({ plans, selectedIndex, onSelect }) {
  const selected = plans[selectedIndex];
  return <div className="mx-auto max-w-3xl">
    <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
      {plans.map((plan, index) => <button key={plan.key} onClick={() => onSelect(index)} className={`relative rounded-xl px-1 py-3 text-[10px] font-black uppercase tracking-wide transition-all sm:text-xs ${index === selectedIndex ? 'bg-[#f5b83d] text-[#111]' : 'text-white/45 hover:bg-white/[0.08] hover:text-white'}`}>
        {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#d8ff3e] px-2 py-0.5 text-[8px] text-[#111]">Best value</span>}{plan.label}
      </button>)}
    </div>
    <div className="mt-8 flex flex-col items-center sm:flex-row sm:justify-between sm:px-10">
      <div><p className="text-6xl font-black tracking-[-0.08em] text-white sm:text-8xl">₹{selected.price.toLocaleString('en-IN')}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d8ff3e]">₹{Math.round(selected.price / selected.months).toLocaleString('en-IN')} / month</p></div>
      <div className="mt-5 max-w-[180px] text-center sm:mt-0 sm:text-left"><p className="text-sm font-bold text-white">Train on your terms.</p><p className="mt-1 text-xs leading-relaxed text-white/45">No confusing tiers. Just a plan that fits your rhythm.</p>{selected.discount > 0 && <p className="mt-3 text-xs font-black uppercase text-[#f5b83d]">Save {Math.round(selected.discount * 100)}%</p>}</div>
    </div>
  </div>;
}

function PublicHome() {
  const [activeTab, setActiveTab] = useState('strength');
  const [durationIndex, setDurationIndex] = useState(2);
  const [plansRef, plansInView] = useInView();
  const activePlans = activeTab === 'strength' ? strengthPlans : strengthCardioPlans;

  return <div className="min-h-screen overflow-x-hidden bg-[#101010] text-[#f4f1e9] selection:bg-[#d8ff3e] selection:text-[#111]">
    <Header />

    <main>
      <section className="relative isolate min-h-[calc(100vh-76px)] overflow-hidden border-b border-white/10 bg-[#171717]">
        <div className="absolute inset-0 -z-10 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize: '54px 54px' }} />
        <div className="absolute -right-32 top-16 -z-10 h-[480px] w-[480px] rounded-full bg-[#f5b83d]/20 blur-[120px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-10 pt-10 sm:px-8 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-0 lg:px-12 lg:pt-0">
          <div className="relative z-10 max-w-xl">
            <div className="mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#d8ff3e]"><span className="h-2 w-2 rounded-full bg-[#d8ff3e] shadow-[0_0_16px_#d8ff3e]" /> Sopore, Kashmir / est. 2022</div>
            <h1 className="text-[clamp(4rem,15vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.09em] text-white">Make<br /><span className="text-[#f5b83d]">moves.</span></h1>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-white/55 sm:text-lg">A serious training space for everyday people. Show up, get stronger, and leave better than you came in.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#plans" className="inline-flex items-center gap-3 rounded-full bg-[#d8ff3e] px-6 py-3.5 text-xs font-black uppercase tracking-wide text-[#111] transition-transform hover:-translate-y-1">Start your run <ArrowDownRight className="h-4 w-4" /></a><a href={`tel:+${GYM_PHONE}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3.5 text-xs font-black uppercase tracking-wide text-white transition-colors hover:border-[#f5b83d] hover:text-[#f5b83d]"><Phone className="h-4 w-4" /> {GYM_PHONE_DISPLAY}</a></div>
            <div className="mt-12 flex items-center gap-7 border-t border-white/15 pt-5 text-xs font-bold uppercase tracking-wide text-white/45"><span><strong className="block text-2xl text-white">06</strong> ways to train</span><span className="h-8 w-px bg-white/15" /><span><strong className="block text-2xl text-white">01</strong> real community</span></div>
          </div>
          <div className="relative flex min-h-[390px] items-end justify-center lg:min-h-[650px] lg:justify-end"><div className="absolute bottom-0 right-0 h-[78%] w-[78%] rounded-[45%_45%_0_0] bg-[#f5b83d] opacity-90" /><div className="absolute bottom-8 right-1/2 z-10 h-48 w-48 translate-x-1/2 rounded-full border border-[#d8ff3e]/30 lg:bottom-24 lg:right-16 lg:translate-x-0" /><img src="/images/gym-hero.png" alt="Bodyworks Gym founder and head coach" className="relative z-20 h-auto max-h-[520px] w-[95%] object-contain object-bottom drop-shadow-[0_30px_30px_rgba(0,0,0,.5)] sm:w-[75%] lg:max-h-[690px] lg:w-[88%]" /><div className="absolute bottom-5 left-0 z-30 -rotate-6 rounded-lg bg-[#111] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#d8ff3e] shadow-xl lg:bottom-28 lg:left-12">Train with intent.</div></div>
        </div>
        <a href="#why" className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 lg:flex">Scroll to explore <ArrowDown className="h-4 w-4" /></a>
      </section>

      <section id="why" className="bg-[#d8ff3e] px-5 py-16 text-[#111] sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><Reveal><p className="text-xs font-black uppercase tracking-[0.3em]">Why Bodyworks?</p><h2 className="mt-4 max-w-md text-5xl font-black uppercase leading-[0.86] tracking-[-0.07em] sm:text-7xl">Better<br />every rep.</h2></Reveal><Reveal delay={120} className="grid gap-px overflow-hidden rounded-2xl bg-[#111]/20 sm:grid-cols-3"><div className="bg-[#d8ff3e] p-5"><Dumbbell className="h-6 w-6" /><h3 className="mt-12 text-lg font-black uppercase">Good gear</h3><p className="mt-2 text-sm leading-relaxed opacity-60">The equipment you need to train with confidence.</p></div><div className="bg-[#d8ff3e] p-5"><Users className="h-6 w-6" /><h3 className="mt-12 text-lg font-black uppercase">Good people</h3><p className="mt-2 text-sm leading-relaxed opacity-60">A welcoming floor where every level belongs.</p></div><div className="bg-[#d8ff3e] p-5"><Zap className="h-6 w-6" /><h3 className="mt-12 text-lg font-black uppercase">Good energy</h3><p className="mt-2 text-sm leading-relaxed opacity-60">Leave the noise outside. Bring your focus in.</p></div></Reveal></div></div></section>

      <section className="bg-[#101010] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-7xl"><Reveal><div className="flex items-end justify-between border-b border-white/15 pb-5"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-[#f5b83d]">The training floor</p><h2 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] sm:text-6xl">Find your<br /><span className="text-white/35">strong.</span></h2></div><span className="hidden text-5xl font-black text-white/10 sm:block">02—</span></div></Reveal><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Reveal delay={50}><div className="group min-h-[230px] rounded-2xl bg-[#f5b83d] p-5 text-[#111] transition-transform hover:-translate-y-2"><Dumbbell /><p className="mt-16 text-2xl font-black uppercase leading-none">Strength<br />training</p><ArrowUpRight className="mt-5 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></Reveal><Reveal delay={100}><div className="group min-h-[230px] rounded-2xl bg-white p-5 text-[#111] transition-transform hover:-translate-y-2"><Timer /><p className="mt-16 text-2xl font-black uppercase leading-none">Cardio<br />conditioning</p><ArrowUpRight className="mt-5 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></Reveal><Reveal delay={150}><div className="group min-h-[230px] rounded-2xl border border-white/15 p-5 transition-transform hover:-translate-y-2 hover:border-[#d8ff3e]"><Sparkles className="text-[#d8ff3e]" /><p className="mt-16 text-2xl font-black uppercase leading-none">Personal<br />progress</p><ArrowUpRight className="mt-5 h-5 w-5 text-[#d8ff3e] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></div></Reveal><Reveal delay={200}><div className="group flex min-h-[230px] flex-col justify-between rounded-2xl bg-[#d8ff3e] p-5 text-[#111] transition-transform hover:-translate-y-2"><ShieldCheck /><p className="text-2xl font-black uppercase leading-none">No ego.<br />Just work.</p><ArrowUpRight className="h-5 w-5" /></div></Reveal></div></div></section>

      <section id="plans" ref={plansRef} className={`border-y border-white/10 bg-[#171717] px-5 py-16 transition-all duration-700 sm:px-8 lg:px-12 lg:py-24 ${plansInView ? 'opacity-100' : 'translate-y-6 opacity-0'}`}><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-start"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-[#d8ff3e]">03— Membership</p><h2 className="mt-5 text-5xl font-black uppercase leading-[.88] tracking-[-0.07em] sm:text-7xl">Invest in<br /><span className="text-[#f5b83d]">you.</span></h2><p className="mt-6 max-w-xs text-sm leading-relaxed text-white/45">One registration. All the momentum. Pick your pace and we&apos;ll see you on the floor.</p><div className="mt-8 rounded-2xl border border-white/10 p-5"><p className="text-xs font-black uppercase tracking-widest text-[#f5b83d]">Registration fee</p><p className="mt-2 text-3xl font-black">₹1500</p><p className="mt-2 text-xs leading-relaxed text-white/45">One-time payment, lifetime validity, plus your first month free.</p></div></div><div className="rounded-3xl border border-white/10 bg-[#101010] p-5 sm:p-8"><div className="mb-8 flex flex-wrap items-center justify-between gap-4"><p className="text-sm font-black uppercase tracking-widest text-white/55">Choose your access</p><PlanToggle active={activeTab} onChange={setActiveTab} /></div><PricingDisplay plans={activePlans} selectedIndex={durationIndex} onSelect={setDurationIndex} /><div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6"><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/50"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d8ff3e]" /> AC training floor</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#d8ff3e]" /> Locker facility</span></div><ContactButton variant="button" /></div></div></div></div></section>

      <section className="bg-[#f5b83d] px-5 py-16 text-[#111] sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr] lg:items-end"><Reveal><p className="text-xs font-black uppercase tracking-[0.3em]">04— Find us</p><h2 className="mt-4 text-5xl font-black uppercase leading-[.86] tracking-[-0.07em] sm:text-7xl">Your<br />floor<br /><span className="text-white">is here.</span></h2><p className="mt-7 flex items-center gap-2 text-sm font-bold"><MapPin className="h-5 w-5" /> Sopore, Jammu & Kashmir</p></Reveal><Reveal delay={120}><div className="overflow-hidden rounded-3xl border-4 border-[#111]"><MapSection /></div></Reveal></div></section>

      <section className="bg-[#101010] px-5 py-20 text-center sm:px-8 lg:py-28"><Reveal><p className="text-xs font-black uppercase tracking-[0.3em] text-[#d8ff3e]">Ready when you are</p><h2 className="mx-auto mt-5 max-w-3xl text-5xl font-black uppercase leading-[.86] tracking-[-0.07em] sm:text-8xl">Your<br /><span className="text-[#f5b83d]">move.</span></h2><a href="#plans" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#d8ff3e] px-7 py-4 text-xs font-black uppercase tracking-wide text-[#111] transition-transform hover:-translate-y-1">Become a member <ArrowDownRight className="h-4 w-4" /></a></Reveal></section>
    </main>

    <footer className="border-t border-white/10 bg-[#0b0b0b] px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-lg font-black uppercase tracking-tight">Bodyworks<span className="text-[#f5b83d]">.</span></p><p className="mt-1 text-xs text-white/35">The unisex gym in Sopore.</p></div><div className="flex flex-wrap items-center gap-5 text-xs font-bold uppercase tracking-wide text-white/45"><a href={`tel:+${GYM_PHONE}`} className="flex items-center gap-2 hover:text-[#d8ff3e]"><Phone className="h-3.5 w-3.5" /> {GYM_PHONE_DISPLAY}</a><a href="https://www.instagram.com/bodyworks_thegym/" target="_blank" rel="noopener noreferrer" className="hover:text-[#d8ff3e]">Instagram</a><Link to="/login" className="text-white/20 hover:text-white/50">Admin</Link></div></div></footer>
  </div>;
}

export default PublicHome;
