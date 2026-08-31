import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  confirmModal: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    onConfirm: () => void | Promise<void>;
  }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  destructive: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    destructive: false,
    onConfirm: () => {},
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3500) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => toast(message, 'success', duration),
    [toast]
  );
  const error = useCallback(
    (message: string, duration?: number) => toast(message, 'error', duration),
    [toast]
  );
  const info = useCallback(
    (message: string, duration?: number) => toast(message, 'info', duration),
    [toast]
  );

  const confirmModal = useCallback(
    (options: {
      title: string;
      message: string;
      confirmText?: string;
      cancelText?: string;
      destructive?: boolean;
      onConfirm: () => void | Promise<void>;
    }) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        destructive: options.destructive ?? false,
        onConfirm: options.onConfirm,
      });
    },
    []
  );

  const handleConfirm = async () => {
    const fn = confirmState.onConfirm;
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
    await fn();
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, confirmModal }}>
      {children}

      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-[320px] w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              t.type === 'success'
                ? 'bg-[var(--success-color)]/10 border-[var(--success-color)]/30 text-[var(--success-color)]'
                : t.type === 'error'
                ? 'bg-[var(--error-color)]/10 border-[var(--error-color)]/30 text-[var(--error-color)]'
                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 size={16} />}
              {t.type === 'error' && <AlertCircle size={16} />}
              {t.type === 'info' && <Info size={16} className="text-[var(--text-muted)]" />}
            </div>
            <div className="flex-1 text-[13px] font-medium leading-relaxed mt-0.5">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="surface-panel max-w-sm w-full animate-scale-in shadow-2xl flex flex-col">
            <div className="p-5 flex-1">
              <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-2">
                {confirmState.title}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {confirmState.message}
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <button
                onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
                className="linear-button-secondary"
              >
                {confirmState.cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={
                  confirmState.destructive
                    ? 'px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[var(--error-color)] text-white hover:bg-red-600 transition-colors shadow-sm'
                    : 'linear-button-primary'
                }
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
