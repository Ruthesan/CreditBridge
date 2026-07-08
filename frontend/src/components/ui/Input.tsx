import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
  id?: string;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, icon, id, className, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <div className="relative">
          {icon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary">{icon}</div>}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={cn(
              'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink-secondary/70 transition-colors',
              'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
              icon && 'pl-10',
              error && 'border-danger focus:border-danger focus:ring-danger/10',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-ink-secondary">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-secondary/70 transition-colors',
            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
            error && 'border-danger focus:border-danger focus:ring-danger/10',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-ink-secondary">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldWrapperProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, id, className, children, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
            {label}
            {required && <span className="text-danger"> *</span>}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            'h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink transition-colors',
            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
            error && 'border-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-ink-secondary">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
