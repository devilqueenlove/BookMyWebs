import { useState } from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [showLogin, setShowLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="relative bg-[#161B22] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in scale-95 duration-300">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-violet-500 to-teal-500 opacity-50"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg z-10"
        >
          <X size={20} />
        </button>

        {showLogin ? (
          <Login
            onSwitchToSignup={() => setShowLogin(false)}
            onLoginSuccess={() => {
              onAuthSuccess && onAuthSuccess();
              onClose();
            }}
          />
        ) : (
          <Signup
            onSwitchToLogin={() => setShowLogin(true)}
            onSignupSuccess={() => {
              onAuthSuccess && onAuthSuccess();
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
