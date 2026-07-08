import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'border-success/20 bg-success-50 text-success-600',
  error: 'border-danger/20 bg-danger-50 text-danger-600',
  warning: 'border-warning/20 bg-warning-50 text-warning-600',
  info: 'border-primary/20 bg-primary-50 text-primary-700',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    show,
    success: (title, description) => show({ title, description, variant: 'success' }),
    error: (title, description) => show({ title, description, variant: 'error' }),
    info: (title, description) => show({ title, description, variant: 'info' }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-soft',
                  STYLES[t.variant]
                )}
                role="status"
              >
                <Icon size={20} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-ink-secondary">{t.description}</p>}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 rounded-full p-1 text-ink-secondary hover:bg-black/5"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
