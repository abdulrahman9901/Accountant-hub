/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User } from '../types';
import { request } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await request('/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout request failed', e);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await request<User>('/user');
      setUser(response.data);
    } catch (e) {
      console.error('Auth verification failed', e);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    
    const verify = async () => {
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const response = await request<User>('/user');
        if (active) setUser(response.data);
      } catch (e) {
        console.error('Auth verification failed', e);
        if (active) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
