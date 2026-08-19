import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-hairline-strong bg-night-850/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm transition-all duration-200',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
            error && 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/25',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
