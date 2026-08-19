import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'sheen-hover bg-[length:200%_100%] bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 text-white shadow-glow-brand hover:bg-right hover:shadow-glow-brand-lg',
  secondary:
    'sheen-hover border border-hairline-strong bg-night-700/80 text-slate-100 backdrop-blur-md hover:bg-night-600/80',
  outline:
    'sheen-hover border border-hairline-strong bg-night-800/60 text-slate-300 backdrop-blur-md hover:border-brand-500/40 hover:bg-night-700/70 hover:text-white',
  ghost: 'text-slate-400 hover:bg-white/5 hover:text-slate-100',
  danger: 'sheen-hover bg-rose-600 text-white shadow-sm hover:bg-rose-500',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-5 py-3 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
          !disabled && !loading && 'hover:-translate-y-0.5',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
