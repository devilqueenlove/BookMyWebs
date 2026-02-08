import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail } from 'lucide-react';

export default function Signup({ onSwitchToLogin, onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      onSignupSuccess && onSignupSuccess();
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onSignupSuccess && onSignupSuccess();
    } catch (err) {
      setError('Failed to sign up with Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 text-violet-400 mb-4 border border-violet-500/20 shadow-lg shadow-violet-900/20">
          <UserPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">New Agent Identity</h2>
        <p className="text-gray-500 text-sm">Create your Mission Control access</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all"
            placeholder="agent@webcity.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-violet-900/20 hover:scale-[1.02] active:scale-[0.98] font-medium"
        >
          {loading ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Registering...</span>
          ) : (
            'Create Identity'
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-white/10 flex-grow"></div>
          <div className="mx-4 text-gray-600 text-xs uppercase tracking-wider">Or continue with</div>
          <div className="border-t border-white/10 flex-grow"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-white/[0.03] border border-white/10 text-gray-300 py-3 px-4 rounded-xl hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center gap-3 group"
        >
          <Mail className="group-hover:text-violet-400 transition-colors" size={18} />
          Google Account
        </button>
      </div>

      <div className="mt-8 text-center border-t border-white/5 pt-6">
        <p className="text-gray-500 text-sm">
          Already an agent?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-white font-medium hover:text-violet-400 transition-colors ml-1"
          >
            Access Terminal
          </button>
        </p>
      </div>
    </div>
  );
}
