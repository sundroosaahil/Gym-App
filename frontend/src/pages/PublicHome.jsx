import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import Features from '../components/Features';
import ContactButton from '../components/ContactButton';
import { useInView } from '../hooks/useInView';
import { GYM_PHONE_DISPLAY, GYM_PHONE } from '../constants/gymInfo';

const strengthPlans = [
  { label: '1 Month', price: '₹1200' },
  { label: '3 Months', price: '₹2800' },
  { label: '6 Months', price: '₹5600' },
  { label: '1 Year', price: '₹11200' }
];

const strengthCardioPlans = [
  { label: '1 Month', price: '₹1500' },
  { label: '3 Months', price: '₹3700' },
  { label: '6 Months', price: '₹7398', popular: true },
  { label: '1 Year', price: '₹14796' }
];

function PlanCard({ plan }) {
  return (
    <div
      className={`relative bg-[#1A1A1A] border-2 rounded p-6 text-center transition-all duration-300 hover:-translate-y-1 ${
        plan.popular
          ? 'border-[#C6FF3D] shadow-[0_0_25px_rgba(198,255,61,0.15)] hover:shadow-[0_0_35px_rgba(198,255,61,0.3)]'
          : 'border-[#F2C230] hover:shadow-[0_0_25px_rgba(242,194,48,0.2)]'
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C6FF3D] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <p className="text-[#C6FF3D] font-bold uppercase text-sm">{plan.label}</p>
      <p className="text-[#F5F5F0] text-2xl font-black mt-2">{plan.price}</p>
    </div>
  );
}

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

function PublicHome() {
  const [plansRef, plansInView] = useInView();
  const [mapRef, mapInView] = useInView();
  const [activeTab, setActiveTab] = useState('strength');

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

        {/* Continuous scrolling wordmark, pauses on hover */}
                {/* Scrolling wordmark wall, pauses on hover */}
        <div className="group absolute inset-0 flex flex-col justify-around overflow-hidden" aria-hidden="true">
          <div
            className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap opacity-[0.12]"
            style={{ animationDuration: '24s' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[6rem] md:text-[7rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.3)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div
            className="flex animate-marquee [animation-direction:reverse] group-hover:[animation-play-state:paused] whitespace-nowrap opacity-[0.08]"
            style={{ animationDuration: '30s' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[5rem] md:text-[6rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.25)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div
            className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap opacity-[0.1]"
            style={{ animationDuration: '18s' }}
          >
            {[0, 1].map((groupIdx) => (
              <div key={groupIdx} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[5rem] md:text-[6rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.25)' }}
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

          <div
            className="flex justify-center md:justify-end animate-fade-up opacity-0"
            style={{ animationDelay: '0.3s' }}
          >
            <img
              src="/images/gym-hero.png"
              alt="Bodyworks Gym"
              className="w-96 md:w-[32rem] h-auto md:-mr-6"
              style={{ filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.6))' }}
            />
          </div>
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
        <div
          className="absolute -left-16 top-10 w-64 h-64 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #F2C230, #F2C230 14px, transparent 14px, transparent 28px)'
          }}
        />

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

        <div className="relative max-w-4xl mx-auto">
          <PlanToggle active={activeTab} onChange={setActiveTab} />

          <div key={activeTab} className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
            {activePlans.map((plan) => (
              <PlanCard key={plan.label} plan={plan} />
            ))}
          </div>
        </div>

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