import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, Building2, UserPlus, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema, type RegisterValues } from '../../lib/validation';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { pass: password.length >= 8, label: 'At least 8 characters' },
    { pass: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { pass: /[0-9]/.test(password), label: 'One number' },
  ];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5 text-xs">
          <CheckCircle2 size={13} className={c.pass ? 'text-success' : 'text-line'} />
          <span className={c.pass ? 'text-ink-secondary' : 'text-ink-secondary/60'}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { register: doRegister, error, submitting, clearError } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const password = watch('password') ?? '';

  async function onSubmit(values: RegisterValues) {
    try {
      await doRegister(values.email, values.password, values.businessName);
      setSuccess(true);
      setTimeout(() => navigate('/app', { replace: true }), 900);
    } catch {
      // error surfaced via AuthContext
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success"
            >
              <CheckCircle2 size={32} />
            </motion.div>
            <h2 className="mt-4 text-lg font-semibold text-ink">Account created</h2>
            <p className="mt-1 text-sm text-ink-secondary">Taking you to your dashboard…</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <h1 className="text-2xl font-bold text-ink">Create your account</h1>
            <p className="mt-1.5 text-sm text-ink-secondary">
              Start evaluating your business's credit readiness in minutes.
            </p>

            {error && (
              <div className="mt-5">
                <Alert variant="danger">{error}</Alert>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                label="Business name"
                autoComplete="organization"
                icon={<Building2 size={16} />}
                error={errors.businessName?.message}
                {...register('businessName', { onChange: clearError })}
              />
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email', { onChange: clearError })}
              />
              <div>
                <Input
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  icon={<Lock size={16} />}
                  error={errors.password?.message}
                  {...register('password', { onChange: clearError })}
                />
                <PasswordStrength password={password} />
              </div>
              <Input
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                icon={<Lock size={16} />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', { onChange: clearError })}
              />

              <Button type="submit" fullWidth loading={submitting} icon={<UserPlus size={16} />}>
                Create account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
