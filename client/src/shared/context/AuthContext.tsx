import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';
import { AuthContext, type User } from './AuthContext.new';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response: any = await api.get('/auth/me');
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const hasPermission = (
    moduleName: string, 
    action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'assign'
  ): boolean => {
    if (!user) return false;
    if (user.role === 'Super Admin') return true;
    if (user.role === 'Admin') return true;
    
    const modulePerms = user.permissions?.[moduleName];
    return !!modulePerms?.[action];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, checkAuth, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

