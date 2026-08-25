import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ADMIN_HEADLINE = ['Front Desk'];
const ADMIN_TAGLINE = 'Members, payments, and everything in between.';

async function getClientDeviceModel() {
  if (navigator.userAgentData?.getHighEntropyValues) {
    try {
      const { model } = await navigator.userAgentData.getHighEntropyValues(['model']);
      return model || null;
    } catch {
      return null;
    }
  }
  return null; // Safari/Firefox don't support this API — backend falls back to UA parsing
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const deviceModel = await getClientDeviceModel();
      await login(email, password, deviceModel);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    'bg-transparent border-b-2 border-[#333] px-1 py-3 text-base w-full text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230] transition-colors';

  return (
    <div className="min-h-screen bg-black lg:grid lg:grid-cols-2">
      {/* Compact brand banner — phones and tablets (below lg) */}
      <div className="lg:hidden relative overflow-hidden">
        <div
          className="h-2 w-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #F2C230, #F2C230 10px, #0D0D0D 10px, #0D0D0D 20px)'
          }}
        />
        <div className="relative px-6 py-8 overflow-hidden">
          <div className="absolute inset-0 flex items-center overflow-hidden opacity-[0.08]" aria-hidden="true">
            <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '22s' }}>
              {[0, 1].map((g) => (
                <div key={g} className="flex shrink-0">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="text-transparent text-[3rem] font-black uppercase leading-none px-6"
                      style={{ WebkitTextStroke: '2px rgba(242,194,48,0.9)' }}
                    >
                      Bodyworks Gym
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <Dumbbell className="w-9 h-9 text-[#F2C230] shrink-0" strokeWidth={1.5} />
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F5F5F0] leading-tight">
                {ADMIN_HEADLINE.join(' ')}
              </h1>
              <p className="text-xs text-[#999] uppercase tracking-widest mt-0.5">Bodyworks &middot; Sopore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full brand panel — lg and up */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 30% 30%, rgba(242,194,48,0.15), transparent 60%)' }}
        />
        <div className="absolute inset-0 flex items-center overflow-hidden opacity-[0.08]" aria-hidden="true">
          <div className="flex animate-marquee whitespace-nowrap" style={{ animationDuration: '28s' }}>
            {[0, 1].map((g) => (
              <div key={g} className="flex shrink-0">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="text-transparent text-[6rem] font-black uppercase leading-none px-8"
                    style={{ WebkitTextStroke: '2px rgba(242,194,48,0.9)' }}
                  >
                    Bodyworks Gym
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative h-2 w-24"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #F2C230, #F2C230 8px, #0D0D0D 8px, #0D0D0D 16px)'
          }}
        />

        <div className="relative">
          <Dumbbell className="w-10 h-10 text-[#F2C230] mb-6" strokeWidth={1.5} />
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tight text-[#F5F5F0] leading-tight">
            {ADMIN_HEADLINE[0]}<br /><span className="text-[#F2C230]">{ADMIN_HEADLINE[1]}</span>
          </h1>
          <p className="text-[#C6FF3D] mt-4 max-w-xs">{ADMIN_TAGLINE}</p>
        </div>

        <p className="relative text-xs text-[#666] uppercase tracking-widest">
          Bodyworks &middot; Sopore
        </p>
      </div>

      {/* Form panel — every screen size */}
      <div className="flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-sm animate-fade-up opacity-0">
          <div className="mb-8 lg:mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#F5F5F0]">
              Admin Login
            </h2>
            <p className="text-sm text-[#999] mt-1">Sign in to manage members</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={inputClass}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#F5F5F0] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#F2C230] text-black font-bold uppercase py-3 rounded hover:bg-[#C6FF3D] hover:-translate-y-0.5 transition-all disabled:opacity-90 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Dumbbell className="w-4 h-4 animate-dumbbell-pulse" />
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;