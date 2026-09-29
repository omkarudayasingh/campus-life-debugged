import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);

  useEffect(() => {
    // Restore session on page load
    const savedToken = localStorage.getItem('campus_auth_token');
    const savedUser = localStorage.getItem('campus_auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setMustChangePassword(Boolean(parsedUser.mustChangePassword));
      } catch (e) {
        localStorage.removeItem('campus_auth_token');
        localStorage.removeItem('campus_auth_user');
      }
    }

    setLoading(false);

    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
      setMustChangePassword(false);
    };

    window.addEventListener('campus_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('campus_auth_expired', handleAuthExpired);
  }, []);

  const login = async (login_id, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { login_id, password },
    });

    setToken(data.token);
    setUser(data.user);
    setMustChangePassword(Boolean(data.mustChangePassword));

    localStorage.setItem('campus_auth_token', data.token);
    localStorage.setItem('campus_auth_user', JSON.stringify(data.user));

    return data;
  };

  const changePassword = async (newPassword, currentPassword) => {
    const data = await apiFetch('/auth/change-password', {
      method: 'POST',
      body: { newPassword, currentPassword },
    });

    setToken(data.token);
    setUser(data.user);
    setMustChangePassword(false);

    localStorage.setItem('campus_auth_token', data.token);
    localStorage.setItem('campus_auth_user', JSON.stringify(data.user));

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setMustChangePassword(false);
    localStorage.removeItem('campus_auth_token');
    localStorage.removeItem('campus_auth_user');
  };

  // Demo Switcher Helper for seamless hackathon evaluations
  const quickSwitch = async (login_id) => {
    try {
      return await login(login_id, 'cam@123');
    } catch (err) {
      console.warn('Quick switch login failed (password may have been changed):', err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        mustChangePassword,
        loading,
        lowBandwidthMode,
        setLowBandwidthMode,
        login,
        changePassword,
        logout,
        quickSwitch,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
