import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { CriterionResult } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { Tooltip } from '../ui/Tooltip';
import { metricCategory, metricDescription, metricLabel, scoreTone } from '../../lib/utils';

/**
 * Groups a lender's real criterion_breakdown entries under the five
 * portfolio-facing categories (Profitability, Cash Flow, Leverage, Business
 * Performance, Financial History). The grouping is a presentation layer over
 * backend-computed metrics — see metricCategory() in lib/utils.ts and
 * DECISIONS.md — nothing here is invented.
 */
export function CriterionBreakdown({ criteria }: { criteria: CriterionResult[] }) {
  const grouped = criteria.reduce<Record<string, CriterionResult[]>>((acc, c) => {
    const cat = metricCategory(c.metric);
    (acc[cat] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(grouped).map(([category, items], i) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-2xl border border-line bg-white p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{category}</p>
          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div key={item.metric}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                    {metricLabel(item.metric)}
                    <Tooltip content={metricDescription(item.metric)}>
                      <Info size={13} className="text-ink-secondary/60" />
                    </Tooltip>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {item.passed_floor ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : (
                      <XCircle size={14} className="text-danger" />
                    )}
                    <span className="stat-font text-sm font-semibold text-ink">
                      {Math.round(item.normalized_score)}
                    </span>
                  </span>
                </div>
                <ProgressBar value={item.normalized_score} tone={scoreTone(item.normalized_score)} height={6} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
