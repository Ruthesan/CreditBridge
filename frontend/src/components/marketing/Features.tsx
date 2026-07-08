import { motion } from 'framer-motion';
import { LineChart, ShieldCheck, Landmark, FileBarChart2, Bell, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: LineChart, title: 'Live readiness scoring', text: 'A single 0–100 score that updates every time you upload a new statement.' },
  { icon: Landmark, title: 'Multi-lender comparison', text: 'See exactly where you stand against microfinance, digital, and commercial bank criteria side by side.' },
  { icon: Sparkles, title: 'AI-prioritized recommendations', text: 'Ranked, specific actions — never generic advice — tied to the metric that moves your score most.' },
  { icon: ShieldCheck, title: 'Prompt-injection-safe pipeline', text: 'A dedicated trust layer validates every document before it ever reaches the scoring engine.' },
  { icon: FileBarChart2, title: 'Shareable reports', text: 'Export a clean summary you can hand to a co-founder, accountant, or the lender itself.' },
  { icon: Bell, title: 'Automatic re-scoring', text: 'Statements can be re-analyzed on a schedule so your score never goes stale.' },
];

export function Features() {
  return (
    <section id="features" className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Everything you need to get financing-ready</h2>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.1 }}
              className="rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary">
                <f.icon size={19} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
