import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ROUTES } from '~/constants';
import { tokenManager } from '~/lib/token-manger';
import { buildApi } from '~/lib/api-builder';
import { AdminRoleType } from '~/lib/types';
import { useGlobalToast } from '~/providers/toast-provider';

type User = {
  email: string;
  name: string;
  role: AdminRoleType;
  isActive: boolean;
};

const meApi = buildApi<User>({ path: '/admins/me', method: 'GET' });
const signinApi = buildApi<{ admin: User; accessToken: string }>({ path: '/auth/signin', method: 'POST', credentials: 'include' });
const signoutApi = buildApi({ path: '/auth/signout', method: 'POST', credentials: 'include' });

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
  const { warning } = useGlobalToast(); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkAuth = React.useCallback(async () => {
    try {
      // TODO: 
      // const userInfo = await meApi();
      // if (!userInfo.isActive) throw new Error('user is not active');

      setUser({ email: 'god@test.com', name: 'god', role: AdminRoleType.SUPER_ADMIN, isActive: true });
      setIsAuthenticated(true);
    } catch (error) {
      console.log(error?.message || error)
      tokenManager.clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);

      if (pathname !== ROUTES.SIGNIN) {
        warning('로그인이 만료됐습니다. 다시 로그인해주세요.');
        navigate(ROUTES.SIGNIN + '?redirect=' + encodeURIComponent(pathname));
      }
    }
  }, [pathname, navigate, warning]);

  useEffect(() => {
    checkAuth();
  }, []); // 컴포넌트 마운트 시에만 실행

  const signin = React.useCallback(async (email: string, password: string) => {
    const result = await signinApi({ body: { email, password } });
    tokenManager.setAccessToken(result.accessToken);
    setUser(result.admin);
    setIsAuthenticated(true);
  }, []); // 의존성 제거

  const signout = React.useCallback(async () => {
    await signoutApi();
    setUser(null);
    setIsAuthenticated(false);
    navigate(ROUTES.SIGNIN);
  }, [navigate]);

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
