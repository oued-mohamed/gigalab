import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../types';
import { authAPI, apiUtils } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock API functions for development (when backend is not available)
const mockAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === "admin@test.com" && credentials.password === "password") {
      return {
        user: {
          id: "1",
          email: credentials.email,
          name: "John Doe",
          role: "USER",
          isVerified: true,
          phone: "+1234567890",
          dateOfBirth: "1990-01-01",
          gender: "MALE",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token"
        }
      };
    }
    throw new Error("Invalid credentials");
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: "1",
        email: data.email,
        name: data.name,
        role: "USER",
        isVerified: false,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      tokens: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token"
      }
    };
  },

  getProfile: async (): Promise<User> => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    throw new Error("No user found");
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    throw new Error("No user found");
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real implementation, this would verify current password and update
    return;
  },

  deleteAccount: async (): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }
};

// Mock apiUtils for development
const mockApiUtils = {
  setAuthTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  clearAuthTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getAuthTokens: () => {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken')
    };
  }
};

// Function to check if we should use mock API (when real API is not available)
const shouldUseMockAPI = () => {
  // You can change this logic based on your needs
  // For example: check if environment is development, or if API_URL is not set
  return !import.meta.env.VITE_API_URL || import.meta.env.VITE_USE_MOCK_API === 'true';
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Choose which API to use
  const api = shouldUseMockAPI() ? mockAPI : authAPI;
  const utils = shouldUseMockAPI() ? mockApiUtils : apiUtils;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const tokens = utils.getAuthTokens();
      
      if (tokens.accessToken) {
        // Try to get user profile with existing token
        const userProfile = await api.getProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token might be expired, clear it
      utils.clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.login(credentials);
      
      // Store tokens
      utils.setAuthTokens(response.tokens);
      
      // Store user in localStorage for mock API
      if (shouldUseMockAPI()) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Set user state
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.register(data);
      
      // Store tokens
      utils.setAuthTokens(response.tokens);
      
      // Store user in localStorage for mock API
      if (shouldUseMockAPI()) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Set user state
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful! Welcome to RDT Reader!');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const tokens = utils.getAuthTokens();
      
      if (tokens.refreshToken) {
        await api.logout(tokens.refreshToken);
      }
    } catch (error) {
      // Ignore logout errors, clear local state anyway
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      utils.clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    try {
      await api.changePassword(data);
      
      // After password change, user needs to login again
      await logout();
      toast.success('Password changed successfully. Please login again.');
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      await api.deleteAccount();
      
      // Clear local state
      utils.clearAuthTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Account deleted successfully');
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (isAuthenticated) {
        const userProfile = await api.getProfile();
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to login again
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
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