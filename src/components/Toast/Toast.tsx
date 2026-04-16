import React, { useState, useEffect, useRef } from 'react';
import './Toast.css';

type ToastType = 'info' | 'error' | 'warning' | 'success';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeout: number;
}

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 添加新的提示
  const addToast = (message: string, type: ToastType = 'info', timeout: number = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, timeout };
    setToasts(prev => [...prev, newToast]);

    // 自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, timeout);
  };

  // 移除提示
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 暴露 addToast 方法到全局
  useEffect(() => {
    (window as any).addToast = addToast;
    return () => {
      delete (window as any).addToast;
    };
  }, []);

  return (
    <div className={`toast-container toast-${position}`} ref={containerRef}>
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'toastExit') {
              removeToast(toast.id);
            }
          }}
        >
          <div className="toast-content">
            <div className="toast-message">{toast.message}</div>
          </div>
          <button 
            className="toast-close"
            onClick={() => removeToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

// 导出便捷方法
export const toast = {
  info: (message: string, timeout?: number) => {
    (window as any).addToast?.(message, 'info', timeout);
  },
  error: (message: string, timeout?: number) => {
    (window as any).addToast?.(message, 'error', timeout);
  },
  warning: (message: string, timeout?: number) => {
    (window as any).addToast?.(message, 'warning', timeout);
  },
  success: (message: string, timeout?: number) => {
    (window as any).addToast?.(message, 'success', timeout);
  }
};

export default ToastContainer;