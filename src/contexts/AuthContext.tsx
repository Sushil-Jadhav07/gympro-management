import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { AuthService, mockUsers } from '@/lib/auth';
import api from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = AuthService.getToken();
        const savedUser = AuthService.getUser();

        if (token && savedUser && !AuthService.isTokenExpired(token)) {
          setUser(savedUser);
        } else if (token && AuthService.isTokenExpired(token)) {
          // Try to refresh token
          try {
            const response = await api.refreshToken();
            if (response.success && response.data) {
              AuthService.setToken(response.data.token);
              setUser(savedUser);
            } else {
              AuthService.logout();
            }
          } catch (error) {
            AuthService.logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // For demo purposes, use mock authentication
      // In production, this would make an API call
      const mockUser = Object.values(mockUsers).find(u => u.email === email);
      
      if (mockUser && password === 'password') {
        const mockToken = 'mock-jwt-token-' + Date.now();
        AuthService.setToken(mockToken);
        AuthService.setUser(mockUser);
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }

      // Uncomment for real API integration:
      // const response = await api.login(email, password);
      // if (response.success && response.data) {
      //   AuthService.setToken(response.data.token);
      //   AuthService.setUser(response.data.user);
      //   setUser(response.data.user);
      // } else {
      //   throw new Error(response.message || 'Login failed');
      // }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.removeToken();
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    return AuthService.hasRole(role);
  };

  const hasPermission = (permission: string): boolean => {
    return AuthService.hasPermission(permission);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;