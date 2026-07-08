import { motion } from 'framer-motion';
import { Landmark, ArrowUp, ArrowDown, CheckCircle2, XCircle } from 'lucide-react';
import type { LenderProfile, LoanReadinessScore } from '../../types';
import { Badge } from '../ui/Badge';
import { MiniRing } from '../ui/CircularGauge';
import { metricLabel, scoreTone } from '../../lib/utils';
import { cn } from '../../lib/utils';

const TYPE_LABEL: Record<string, string> = {
  microfinance: 'Microfinance',
  commercial_bank: 'Commercial Bank',
  digital_lender: 'Digital Lender',
};

export function LenderCard({
  lender,
  score,
  selected,
  onToggleSelect,
  index,
}: {
  lender: LenderProfile;
  score?: LoanReadinessScore;
  selected: boolean;
  onToggleSelect: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        'flex flex-col rounded-2xl border bg-white p-6 transition-all',
        selected ? 'border-primary shadow-glow' : 'border-line hover:shadow-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-base font-semibold text-ink">{lender.lender_name}</p>
            <Badge tone="neutral" className="mt-1">{TYPE_LABEL[lender.lender_type] ?? lender.lender_type}</Badge>
          </div>
        </div>
        {score && <MiniRing value={score.overall_score} />}
      </div>

      {score ? (
        <div className="mt-4 flex items-center gap-2">
          {score.is_ready ? (
            <Badge tone="success" icon={<CheckCircle2 size={12} />}>Meets criteria</Badge>
          ) : (
            <Badge tone="danger" icon={<XCircle size={12} />}>Not yet ready</Badge>
          )}
          <span className="text-xs text-ink-secondary">
            Approval threshold: <span className="stat-font font-semibold text-ink">{lender.approval_threshold}</span>
          </span>
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-secondary">Upload a statement to see your score against this lender.</p>
      )}

      <div className="mt-5 flex-1 space-y-2.5 border-t border-line pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Scoring criteria</p>
        {lender.criteria.map((c) => (
          <div key={c.metric} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-ink-secondary">
              {c.direction === 'higher_better' ? (
                <ArrowUp size={12} className="text-success" />
              ) : (
                <ArrowDown size={12} className="text-success" />
              )}
              {metricLabel(c.metric)}
            </span>
            <span className="stat-font font-medium text-ink">
              target {c.target}
              {c.min_acceptable !== null && <span className="text-ink-secondary"> · min {c.min_acceptable}</span>}
            </span>
          </div>
        ))}
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-2 border-t border-line pt-4 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
        />
        Add to comparison
      </label>
    </motion.div>
  );
}

export function scoreForLender(scores: LoanReadinessScore[] | undefined, lenderId: string) {
  return scores?.find((s) => s.lender_id === lenderId);
}

export { scoreTone };
