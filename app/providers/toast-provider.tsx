import React, { createContext, useContext } from 'react';
import useToast, { type ToastType } from '~/hooks/use-toast';
import Toast from '~/components/global-toast';

interface ToastContextType {
  showToast: (type: ToastType, message: string, autoHideDuration?: number) => void;
  success: (message: string, autoHideDuration?: number) => void;
  error: (message: string, autoHideDuration?: number) => void;
  warning: (message: string, autoHideDuration?: number) => void;
  info: (message: string, autoHideDuration?: number) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, showToast, success, error, warning, info, removeToast, clearAllToasts } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast, clearAllToasts }}>
      {children}
      <Toast toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useGlobalToast must be used within a ToastProvider');
  }
  return context;
}; 