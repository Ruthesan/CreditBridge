import { motion } from 'framer-motion';
import { FileSearch, Cpu, Landmark, Sparkles, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const STAGES = [
  { key: 'intake', label: 'Reading transactions', icon: FileSearch },
  { key: 'profile', label: 'Building financial profile', icon: Cpu },
  { key: 'scoring', label: 'Scoring against lenders', icon: Landmark },
  { key: 'advisory', label: 'Generating recommendations', icon: Sparkles },
];

/**
 * Purely a progress affordance — the backend pipeline runs as a single
 * background job (see pipeline_router.py), so stage index is estimated
 * from elapsed polling ticks rather than reported by the API.
 */
export function ProcessingAnimation({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <motion.span
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-primary/20"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lift">
            <Cpu size={26} />
          </div>
        </div>
        <h3 className="mt-5 text-base font-semibold text-ink">Analyzing your statement</h3>
        <p className="mt-1 text-sm text-ink-secondary">This usually takes under a minute.</p>
      </div>

      <div className="mt-8 space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <div
              key={stage.key}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3 transition-colors',
                active ? 'border-primary-100 bg-primary-50' : done ? 'border-success-100 bg-success-50' : 'border-line bg-surface/40'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  done ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-gray-200 text-ink-secondary'
                )}
              >
                {done ? <Check size={16} /> : <stage.icon size={16} className={active ? 'animate-pulse' : ''} />}
              </div>
              <span className={cn('text-sm font-medium', done || active ? 'text-ink' : 'text-ink-secondary')}>
                {stage.label}
              </span>
              {active && (
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.1, delay: d * 0.15 }}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
