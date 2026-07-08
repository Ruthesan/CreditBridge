import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import type { BadgeTone } from './Badge';

const TONE_BG: Record<string, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-gray-400',
  secondary: 'bg-secondary',
};

export function ProgressBar({
  value,
  tone = 'primary',
  className,
  trackClassName,
  height = 8,
}: {
  value: number;
  tone?: BadgeTone;
  className?: string;
  trackClassName?: string;
  height?: number;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-gray-100', trackClassName)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn('h-full rounded-full', TONE_BG[tone], className)}
      />
    </div>
  );
}
