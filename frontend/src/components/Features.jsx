const features = [
  'Advanced Gym Equipment',
  'Friendly Environment',
  'Fully Air Conditioned',
  'Locker Facility',
  'Trusted Supplements',
  'Experienced Trainers'
];

function Features() {
  return (
    <section className="px-6 py-16 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="grid grid-cols-2 gap-3">
          <img
            src="/images/gym-1.jpg"
            alt="Bodyworks Gym cardio area"
            className="w-full h-48 object-cover rounded col-span-2"
          />
          <img
            src="/images/gym-2.jpg"
            alt="Bodyworks Gym weights floor"
            className="w-full h-40 object-cover rounded"
          />
          <img
            src="/images/gym-3.jpg"
            alt="Bodyworks Gym interior"
            className="w-full h-40 object-cover rounded"
          />
        </div>

        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight leading-tight mb-8">
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: '2px #F2C230' }}
            >
              Why
            </span>{' '}
            <span className="text-[#F5F5F0]">Bodyworks</span>
          </h2>

          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span className="text-[#C6FF3D] font-black text-xl">✓</span>
                <span className="text-[#F5F5F0] text-lg font-semibold uppercase tracking-wide">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Features;