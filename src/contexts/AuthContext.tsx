import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authAPI } from '../api/auth';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string, employeeId: string) => Promise<boolean>;
  updateProfile: (updates: { username?: string; password?: string }) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('absentra_user');
    const storedToken = localStorage.getItem('absentra_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('absentra_user');
        localStorage.removeItem('absentra_token');
      }
    }
    setLoading(false);
  }, []);
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await authAPI.login(username, password);
      
      if (result) {
        setUser(result.user);
        localStorage.setItem('absentra_user', JSON.stringify(result.user));
        localStorage.setItem('absentra_token', result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, password: string, employeeId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await authAPI.register(username, password, employeeId);
      
      if (result) {
        setUser(result.user);
        localStorage.setItem('absentra_user', JSON.stringify(result.user));
        localStorage.setItem('absentra_token', result.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('absentra_user');
    localStorage.removeItem('absentra_token');
  };

  const updateProfile = async (updates: { username?: string; password?: string }): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('absentra_token') || '';
      const result = await authAPI.updateProfile(user.id, updates, token);
      
      if (result) {
        setUser(result);
        localStorage.setItem('absentra_user', JSON.stringify(result));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};