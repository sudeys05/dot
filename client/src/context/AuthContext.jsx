import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies in requests
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Redirect to login page after logout
      window.location.href = '/';
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔐 Registration attempt for:', userData.username);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      let data;
      try {
        data = await response.json();
        console.log('📊 Registration response:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }

      if (response.ok) {
        console.log('✅ Registration successful:', data);
        return {
          success: true,
          message: data.message || 'User registered successfully',
          user: data.user
        };
      } else {
        console.error('❌ Registration failed:', data);
        return {
          success: false,
          message: data.message || `Registration failed: ${response.status}`
        };
      }
    } catch (error) {
      console.error('❌ Registration network error:', error);
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  };

  const forgotPassword = async (username) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: data.message, 
          token: data.token,
          emailSent: data.emailSent 
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Forgot password failed:', error);
      return { success: false, message: 'Request failed. Please try again.' };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      return { success: false, message: 'Reset failed. Please try again.' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, message: 'Update failed. Please try again.' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};