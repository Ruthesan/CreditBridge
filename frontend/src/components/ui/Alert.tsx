import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'info' | 'success' | 'warning' | 'danger';

const CONFIG: Record<Variant, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'bg-primary-50 border-primary-100 text-primary-800' },
  success: { icon: CheckCircle2, classes: 'bg-success-50 border-success-100 text-success-600' },
  warning: { icon: AlertTriangle, classes: 'bg-warning-50 border-warning-100 text-warning-600' },
  danger: { icon: XCircle, classes: 'bg-danger-50 border-danger-100 text-danger-600' },
};

export function Alert({
  variant = 'info',
  title,
  children,
  action,
}: {
  variant?: Variant;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const { icon: Icon, classes } = CONFIG[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-2xl border p-4', classes)} role="alert">
      <Icon size={19} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {children && <div className="mt-0.5 text-sm opacity-90">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
