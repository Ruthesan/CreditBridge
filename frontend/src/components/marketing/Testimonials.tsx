import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      "I finally understood why the bank kept saying no. Fixing the two things CreditBridge flagged got me approved on the next try.",
    name: 'Adaeze N.',
    role: 'Owner, fashion retail — Lagos',
  },
  {
    quote:
      'Uploading a statement and getting a real score back in minutes, instead of waiting weeks for a bank to respond, changed how I plan cash flow.',
    name: 'Chidi O.',
    role: 'Founder, logistics SME — Enugu',
  },
  {
    quote:
      "The lender comparison alone was worth it — I stopped applying to banks I was never going to qualify for.",
    name: 'Fatima B.',
    role: 'Owner, trading business — Kano',
  },
];

export function Testimonials() {
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
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Early users</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Trusted by SMEs preparing for their next loan</h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-line bg-white p-7"
            >
              <Quote size={22} className="text-primary-200" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-secondary">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
