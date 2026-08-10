import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Validate and fetch fresh user profile from backend
          const res = await axiosClient.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Failed to verify token on startup:', error.message);
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login action
  const login = async (email, password) => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: loggedUser } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Register action
  const register = async (name, studentId, semester, department, email, password) => {
    try {
      const res = await axiosClient.post('/auth/register', {
        name,
        studentId,
        semester,
        department,
        email,
        password,
      });
      if (res.data.success) {
        const { token, user: registeredUser } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        return { success: true };
      }
      return { success: false, message: 'Registration failed.' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Check details and try again.';
      return { success: false, message };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout request failed', error.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Update profile action
  const updateProfile = async (profileData) => {
    try {
      const res = await axiosClient.put('/users/profile', profileData);
      if (res.data.success && res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
