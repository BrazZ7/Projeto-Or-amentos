import { cn } from '@/lib/utils';

export function BackgroundBlobs({
  className,
  position = 'absolute',
}: {
  className?: string;
  position?: 'absolute' | 'fixed';
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none inset-0 -z-10 overflow-hidden',
        position,
        className,
      )}
    >
      <div className="absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full bg-brand-300/30 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-80 w-80 animate-blob-delay rounded-full bg-brand-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-purple-300/20 blur-3xl" />
    </div>
  );
}
