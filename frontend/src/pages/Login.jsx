import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  const inputClass =
    'bg-[#1A1A1A] border border-[#333] rounded px-4 py-3 text-sm w-full placeholder-[#666] focus:outline-none focus:border-[#F2C230] transition-colors';

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
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