import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TOAST_COLORS = {
  success: { bg: 'var(--color-success-light)', border: 'var(--color-success)', text: 'var(--text-main)', icon: 'var(--color-success)' },
  error:   { bg: 'var(--color-danger-light)', border: 'var(--color-danger)', text: 'var(--text-main)', icon: 'var(--color-danger)' },
  info:    { bg: 'var(--color-primary-light)', border: 'var(--color-primary)', text: 'var(--text-main)', icon: 'var(--color-primary)' },
};

const TOAST_DURATION = 3000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++counterRef.current;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 300);
    }, TOAST_DURATION);
  }, []);

  const toast = {
    success: (message) => addToast(message, 'success'),
    error:   (message) => addToast(message, 'error'),
    info:    (message) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container - Fixed top-right */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {toasts.map((t) => {
          const colors = TOAST_COLORS[t.type] || TOAST_COLORS.info;
          const IconComponent = TOAST_ICONS[t.type] || Info;

          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '10px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                fontFamily: 'var(--font-family)',
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text,
                pointerEvents: 'auto',
                animation: t.exiting
                  ? 'toastSlideOut 0.3s ease-in forwards'
                  : 'toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <IconComponent size={18} style={{ color: colors.icon, flexShrink: 0 }} />
              <span style={{ lineHeight: '1.4' }}>{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* Toast Animations */}
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes toastSlideOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
