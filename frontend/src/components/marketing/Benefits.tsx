import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const ROWS = [
  { without: 'Find out you were declined weeks after applying', with: 'Know your standing before you ever apply' },
  { without: 'Generic advice that ignores your actual numbers', with: 'Action steps grounded in your own transaction history' },
  { without: 'One lender, one shot, no comparison', with: 'Scored against microfinance, digital, and commercial criteria at once' },
  { without: 'Manually reconcile statements in a spreadsheet', with: 'Upload a statement and get a profile in minutes' },
];

export function Benefits() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Why it matters</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Built for how Nigerian SMEs actually apply for credit</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-14 overflow-hidden rounded-2xl border border-line bg-white"
        >
          <div className="grid grid-cols-2 border-b border-line bg-surface/60">
            <div className="flex items-center gap-2 px-6 py-4">
              <X size={16} className="text-danger" />
              <span className="text-sm font-semibold text-ink-secondary">Without CreditBridge</span>
            </div>
            <div className="flex items-center gap-2 border-l border-line px-6 py-4">
              <Check size={16} className="text-success" />
              <span className="text-sm font-semibold text-ink">With CreditBridge</span>
            </div>
          </div>
          {ROWS.map((row) => (
            <div key={row.without} className="grid grid-cols-2 border-b border-line last:border-0">
              <div className="px-6 py-4 text-sm text-ink-secondary">{row.without}</div>
              <div className="border-l border-line px-6 py-4 text-sm font-medium text-ink">{row.with}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
