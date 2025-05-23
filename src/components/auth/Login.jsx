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
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Log In to SaveMyWebs</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {resetSent && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Password reset email sent!</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="********"
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={handleResetPassword}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Forgot Password?
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <LogIn className="mr-2" size={18} />
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      
      <div className="mt-4">
        <div className="relative flex items-center justify-center mt-4 mb-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <div className="mx-4 text-gray-500 text-sm">or</div>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
        >
          <Mail className="mr-2" size={18} />
          Continue with Google
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToSignup}
            className="text-gray-800 font-medium hover:underline focus:outline-none"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
