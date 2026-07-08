import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export function Card({ className, hoverable, padded = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-white shadow-card',
        padded && 'p-6',
        hoverable && 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink truncate">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-secondary">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
