import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-600 shadow-card hover:shadow-lift focus-visible:outline-primary-700 disabled:hover:bg-primary',
  secondary:
    'bg-secondary text-white hover:bg-secondary-600 shadow-card focus-visible:outline-secondary-700',
  outline:
    'border border-line bg-white text-ink hover:bg-surface hover:border-ink/20',
  ghost: 'text-ink hover:bg-black/5',
  danger: 'bg-danger text-white hover:bg-danger-600 shadow-card',
};

const SIZE_STYLES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';
