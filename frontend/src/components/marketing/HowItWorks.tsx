import { motion } from 'framer-motion';
import { UploadCloud, Cpu, Landmark, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: UploadCloud,
    title: 'Upload your statement',
    text: 'Drop in a CSV or PDF bank statement. No manual data entry, no spreadsheets to prepare.',
  },
  {
    icon: Cpu,
    title: 'AI agents read and clean it',
    text: 'A four-stage pipeline parses transactions, flags unreliable rows, and builds a financial health profile.',
  },
  {
    icon: Landmark,
    title: 'Score against real lenders',
    text: 'Your profile is scored against the exact criteria used by microfinance, digital, and commercial lenders.',
  },
  {
    icon: Sparkles,
    title: 'Get a prioritized action plan',
    text: 'An AI advisor ranks the highest-leverage changes to make first, in plain language, grounded in your numbers.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">From statement to action plan in minutes</h2>
        </motion.div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="relative flex flex-col items-start"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lift">
                <step.icon size={20} />
              </div>
              <p className="mt-5 text-xs font-bold text-primary">Step {i + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
