import { createContext } from 'react';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  photo?: string;
  permissions?: Record<string, Record<string, boolean>>;
  status: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve' | 'assign') => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
