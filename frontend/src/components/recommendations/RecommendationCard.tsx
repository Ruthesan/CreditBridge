import { motion } from 'framer-motion';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import type { ImprovementAction } from '../../types';
import { Badge } from '../ui/Badge';
import { metricCategory, metricLabel } from '../../lib/utils';
import { cn } from '../../lib/utils';

const PRIORITY_TONE = ['danger', 'warning', 'primary', 'neutral', 'neutral'] as const;

export function RecommendationCard({
  action,
  index,
  completed,
  onToggleComplete,
}: {
  action: ImprovementAction;
  index: number;
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const tone = PRIORITY_TONE[Math.min(action.priority - 1, PRIORITY_TONE.length - 1)] ?? 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'rounded-2xl border bg-white p-6 transition-colors',
        completed ? 'border-success-100 bg-success-50/30' : 'border-line'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
            {action.priority}
          </span>
          <div>
            <Badge tone={tone}>Priority {action.priority}</Badge>
            <Badge tone="neutral" className="ml-2">{metricCategory(action.target_metric)}</Badge>
          </div>
        </div>
        <button
          onClick={onToggleComplete}
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink"
          aria-pressed={completed}
        >
          {completed ? <CheckCircle2 size={18} className="text-success" /> : <Circle size={18} />}
          {completed ? 'Done' : 'Mark done'}
        </button>
      </div>

      <p className={cn('mt-4 text-sm font-semibold text-ink', completed && 'line-through decoration-success-600/40')}>
        {action.action}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <TrendingUp size={14} className="text-success" />
          <span className="font-medium text-ink">Estimated impact:</span> {action.estimated_impact}
        </div>
        <div className="text-xs text-ink-secondary">
          <span className="font-medium text-ink">Metric:</span> {metricLabel(action.target_metric)}
        </div>
      </div>
    </motion.div>
  );
}
