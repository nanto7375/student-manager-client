import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '~/constants';
import { tokenManager } from '~/lib/token-manger';
import { buildApi } from '~/lib/api-builder';
import type { AdminRoleType } from '~/lib/types';
import { TOAST_TYPE, useToast } from './toast-provider';

type User = {
  email: string;
  name: string;
  role: AdminRoleType;
  isActive: boolean;
};

const meApi = buildApi<User>({ url: '/admins/me', method: 'GET' });
const signinApi = buildApi<{ admin: User; accessToken: string }>({ url: '/auth/signin', method: 'POST', credentials: 'include' });
const signoutApi = buildApi({ url: '/auth/signout', method: 'POST', credentials: 'include' });

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signin: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showToast } = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = React.useCallback(async () => {
    let userInfo: User | null = null;
    try {
      userInfo = await meApi();
      if (!userInfo.isActive) throw new Error('user is not active');

      setUser(userInfo);
      setIsAuthenticated(true);
    } catch (error) {
      tokenManager.clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      if (pathname !== ROUTES.SIGNIN) {
        navigate(ROUTES.SIGNIN + '?redirect=' + encodeURIComponent(pathname));
        showToast('로그인이 만료됐습니다.', TOAST_TYPE.WARNING);
      }
    }
  }, [tokenManager]);

  useEffect(() => {
    checkAuth();
  }, []);

  const signin = React.useCallback(async (email: string, password: string) => {
    const result = await signinApi({ body: { email, password } });
    tokenManager.setAccessToken(result.accessToken);
    setUser(result.admin);
    setIsAuthenticated(true);
  }, [tokenManager]);

  const signout = React.useCallback(async () => {
    await signoutApi();
    setUser(null);
    setIsAuthenticated(false);
    navigate(ROUTES.SIGNIN);
  }, [tokenManager]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
