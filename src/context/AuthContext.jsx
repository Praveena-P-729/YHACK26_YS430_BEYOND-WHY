import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('landguard_token');
      const cachedUser = localStorage.getItem('landguard_user');
      
      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          const freshUser = await api.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('landguard_user', JSON.stringify(freshUser));
        } catch (e) {
          console.warn('Session check fallback to cached user:', e);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (emailOrPhone, password) => {
    try {
      const data = await api.login(emailOrPhone, password);
      localStorage.setItem('landguard_token', data.access_token);
      localStorage.setItem('landguard_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Offline fallback profiles for resilient demo testing
      const demoUsers = {
        'praveena': {
          id: 1,
          user_id: 1,
          full_name: 'Praveena',
          email: 'praveena@landguard.ai',
          phone: '+91 94432 98765',
          role: 'field_officer',
          badge_number: 'NER-CMD-729',
          department: 'North-Eastern Regional Disaster Management Authority (NER-SDMA)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        },
        'praveena@landguard.ai': {
          id: 1,
          user_id: 1,
          full_name: 'Praveena',
          email: 'praveena@landguard.ai',
          phone: '+91 94432 98765',
          role: 'field_officer',
          badge_number: 'NER-CMD-729',
          department: 'North-Eastern Regional Disaster Management Authority (NER-SDMA)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        },
        'praveena.admin@landguard.ai': {
          id: 3,
          user_id: 3,
          full_name: 'Praveena (State Administrator)',
          email: 'praveena.admin@landguard.ai',
          phone: '+91 98401 23456',
          role: 'admin',
          badge_number: 'NER-ADMIN-729',
          department: 'National Disaster Management Authority (NDMA)',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        },
        'citizen@landguard.ai': {
          id: 4,
          user_id: 4,
          full_name: 'Praveena',
          email: 'citizen@landguard.ai',
          phone: '+91 98401 99887',
          role: 'citizen',
          department: 'North-Eastern Resident Community & Hill Panchayat',
          avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        },
        'officer@landguard.ai': {
          id: 1,
          user_id: 1,
          full_name: 'Praveena',
          email: 'officer@landguard.ai',
          phone: '+91 94432 98765',
          role: 'field_officer',
          badge_number: 'NER-CMD-729',
          department: 'North-Eastern Regional Disaster Management Authority (NER-SDMA)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        },
        'admin@landguard.ai': {
          id: 3,
          user_id: 3,
          full_name: 'Praveena (Admin)',
          email: 'admin@landguard.ai',
          phone: '+91 98401 23456',
          role: 'admin',
          badge_number: 'NER-ADMIN-729',
          department: 'National Disaster Management Authority (NDMA)',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString()
        }
      };

      if (demoUsers[emailOrPhone]) {
        const u = demoUsers[emailOrPhone];
        localStorage.setItem('landguard_token', 'demo-jwt-token-2026');
        localStorage.setItem('landguard_user', JSON.stringify(u));
        setUser(u);
        return u;
      }
      throw err;
    }
  };

  const register = async (userData) => {
    await api.register(userData);
    return login(userData.email, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('landguard_token');
    localStorage.removeItem('landguard_user');
    setUser(null);
  };

  const toggleEmergencyMode = () => {
    setEmergencyMode(prev => !prev);
  };

  const getHomeRoute = (targetUser = user) => {
    if (!targetUser) return '/login';
    if (targetUser.role === 'citizen') return '/citizen-dashboard';
    return '/dashboard';
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      emergencyMode,
      toggleEmergencyMode,
      getHomeRoute
    }}>
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
