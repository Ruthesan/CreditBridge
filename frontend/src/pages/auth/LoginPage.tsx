import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginValues } from '../../lib/validation';

export default function LoginPage() {
  const { login, error, submitting, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch {
      // error surfaced via AuthContext
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-secondary">Sign in to view your credit readiness overview.</p>

      {error && (
        <div className="mt-5">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
            icon={<Lock size={16} />}
            error={errors.password?.message}
            {...register('password', { onChange: clearError })}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth loading={submitting} icon={<LogIn size={16} />}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}
