import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'For a business checking readiness for the first time.',
    features: ['1 statement analysis / month', 'Readiness score across all lenders', 'Basic AI recommendations'],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₦15,000',
    period: '/ month',
    description: 'For SMEs actively preparing to apply for financing.',
    features: [
      'Unlimited statement analyses',
      'Full AI advisory reports',
      'Automatic scheduled re-scoring',
      'Downloadable lender-ready reports',
    ],
    cta: 'Start Growth plan',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For associations and lenders scoring many SMEs.',
    features: ['Multi-business dashboard', 'API access', 'Dedicated onboarding support'],
    cta: 'Talk to sales',
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Simple pricing, no surprises</h2>
          <p className="mt-3 text-sm text-ink-secondary">Illustrative plans — final pricing to be confirmed at launch.</p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-2xl border p-7',
                plan.highlighted ? 'border-primary bg-ink shadow-lift' : 'border-line bg-white'
              )}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className={cn('text-base font-semibold', plan.highlighted ? 'text-white' : 'text-ink')}>{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className={cn('stat-font text-3xl font-bold', plan.highlighted ? 'text-white' : 'text-ink')}>{plan.price}</span>
                <span className={cn('text-sm', plan.highlighted ? 'text-gray-400' : 'text-ink-secondary')}>{plan.period}</span>
              </div>
              <p className={cn('mt-2 text-sm', plan.highlighted ? 'text-gray-400' : 'text-ink-secondary')}>{plan.description}</p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={16} className={cn('mt-0.5 shrink-0', plan.highlighted ? 'text-primary-300' : 'text-success')} />
                    <span className={plan.highlighted ? 'text-gray-300' : 'text-ink-secondary'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register" className="mt-7">
                <Button fullWidth variant={plan.highlighted ? 'primary' : 'outline'}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
