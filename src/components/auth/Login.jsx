import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail } from 'lucide-react';

export default function Login({ onSwitchToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, loginWithGoogle, resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      onLoginSuccess && onLoginSuccess();
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onLoginSuccess && onLoginSuccess();
    } catch (err) {
      setError('Failed to log in with Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    try {
      if (!email) {
        return setError('Please enter your email address');
      }
      setError('');
      setLoading(true);
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/10 text-teal-400 mb-4 border border-teal-500/20 shadow-lg shadow-teal-900/20">
          <LogIn size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-sm">Sign in to access your Mission Control</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
          {error}
        </div>
      )}
      {resetSent && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          Password reset email sent!
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
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all"
            placeholder="agent@webcity.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              Forgot?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-teal-900/20 hover:scale-[1.02] active:scale-[0.98] font-medium"
        >
          {loading ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Authenticating...</span>
          ) : (
            'Initialize Session'
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
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white/[0.03] border border-white/10 text-gray-300 py-3 px-4 rounded-xl hover:bg-white/[0.08] hover:text-white transition-all flex items-center justify-center gap-3 group"
        >
          <Mail className="group-hover:text-teal-400 transition-colors" size={18} />
          Google Account
        </button>
      </div>

      <div className="mt-8 text-center border-t border-white/5 pt-6">
        <p className="text-gray-500 text-sm">
          First time agent?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-teal-400 font-medium hover:text-teal-300 transition-colors ml-1"
          >
            Create Identity
          </button>
        </p>
      </div>
    </div>
  );
}
