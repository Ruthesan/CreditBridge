import { motion } from 'framer-motion';
import { FileQuestion, EyeOff, Clock3 } from 'lucide-react';

const PROBLEMS = [
  {
    icon: FileQuestion,
    title: "You don't know why you were declined",
    text: 'Lenders reject applications with a form letter. Nobody explains which number needs to move, or by how much.',
  },
  {
    icon: EyeOff,
    title: 'Your real financial picture is buried in statements',
    text: 'Months of transactions across market days, supplier payments, and personal transfers hide the signal lenders actually look for.',
  },
  {
    icon: Clock3,
    title: 'You find out you were unready after applying',
    text: 'By the time a bank scores you, weeks have passed. There is no way to check readiness before you spend the application on it.',
  },
];

export function ProblemSection() {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">The problem</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Financing shouldn't feel like a guessing game</h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-2xl border border-line bg-white p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger-50 text-danger">
                <p.icon size={20} />
              </div>
              <h3 className="mt-5 text-base font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
