import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      const deviceModel = await getClientDeviceModel();
      await login(email, password, deviceModel);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  const inputClass =
    'bg-[#1A1A1A] border border-[#333] rounded px-4 py-3 text-sm w-full text-[#F5F5F0] placeholder-[#666] focus:outline-none focus:border-[#F2C230] transition-colors';

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#1A1A1A] border border-[#F2C230] rounded-full p-4 mb-4">
            <Lock className="w-6 h-6 text-[#F2C230]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F5F5F0]">
            Admin Login
          </h1>
          <p className="text-sm text-[#999] mt-1">Bodyworks Gym</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#F5F5F0] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F2C230] text-black font-bold uppercase py-3 rounded hover:bg-[#C6FF3D] transition-colors"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;