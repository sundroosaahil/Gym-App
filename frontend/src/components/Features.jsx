import { Dumbbell, Users, Snowflake, Lock, ShieldCheck, Award } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const features = [
  { label: 'Advanced gym equipment', icon: Dumbbell },
  { label: 'Friendly environment', icon: Users },
  { label: 'Fully air conditioned', icon: Snowflake },
  { label: 'Locker facility', icon: Lock },
  { label: 'Trusted supplements', icon: ShieldCheck },
  { label: 'Experienced trainers', icon: Award }
];

function Features() {
  const [ref, inView] = useInView();

  return (
    <section ref={ref} className="px-6 py-16 bg-[#1A1A1A]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
        <div
          className={`grid grid-cols-2 gap-3 transition-opacity duration-700 ${
            inView ? 'opacity-100' : 'opacity-0 -translate-x-6'
          }`}
        >
          <div className="col-span-2 overflow-hidden rounded">
            <img
              src="/images/gym-1.jpg"
              alt="Bodyworks Gym cardio area"
              className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded">
            <img
              src="/images/gym-2.jpg"
              alt="Bodyworks Gym weights floor"
              className="w-full h-40 object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded">
            <img
              src="/images/gym-3.jpg"
              alt="Bodyworks Gym interior"
              className="w-full h-40 object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black uppercase tracking-tight leading-tight mb-8">
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #F2C230' }}>
              Why
            </span>{' '}
            <span className="text-[#F5F5F0]">Bodyworks</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ label, icon: Icon }, i) => (
              <div
                key={label}
                className={`bg-black border-2 border-[#F2C230]/40 rounded-lg p-4 flex flex-col items-start gap-2 transition-all duration-500 hover:border-[#F2C230] hover:-translate-y-1 ${
                  inView ? 'opacity-100' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: inView ? `${i * 80}ms` : '0ms' }}
              >
                <Icon className="w-6 h-6 text-[#C6FF3D]" strokeWidth={2} />
                <span className="text-[#F5F5F0] text-sm leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;