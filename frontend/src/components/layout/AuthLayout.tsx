import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, FileCheck2 } from 'lucide-react';

const PANEL_POINTS = [
  { icon: ShieldCheck, text: 'Bank-level security on every statement you upload' },
  { icon: TrendingUp, text: 'Real-time credit readiness scoring across three lender tiers' },
  { icon: FileCheck2, text: 'AI-generated action plans grounded in your actual numbers' },
];

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 lg:py-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
            CB
          </div>
          <span className="text-base font-bold text-ink">CreditBridge</span>
        </Link>

        <div className="mx-auto w-full max-w-sm py-10">
          <Outlet />
        </div>

        <p className="text-center text-xs text-ink-secondary lg:text-left">
          © {new Date().getFullYear()} CreditBridge. Built for Nigerian SMEs.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent 70%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-300">
            AI Credit Intelligence Platform
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
            Turn transaction history into loan-ready evidence.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            CreditBridge reads your bank statements, scores you against real lender
            criteria, and tells you exactly what to fix first — in plain language,
            grounded in your own numbers.
          </p>

          <div className="mt-10 space-y-4">
            {PANEL_POINTS.map((p, i) => (
              <motion.div
                key={p.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.12 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary-300">
                  <p.icon size={16} />
                </div>
                <p className="text-sm text-gray-300 leading-snug pt-1.5">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
