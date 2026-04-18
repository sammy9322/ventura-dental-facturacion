import { useState, useEffect } from 'react';
import { authService } from '../services';
import type { Usuario } from '../types';

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };
}
