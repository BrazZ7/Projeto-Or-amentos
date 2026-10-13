import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-hairline-strong bg-night-850/80 px-3 py-2 text-sm text-slate-100 shadow-sm transition-all duration-200',
            'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
            error && 'border-rose-400',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
