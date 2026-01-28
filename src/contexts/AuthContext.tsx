import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types/library';

import { login as apiLogin, AuthResponse } from '@/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('library_user');
    const savedToken = localStorage.getItem('library_token');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Token is available for API calls via localStorage
    setIsLoading(false);
  }, []);

  // Login using real API
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await apiLogin({ email, password });
      setUser(response.user);
      localStorage.setItem('library_user', JSON.stringify(response.user));
      localStorage.setItem('library_token', response.token);
      
      // Dispatch event to trigger data refetch in other contexts
      window.dispatchEvent(new Event('user-logged-in'));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('library_user');
    localStorage.removeItem('library_token');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('library_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
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
