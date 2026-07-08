import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { resetPasswordSchema, type ResetPasswordValues } from '../../lib/validation';

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) });

  // Same caveat as ForgotPasswordPage: no backend endpoint exists yet to
  // actually consume a reset token and set a new password hash. This screen
  // is built to the final spec and just needs an endpoint wired in.
  async function onSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 1400);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success">
          <CheckCircle2 size={30} />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink">Password updated</h2>
        <p className="mt-1.5 text-sm text-ink-secondary">Redirecting you to sign in…</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-2xl font-bold text-ink">Set a new password</h1>
      <p className="mt-1.5 text-sm text-ink-secondary">Choose a strong password you haven't used before.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          icon={<Lock size={16} />}
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          icon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={submitting}>
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Remembered it after all?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
