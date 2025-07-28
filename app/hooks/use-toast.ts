import { useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  autoHideDuration?: number;
}

export default function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, message: string, autoHideDuration = 3) => {
    const _autoHideDuration = autoHideDuration * 1000;
    const id = Date.now().toString() + Math.random().toString();
    const newToast: ToastMessage = { id, message, type, autoHideDuration: _autoHideDuration };
    setToasts((prev) => [...prev, newToast]);

    // 자동으로 토스트 제거
    if (_autoHideDuration > 0) {
      setTimeout(() => removeToast(id), _autoHideDuration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, autoHideDuration?: number) => {
      showToast('success', message, autoHideDuration);
    },
    [showToast],
  );

  const error = useCallback(
    (message: string, autoHideDuration?: number) => {
      showToast('error', message, autoHideDuration);
    },
    [showToast],
  );

  const warning = useCallback(
    (message: string, autoHideDuration?: number) => {
      showToast('warning', message, autoHideDuration);
    },
    [showToast],
  );

  const info = useCallback(
    (message: string, autoHideDuration?: number) => {
      showToast('info', message, autoHideDuration);
    },
    [showToast],
  );

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
}
