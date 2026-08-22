import { MapPin, Phone } from 'lucide-react';
import { GYM_PHONE, GYM_PHONE_DISPLAY } from '../constants/gymInfo';

const GYM_ADDRESS = 'Bodyworks Gym & Snooker, Naseem Bagh, near Bypass, Sopore, Jammu and Kashmir 193201';

function MapSection() {
  const encodedAddress = encodeURIComponent(GYM_ADDRESS);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <section className="px-6 py-16 bg-[#1A1A1A]">
      <h2 className="text-3xl font-black uppercase tracking-tight text-[#F5F5F0] mb-8 text-center md:text-left max-w-6xl mx-auto">
        Find Us
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-[minmax(0,320px)_1fr] gap-6 items-stretch">
        <div className="bg-black border-2 border-[#F2C230] rounded-lg p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#C6FF3D] shrink-0 mt-0.5" />
              <p className="text-[#F5F5F0] text-sm leading-relaxed">{GYM_ADDRESS}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#C6FF3D] shrink-0" />
              <a href={`tel:+${GYM_PHONE}`} className="text-[#F5F5F0] text-sm hover:text-[#F2C230] transition-colors">
                {GYM_PHONE_DISPLAY}
              </a>
            </div>
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex justify-center items-center bg-[#F2C230] text-black font-bold uppercase px-6 py-3 rounded hover:bg-[#C6FF3D] hover:-translate-y-0.5 transition-all"
          >
            Get Directions
          </a>
        </div>

        <div className="rounded-lg overflow-hidden border-2 border-[#F2C230] min-h-[300px]">
          <iframe
            title="Gym Location"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: '300px' }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
          />
        </div>
      </div>
    </section>
  );
}

export default MapSection;