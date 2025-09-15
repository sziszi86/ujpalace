'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 AuthContext: checkAuth started');
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔍 AuthContext: token exists?', !!token);
      
      if (!token) {
        console.log('🔍 AuthContext: no token, setting user null');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('🔍 AuthContext: calling /api/auth/me');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('🔍 AuthContext: /api/auth/me response ok?', response.ok);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('🔍 AuthContext: user data received', userData);
        setUser(userData);
      } else {
        console.log('🔍 AuthContext: removing invalid token');
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('🔍 Auth check failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
    } finally {
      console.log('🔍 AuthContext: setting loading false');
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem('authToken', token);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}