import React, { useEffect, useState } from 'react';
import { useToasts } from '../hooks/useToast';

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), 300);
    return () => clearTimeout(enterTimer);
  }, []);

  const handleClose = () => {
    setPhase('exiting');
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div className={`toast toast--${type} toast--${phase}`} role="alert">
      <span className="toast__icon" aria-hidden="true">
        {ICONS[type]}
      </span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={handleClose}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          message={t.message}
          type={t.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
