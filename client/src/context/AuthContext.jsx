import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import Loader from '../components/Loader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      // Provide a small artificial delay so the app boot loader is visible to the user
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
    initAuth();
  }, []);

  // SESSION TIMEOUT LOGIC
  useEffect(() => {
    if (!user) return;

    // Timeout duration: 24 hour (86,400 000 ms)
    const TIMEOUT_DURATION = 86400000;
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Session expired due to inactivity');
        logout();
        window.location.href = '/login?expired=true';
      }, TIMEOUT_DURATION);
    };

    // Events to track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Set initial timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Handle logout in other tabs or interceptors
    const handleStorageChange = (e) => {
      if ((e.key === 'token' || e.key === 'user') && !e.newValue) {
        setUser(null);
        window.location.href = '/login?expired=true';
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically if the token was removed by the interceptor
    const checkInterval = setInterval(() => {
      if (user && !localStorage.getItem('token')) {
        console.log('Token missing, logging out...');
        setUser(null);
        window.location.href = '/login?expired=true';
      }
    }, 2000);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(checkInterval);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const login = async (email, password) => {
    if (!navigator.onLine) {
      throw new Error('Please check your internet connection and try again.');
    }
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    // Registration now requires email verification before login
    // So we don't auto-set the user — just return the response data
    const data = await authService.register(userData);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {loading ? <Loader fullScreen text="Initializing Application..." /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
