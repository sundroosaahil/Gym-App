import { Link } from 'react-router-dom';
import Header from '../components/Header';
import MapSection from '../components/MapSection';
import Features from '../components/Features';
import ContactButton from '../components/ContactButton';
import { GYM_PHONE_DISPLAY, GYM_PHONE } from '../constants/gymInfo';

function PublicHome() {
  return (
    <div className="bg-black min-h-screen">
      <Header />

      {/* Signature diagonal stripe band, pulled from your ceiling design */}
      <div
        className="h-3 w-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #F2C230, #F2C230 20px, #0D0D0D 20px, #0D0D0D 40px)'
        }}
      />

     <section className="relative overflow-hidden px-6 py-24">
  {/* faded background glow */}
  <div
    className="absolute inset-0"
    style={{
      background: 'radial-gradient(circle at 75% 50%, rgba(242,194,48,0.15), transparent 60%)'
    }}
  />

  <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
    <div>
      <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-[#F5F5F0] leading-tight">
        Stop Wishing<br />
        <span className="text-[#F2C230]">Start Doing</span>
      </h1>
      <p className="mt-6 text-lg text-[#C6FF3D] font-semibold uppercase tracking-wide">
        The Unisex Gym
      </p>
    </div>

    <div className="flex justify-center">
 <div className="flex justify-center">
  <img
    src="/images/gym-hero.png"
    alt="Bodyworks Gym"
    className="w-80 md:w-md h-auto"
    style={{ filter: 'drop-shadow(0 0 40px rgba(242,194,48,0.4))' }}
  />
</div>
</div>
  </div>
</section>
      <Features />

      <section className="px-6 py-16 bg-[#1A1A1A]">
  <h2 className="text-3xl font-black uppercase tracking-tight text-[#F2C230] mb-4 text-center">
    Membership Plans
  </h2>

  {/* Registration fee card */}
  <div className="max-w-2xl mx-auto bg-black border-2 border-[#C6FF3D] rounded-lg p-6 mb-10 text-center">
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

  {/* Strength Training */}
  <div className="max-w-4xl mx-auto mb-10">
    <h3 className="text-xl font-black uppercase tracking-wide text-[#F5F5F0] mb-4 text-center">
      Strength Training
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: '1 Month', price: '₹1200' },
        { label: '3 Months', price: '₹2800' },
        { label: '6 Months', price: '₹5600' },
        { label: '1 Year', price: '₹11200' }
      ].map((plan) => (
        <div
          key={plan.label}
          className="bg-black border-2 border-[#F2C230] rounded p-6 text-center"
        >
          <p className="text-[#C6FF3D] font-bold uppercase text-sm">{plan.label}</p>
          <p className="text-[#F5F5F0] text-2xl font-black mt-2">{plan.price}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Strength + Cardio */}
  <div className="max-w-4xl mx-auto">
    <h3 className="text-xl font-black uppercase tracking-wide text-[#F5F5F0] mb-4 text-center">
      Strength + Cardio
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: '1 Month', price: '₹1500' },
        { label: '3 Months', price: '₹3700' },
        { label: '6 Months', price: '₹7398' },
        { label: '1 Year', price: '₹14796' }
      ].map((plan) => (
        <div
          key={plan.label}
          className="bg-black border-2 border-[#F2C230] rounded p-6 text-center"
        >
          <p className="text-[#C6FF3D] font-bold uppercase text-sm">{plan.label}</p>
          <p className="text-[#F5F5F0] text-2xl font-black mt-2">{plan.price}</p>
        </div>
      ))}
    </div>
  </div>

  <div className="flex justify-center mt-10">
  <ContactButton variant="button" />
</div>
</section>

      <MapSection />

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