import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, fetchCurrentUser, fetchNotifications, fetchSettings } from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('interform_jwt_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('interform_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(user?.role || 'student');
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    collegeName: 'INTERFORM',
    tagline: 'Connect. Share. Plan.',
    logoUrl: ''
  });

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Atomic auth setter — sets token + user + role + localStorage in one call
  // This eliminates race conditions from separate setState calls
  const setAuthFromSetup = (newToken, newUser) => {
    localStorage.setItem('interform_jwt_token', newToken);
    localStorage.setItem('interform_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setRole(newUser.role);
  };

  const login = async (emailOrId, password) => {
    try {
      const res = await apiLogin({ emailOrId, password });
      setAuthFromSetup(res.token, res.user);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      loadNotifications();
      return res.user;
    } catch (err) {
      addToast(err.message || 'Login failed.', 'danger');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('student');
    localStorage.removeItem('interform_jwt_token');
    localStorage.removeItem('interform_user');
    addToast('Logged out successfully.', 'info');
  };

  const switchDemoRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    setRole(newRole);
    localStorage.setItem('interform_user', JSON.stringify(updated));
    addToast(`Switched view to ${newRole.toUpperCase()} mode`, 'info');
  };

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn('Could not load notifications:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Could not load college settings:', err);
    }
  };

  useEffect(() => {
    loadSettings();
    if (token) {
      loadNotifications();
    }
  }, [token]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      token,
      setToken,
      setRole,
      role,
      login,
      logout,
      setAuthFromSetup,
      switchDemoRole,
      toasts,
      addToast,
      notifications,
      loadNotifications,
      settings,
      setSettings,
      loadSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
