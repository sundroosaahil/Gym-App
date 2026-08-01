const GYM_ADDRESS = 'Bodyworks Gym & Snooker, Naseem Bagh, near Bypass, Sopore, Jammu and Kashmir 193201';

function MapSection() {
  const encodedAddress = encodeURIComponent(GYM_ADDRESS);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  return (
    <section className="px-6 py-16 bg-black">
      <h2 className="text-3xl font-black uppercase tracking-tight text-[#F5F5F0] mb-6">
        Find Us
      </h2>
      <div className="rounded overflow-hidden border-2 border-[#F2C230]">
        <iframe
          title="Gym Location"
          width="100%"
          height="300"
          style={{ border: 0 }}
          loading="lazy"
          src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
        />
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 bg-[#F2C230] text-black font-bold uppercase px-6 py-3 rounded hover:bg-[#C6FF3D] transition-colors"
      >
        Get Directions
      </a>
    </section>
  );
}

export default MapSection;