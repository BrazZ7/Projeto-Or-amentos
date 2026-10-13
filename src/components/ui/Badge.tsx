import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200',
        className,
      )}
      {...props}
    />
  );
}
