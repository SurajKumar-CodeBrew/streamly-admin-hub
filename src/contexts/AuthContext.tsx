import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, LoginResponse } from '@/lib/api';

interface User {
  adminId: string;
  username: string;
  email: string;
  role: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  getRememberedCredentials: () => { username: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      const response: LoginResponse = await apiService.login(email, password, rememberMe);
      
      const userData: User = {
        adminId: response.admin.adminId,
        username: response.admin.username,
        email: response.admin.email,
        role: response.admin.role,
        lastLogin: response.admin.lastLogin
      };
      
      setUser(userData);
      
      // Store token and user data based on rememberMe preference
      // If API returns rememberMe true, use localStorage, otherwise use sessionStorage
      const useLocalStorage = response.rememberMe || rememberMe;
      const storage = useLocalStorage ? localStorage : sessionStorage;
      storage.setItem('adminToken', response.token);
      storage.setItem('adminUser', JSON.stringify(userData));
      
      // Handle remember me credentials
      if (response.rememberMe) {
        // Save username for future auto-population
        apiService.saveRememberedCredentials(email);
        console.log(`Credentials saved for future login. Token expires in: ${response.tokenExpiration}`);
      } else if (rememberMe === false) {
        // Clear any previously saved credentials if user explicitly set rememberMe to false
        apiService.clearRememberedCredentials();
        console.log('Previously saved credentials cleared due to unchecked Remember Me');
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API to invalidate token on server
      await apiService.logout();
      console.log('Successfully logged out from server');
    } catch (error) {
      // Even if API call fails, we still want to log out locally
      console.error('Logout API error (continuing with local logout):', error);
    } finally {
      // Always clear local data regardless of API call result
      setUser(null);
      apiService.clearAuthData();
      
      // Don't clear remembered credentials on logout - they should persist
      // unless user explicitly unchecks "Remember Me" on next login
      
      // Force redirect to login page
      window.location.href = '/login';
    }
  };

  const getRememberedCredentials = () => {
    return apiService.getRememberedCredentials();
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    loading,
    getRememberedCredentials
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
