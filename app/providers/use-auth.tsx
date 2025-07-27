import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenManager } from '~/lib/token-manger';
import { buildApi } from '~/lib/api-builder';
import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '~/constants';
import type { AdminRoleType } from '~/lib/types';

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
      navigate(ROUTES.SIGNIN);
      // TODO: pathname 에 따라 로그인 후 navigate 처리
    }
  }, [tokenManager]);

  useEffect(() => {
    checkAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    const result = await signinApi({ body: { email, password } });
    tokenManager.setAccessToken(result.accessToken);
    setUser(result.admin);
    setIsAuthenticated(true);
  };

  const signout = async () => {
    await signoutApi();
    setUser(null);
    setIsAuthenticated(false);
    navigate(ROUTES.SIGNIN);
  };

  return <AuthContext.Provider value={{ isAuthenticated, user, signin, signout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
