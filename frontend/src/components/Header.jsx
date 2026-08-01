import { useState } from 'react';
import ContactButton from '../components/ContactButton';
import { GYM_PHONE_DISPLAY, GYM_PHONE } from '../constants/gymInfo';


function Header() {
  const [showContactOptions, setShowContactOptions] = useState(false);

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-black border-b-4 border-[#F2C230]">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Bodyworks Gym" className="h-14 w-auto" />
            <span className="text-2xl font-black uppercase tracking-tight text-[#F2C230]">
              Bodyworks <span className="text-[#F5F5F0]">Gym</span>
              </span>
          </div>

     <ContactButton variant="icon" />
      
    </header>
  );
}

export default Header;