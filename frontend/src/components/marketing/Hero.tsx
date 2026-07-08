import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { CircularGauge } from '../ui/CircularGauge';
import { ProgressBar } from '../ui/ProgressBar';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div
        className="pointer-events-none absolute right-0 top-0 h-[560px] w-[560px] -translate-y-1/3 translate-x-1/4 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }}
      />
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
            AI Credit Intelligence Platform
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            Know exactly how loan-ready your business is —{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">before a lender tells you no.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-secondary sm:text-lg">
            CreditBridge reads your bank statements, scores your business against real
            lender criteria, and gives you a prioritized, AI-written plan to close the
            gap — in plain language, grounded in your own transaction history.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register">
              <Button size="lg" iconRight={<ArrowRight size={18} />} fullWidth className="sm:w-auto">
                Get your free credit score
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" icon={<PlayCircle size={18} />} fullWidth className="sm:w-auto">
                See how it works
              </Button>
            </a>
          </div>
          <p className="mt-5 text-xs text-ink-secondary">No card required. Your first analysis is free.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">Credit Readiness</p>
                <p className="text-sm font-semibold text-ink mt-0.5">Gleam & Go Traders</p>
              </div>
              <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-600">Good standing</span>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <CircularGauge value={78} size={168} label="/ 100" />
            </div>

            <div className="mt-6 space-y-3">
              {[
                { label: 'Cash flow', value: 82 },
                { label: 'Profitability', value: 74 },
                { label: 'Data quality', value: 91 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-secondary">{row.label}</span>
                    <span className="stat-font font-semibold text-ink">{row.value}</span>
                  </div>
                  <ProgressBar value={row.value} height={6} />
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -right-6 -top-6 hidden rounded-2xl border border-line bg-white px-4 py-3 shadow-soft sm:block"
          >
            <p className="text-[11px] font-semibold text-ink-secondary">Best current match</p>
            <p className="text-sm font-bold text-ink">Tier 1 Commercial Bank</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
