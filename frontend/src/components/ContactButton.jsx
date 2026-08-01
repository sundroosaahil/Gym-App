import { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { GYM_PHONE } from '../constants/gymInfo';

function ContactButton({ variant = 'icon' }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={
          variant === 'icon'
            ? 'bg-[#F2C230] text-black p-2.5 rounded-full hover:bg-[#C6FF3D] transition-colors'
            : 'flex items-center gap-2 bg-[#F2C230] text-black font-bold uppercase px-6 py-3 rounded hover:bg-[#C6FF3D] transition-colors'
        }
      >
        <Phone className="w-5 h-5" strokeWidth={2.5} />
        {variant === 'button' && 'Sign Up Now'}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-[#1A1A1A] border border-[#F2C230] rounded overflow-hidden shadow-lg z-20 whitespace-nowrap">
          <a
            href={`tel:+${GYM_PHONE}`}
            className="flex items-center gap-2 px-5 py-3 text-sm text-[#F5F5F0] hover:bg-[#F2C230] hover:text-black transition-colors"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <a
            href={`https://wa.me/${GYM_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 text-sm text-[#F5F5F0] hover:bg-[#C6FF3D] hover:text-black transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

export default ContactButton;