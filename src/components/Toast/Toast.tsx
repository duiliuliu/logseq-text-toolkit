import React, { useState, useEffect, useRef } from 'react';
import { getWindow } from '../../logseq/utils';
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

let toastIdCounter = 0;

const generateToastId = (): string => {
  const timestamp = Date.now().toString(36);
  const counter = (++toastIdCounter).toString(36).padStart(3, '0');
  return `toast-${timestamp}-${counter}`;
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addToast = (message: string, type: ToastType = 'info', timeout: number = 3000) => {
    const id = generateToastId();
    const newToast: Toast = { id, message, type, timeout };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, timeout);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    const win = getWindow();
    (win as any).addToast = addToast;
    return () => {
      delete (win as any).addToast;
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

export const toast = {
  info: (message: string, timeout?: number) => {
    const win = getWindow();
    (win as any).addToast?.(message, 'info', timeout);
  },
  error: (message: string, timeout?: number) => {
    const win = getWindow();
    (win as any).addToast?.(message, 'error', timeout);
  },
  warning: (message: string, timeout?: number) => {
    const win = getWindow();
    (win as any).addToast?.(message, 'warning', timeout);
  },
  success: (message: string, timeout?: number) => {
    const win = getWindow();
    (win as any).addToast?.(message, 'success', timeout);
  }
};

export default ToastContainer;