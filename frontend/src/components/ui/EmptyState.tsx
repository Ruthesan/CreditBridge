import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center"
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
