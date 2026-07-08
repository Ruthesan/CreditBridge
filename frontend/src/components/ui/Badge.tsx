import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'secondary';

const TONE_STYLES: Record<BadgeTone, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-100',
  secondary: 'bg-secondary-50 text-secondary-700 ring-1 ring-inset ring-secondary-100',
  success: 'bg-success-50 text-success-600 ring-1 ring-inset ring-success-100',
  warning: 'bg-warning-50 text-warning-600 ring-1 ring-inset ring-warning-100',
  danger: 'bg-danger-50 text-danger-600 ring-1 ring-inset ring-danger-100',
  neutral: 'bg-gray-100 text-ink-secondary ring-1 ring-inset ring-line',
};

export function Badge({
  tone = 'neutral',
  children,
  icon,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        TONE_STYLES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
