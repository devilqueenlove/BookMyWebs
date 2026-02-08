import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps the app and provides auth context
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user with email and password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // Logout the current user
  function logout() {
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Set up an observer for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      // Sync auth state to Chrome extension via localStorage
      // The content script will read this and send to the extension
      try {
        if (user) {
          const token = await user.getIdToken();
          const authData = {
            user: { uid: user.uid, email: user.email },
            idToken: token,
            timestamp: Date.now()
          };
          localStorage.setItem('bmw_ext_auth', JSON.stringify(authData));
        } else {
          localStorage.removeItem('bmw_ext_auth');
        }
      } catch (e) {
        // Silently ignore - extension communication is optional
      }
    });

    // Clean up the observer on unmount
    return unsubscribe;
  }, []);

  // Values to expose through the context
  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
