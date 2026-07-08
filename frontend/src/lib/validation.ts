import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Enter your email address').email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    businessName: z.string().min(2, 'Enter your business name'),
    email: z.string().min(1, 'Enter your email address').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Enter your email address').email('Enter a valid email address'),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
