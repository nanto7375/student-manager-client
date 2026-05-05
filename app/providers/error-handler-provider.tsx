import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useGlobalToast } from './toast-provider';
import { tokenManager } from '~/lib/token-manger';
import { auth } from '~/lib/auth';
import { ROUTES } from '~/constants';
import { setGlobalErrorHandler } from '~/lib/pending-request';

interface ErrorHandlerContextType {
  handleError: (error: any) => void;
  handleTokenRefreshError: (error: any) => void;
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | undefined>(undefined);

export const ErrorHandlerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { error: showErrorToast } = useGlobalToast();

  const handleTokenRefreshError = useCallback((error: any) => {
    tokenManager.clearAccessToken();
    auth.clearMyInfo();

    const errorMessage = error?.message || '세션이 만료되었습니다. 다시 로그인해주세요.';
    showErrorToast(errorMessage);

    navigate(ROUTES.SIGNIN, { replace: true });
  }, [navigate, showErrorToast]);

  const handleError = useCallback((error: any) => {
    const status = error?.status || error?.code;

    if (status === 401) {
      handleTokenRefreshError(error);
      return;
    }

    const errorMessage = error?.message || '오류가 발생했습니다.';
    showErrorToast(errorMessage);
  }, [handleTokenRefreshError, showErrorToast]);

  useEffect(() => {
    setGlobalErrorHandler(handleTokenRefreshError);
  }, [handleTokenRefreshError]);

  return (
    <ErrorHandlerContext.Provider value={{ handleError, handleTokenRefreshError }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

export const useErrorHandler = () => {
  const context = useContext(ErrorHandlerContext);
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorHandlerProvider');
  }
  return context;
};
