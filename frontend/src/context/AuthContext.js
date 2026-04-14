import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../api/authAPI';
import { cleanupReadNotifications } from '../api/notificationAPI';

const AuthContext = createContext(null);

const getAuthErrorMessage = (err, fallbackMessage) => {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.code === 'ECONNABORTED') {
    return 'Server took too long to respond. Please try again.';
  }

  if (err.message === 'Network Error') {
    return 'Cannot reach the API server. Check your backend URL and network connection.';
  }

  return err.message || fallbackMessage;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session
  const [error, setError]     = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token      = localStorage.getItem('token');
      const savedUser  = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await getMe();
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const res = await loginUser(email, password);
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData; // caller can use role to redirect
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Login failed. Please try again.');
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const res = await registerUser(formData);      // Backend returns { pendingVerification: true, phone, message } when OTP is sent
      if (res.pendingVerification) {
        return res; // caller handles OTP step
      }
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Registration failed. Please try again.');
      setError(message);
      throw new Error(message);
    }
  }, []);
  const loginWithData = useCallback((responseData) => {
    const { token, ...userData } = responseData;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);
  const logout = useCallback(async () => {
    try {
      // Cleanup read notifications before logout
      await cleanupReadNotifications();
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  }, []);

  const isAuthenticated = !!user;
  const normalizedRole  = (user?.role || '').toString().toLowerCase();
  const isWorker        = normalizedRole === 'worker';
  const isProvider      = normalizedRole === 'provider';
  const isAdmin         = normalizedRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        isWorker,
        isProvider,
        isAdmin,
        login,
        register,
        loginWithData,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
};

export default AuthContext;