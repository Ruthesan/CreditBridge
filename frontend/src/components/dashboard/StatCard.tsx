import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export function StatCard({
  label,
  value,
  icon,
  trend,
  visual,
  action,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: { value: number; positiveIsGood?: boolean };
  visual?: ReactNode;
  action?: ReactNode;
  delay?: number;
}) {
  const trendPositive = trend ? trend.value >= 0 : undefined;
  const trendGood = trend ? (trend.positiveIsGood ?? true ? trendPositive : !trendPositive) : undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{label}</p>
            <div className="mt-2 stat-font text-2xl font-bold text-ink">{value}</div>
            {trend && (
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-1 text-xs font-semibold',
                  trendGood ? 'text-success' : 'text-danger'
                )}
              >
                {trendPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {Math.abs(trend.value).toFixed(1)}% vs last analysis
              </div>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
              {icon}
            </div>
          )}
          {visual}
        </div>
        {action && <div className="mt-4 border-t border-line pt-3">{action}</div>}
      </Card>
    </motion.div>
  );
}
