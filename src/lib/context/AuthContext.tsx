import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TokenService } from '@/lib/services/TokenService';
import type { AuthResponse, UserSession } from '@/lib/types/auth';

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
  updateUser: (data: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('user');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse session:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (response: AuthResponse) => {
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    // Store tokens securely
    localStorage.setItem('accessToken', response.tokens.accessToken);
    localStorage.setItem('refreshToken', response.tokens.refreshToken);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    await supabase.auth.signOut();
  };

  const updateUser = (data: Partial<UserSession>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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