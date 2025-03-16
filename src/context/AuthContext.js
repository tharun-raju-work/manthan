import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    try {
      const data = await loginUser({ email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [navigate]);

  const register = useCallback(async (name, email, password) => {
    try {
      const data = await registerUser({ name, email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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