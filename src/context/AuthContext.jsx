import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token) {
      setUser({ token, email });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/admin/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setUser({ token, email });
    return response.data;
  };

  const register = async (email, password) => {
    const response = await api.post('/admin/register', { email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
