import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '~/components/toast';

export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const;
export type ToastType = (typeof TOAST_TYPE)[keyof typeof TOAST_TYPE];

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const removingRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  // 컴포넌트 마운트 상태 추적
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // 모든 타임아웃 정리
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
      removingRef.current.clear();
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    if (!isMountedRef.current) return;
    
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // 자동으로 토스트 제거 (애니메이션 포함)
    if (duration > 0) {
      const timeoutId = setTimeout(() => {
        if (!isMountedRef.current || removingRef.current.has(id)) return;
        
        // 이미 제거 중인지 확인
        if (removingRef.current.has(id)) return;
        removingRef.current.add(id);
        
        // 먼저 슬라이드 아웃 애니메이션 시작
        setToasts(prev => 
          prev.map(toast => 
            toast.id === id ? { ...toast, isExiting: true } : toast
          )
        );
        
        // 애니메이션 완료 후 실제 제거
        const removeTimeoutId = setTimeout(() => {
          if (!isMountedRef.current) return;
          
          setToasts(prev => prev.filter(toast => toast.id !== id));
          timeoutRefs.current.delete(id);
          removingRef.current.delete(id);
        }, 300);
        
        timeoutRefs.current.set(id, removeTimeoutId);
      }, duration);
      
      timeoutRefs.current.set(id, timeoutId);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    if (!isMountedRef.current || removingRef.current.has(id)) return;
    
    // 이미 제거 중인지 확인
    if (removingRef.current.has(id)) return;
    removingRef.current.add(id);
    
    // 기존 타임아웃 정리
    const existingTimeout = timeoutRefs.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutRefs.current.delete(id);
    }
    
    // 수동 제거 시에도 애니메이션 적용
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, isExiting: true } : toast
      )
    );
    
    // 애니메이션 완료 후 실제 제거
    const removeTimeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      setToasts(prev => prev.filter(toast => toast.id !== id));
      timeoutRefs.current.delete(id);
      removingRef.current.delete(id);
    }, 300);
    
    timeoutRefs.current.set(id, removeTimeoutId);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="transition-all duration-300 ease-in-out transform"
            style={{ 
              transform: `translateY(${index * 0.5}rem)`,
              opacity: toast.isExiting ? 0 : 1,
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              isExiting={toast.isExiting}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 