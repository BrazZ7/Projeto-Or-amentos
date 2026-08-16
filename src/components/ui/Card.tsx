import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
  /** Anel de gradiente rotativo revelado no hover, para cards de destaque. */
  glow?: boolean;
}

export function Card({ className, glass, hoverable, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300 ease-out',
        glass
          ? 'glass sheen-hover'
          : 'border border-white/80 bg-white/85 shadow-card backdrop-blur-md',
        hoverable && 'hover:-translate-y-0.5 hover:shadow-glass',
        glow && 'glow-ring',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-slate-100 px-5 py-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold text-slate-900', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}
