import React, { useState, createContext, useEffect, useCallback } from 'react';
import apiClient from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        const slug = response.data.user.storeId?.slug || response.data.user.storeSlug;
        if (slug) {
          localStorage.setItem('storeSlug', slug);
        }
      }
    } catch (error) {
      console.warn("No se pudo obtener el perfil detallado:", error.message);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/auth/protected');
        setIsLoggedIn(true);
        if (response.data && response.data.user) {
          setUser(response.data.user);
          const slug = response.data.user.storeId?.slug || response.data.user.storeSlug;
          if (slug) {
            localStorage.setItem('storeSlug', slug);
          }
        }
        // Intentar enriquecer con los datos completos del perfil
        await fetchProfile();
      } catch (error) {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [fetchProfile]);

  const login = async (nombre, contraseña) => {
    try {
      const response = await apiClient.post('/auth/login', { nombre, contraseña });
      const userData = response.data.user;
      setUser(userData);
      setIsLoggedIn(true);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      const slug = userData?.storeId?.slug || userData?.storeSlug;
      if (slug) {
        localStorage.setItem('storeSlug', slug);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('storeSlug');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...updatedFields } : updatedFields;
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, loading, updateUser, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
