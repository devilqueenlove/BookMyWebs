import { useState } from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [showLogin, setShowLogin] = useState(true);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
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
