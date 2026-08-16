import { cn } from '@/lib/utils';

export function BackgroundBlobs({
  className,
  position = 'absolute',
  vivid = false,
}: {
  className?: string;
  position?: 'absolute' | 'fixed';
  /** Mistura mais saturada (rosa/violeta/azul) para telas com fundo em gradiente. */
  vivid?: boolean;
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
      <div
        className="absolute inset-[-20%] animate-spin-slow mix-blend-multiply"
        style={{
          opacity: vivid ? 0.5 : 0.35,
          background: vivid
            ? 'conic-gradient(from 90deg, rgba(168,85,247,0.16), rgba(236,72,153,0.14), transparent 35%, rgba(97,114,243,0.14))'
            : 'conic-gradient(from 90deg, rgba(97,114,243,0.08), rgba(192,132,252,0.10), transparent 35%, rgba(97,114,243,0.08))',
        }}
      />
      <div
        className={cn(
          'absolute -left-24 -top-24 h-72 w-72 animate-blob rounded-full blur-3xl',
          vivid ? 'bg-violet-300/50' : 'bg-brand-300/30',
        )}
      />
      <div
        className={cn(
          'absolute right-0 top-1/3 h-80 w-80 animate-blob-delay rounded-full blur-3xl',
          vivid ? 'bg-brand-400/40' : 'bg-brand-400/20',
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full blur-3xl',
          vivid ? 'bg-pink-300/40' : 'bg-purple-300/20',
        )}
      />
      <div
        className={cn(
          'absolute right-1/4 bottom-1/4 h-56 w-56 animate-blob-delay-2 rounded-full blur-3xl',
          vivid ? 'bg-sky-300/35' : 'bg-brand-200/25',
        )}
      />
      {vivid && (
        <div className="absolute left-1/4 top-1/4 h-64 w-64 animate-blob-delay rounded-full bg-fuchsia-200/40 blur-3xl" />
      )}
      <div className="bg-noise absolute inset-0 opacity-[0.025] mix-blend-overlay" />
    </div>
  );
}
