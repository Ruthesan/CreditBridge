import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-sidebar py-20 sm:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #4F46E5, transparent 70%)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Stop guessing. Start knowing your credit readiness.</h2>
        <p className="mt-4 text-base text-gray-400">
          Upload your first statement and get a full readiness score in minutes — free.
        </p>
        <Link to="/register" className="mt-8 inline-block">
          <Button size="lg" iconRight={<ArrowRight size={18} />}>
            Get your free credit score
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                CB
              </div>
              <span className="text-base font-bold text-ink">CreditBridge</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-secondary">
              AI credit intelligence for Nigerian SMEs — know your readiness before you apply.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-ink-secondary hover:text-ink">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-ink-secondary">© {new Date().getFullYear()} CreditBridge. All rights reserved.</p>
          <p className="text-xs text-ink-secondary">
            This is automated guidance only and does not guarantee loan approval.
          </p>
        </div>
      </div>
    </footer>
  );
}
