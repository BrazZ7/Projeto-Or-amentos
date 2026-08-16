import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Accent = 'blue' | 'emerald' | 'amber' | 'violet';

const ACCENTS: Record<Accent, { tile: string; glow: string }> = {
  blue: { tile: 'bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/25', glow: 'bg-blue-500/20' },
  emerald: {
    tile: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/25',
    glow: 'bg-emerald-500/20',
  },
  amber: {
    tile: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/25',
    glow: 'bg-amber-500/20',
  },
  violet: {
    tile: 'bg-violet-500/15 text-violet-300 ring-1 ring-inset ring-violet-400/25',
    glow: 'bg-violet-500/20',
  },
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  accent,
  delta,
  spark,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: Accent;
  /** Variação percentual contra o período anterior. */
  delta?: number;
  spark?: number[];
}) {
  const colors = ACCENTS[accent];
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="panel group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-hairline-strong">
      <span
        className={cn(
          'pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
          colors.glow,
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colors.tile)}>
          <Icon className="h-5 w-5" />
        </span>
        {spark && spark.length > 1 && <Sparkline values={spark} positive={positive} />}
      </div>

      <p className="relative mt-4 truncate text-sm text-slate-400">{label}</p>
      {/* Entre lg e 2xl são 4 cards dividindo a largura com a coluna da
          direita; o valor em reais só cabe em corpo menor. */}
      <p className="relative mt-1 text-2xl font-semibold tracking-tight text-white 2xl:text-3xl">
        {value}
      </p>

      {hasDelta && (
        <p className="relative mt-3 flex flex-wrap items-center gap-x-1.5 text-xs">
          <span
            className={cn(
              'flex shrink-0 items-center gap-0.5 font-semibold',
              positive ? 'text-emerald-400' : 'text-rose-400',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta as number).toFixed(1)}%
          </span>
          <span className="whitespace-nowrap text-slate-500">vs. mês anterior</span>
        </p>
      )}
    </div>
  );
}

/** Linha de tendência dos últimos dias, desenhada sem dependência de gráfico. */
function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 24 - ((value - min) / range) * 20 - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 24" className="h-6 w-20 shrink-0" preserveAspectRatio="none" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#34d399' : '#fb7185'}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
