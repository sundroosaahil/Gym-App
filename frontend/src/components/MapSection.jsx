import { MapPin, Phone } from 'lucide-react';
import { GYM_PHONE, GYM_PHONE_DISPLAY } from '../constants/gymInfo';

const GYM_ADDRESS = 'Bodyworks Gym & Snooker, Naseem Bagh, near Bypass, Sopore, Jammu and Kashmir 193201';

function MapSection() {
  const encodedAddress = encodeURIComponent(GYM_ADDRESS);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <section className="grid md:grid-cols-2 h-[32rem] md:h-[36rem]">
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('/images/gym-1.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

        <div className="relative h-full flex flex-col justify-end p-8 md:p-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#F5F5F0] mb-4">
            Find Us
          </h2>

          <div className="flex items-start gap-3 mb-3">
            <MapPin className="w-5 h-5 text-[#C6FF3D] shrink-0 mt-0.5" />
            <p className="text-[#F5F5F0] text-sm leading-relaxed">{GYM_ADDRESS}</p>
          </div>


          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center bg-[#F2C230] text-black font-bold uppercase px-6 py-3 rounded hover:bg-[#C6FF3D] hover:-translate-y-0.5 transition-all w-fit"
          >
            Get Directions
          </a>
        </div>
      </div>

      <div>
        <iframe
          title="Gym Location"
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
        />
      </div>
    </section>
  );
}

export default MapSection;