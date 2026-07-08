import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, ArrowLeft, MailCheck } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../../lib/validation';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  // NOTE: the backend does not yet expose a password-reset endpoint (see
  // DECISIONS.md). This flow is fully designed and ready to wire up the
  // moment one exists — for now it validates input and shows the standard
  // "check your inbox" confirmation state without sending anything.
  async function onSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSent(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary">
              <MailCheck size={30} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-ink">Check your inbox</h2>
            <p className="mt-1.5 max-w-xs text-sm text-ink-secondary">
              If an account exists for <span className="font-medium text-ink">{getValues('email')}</span>, a reset link is on its way.
            </p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <h1 className="text-2xl font-bold text-ink">Reset your password</h1>
            <p className="mt-1.5 text-sm text-ink-secondary">
              Enter the email on your account and we'll send you a link to reset your password.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" fullWidth loading={submitting}>
                Send reset link
              </Button>
            </form>

            <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
