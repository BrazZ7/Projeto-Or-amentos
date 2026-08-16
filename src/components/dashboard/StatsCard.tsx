import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { StatsSparkline } from '@/components/dashboard/StatsSparkline';
import { cn } from '@/lib/utils';

type Accent = 'purple' | 'emerald' | 'violet' | 'orange';

const ACCENTS: Record<Accent, { badge: string; stroke: string }> = {
  purple: { badge: 'bg-gradient-to-br from-indigo-500 to-violet-600', stroke: '#7c3aed' },
  emerald: { badge: 'bg-gradient-to-br from-emerald-400 to-teal-500', stroke: '#10b981' },
  violet: { badge: 'bg-gradient-to-br from-violet-500 to-fuchsia-500', stroke: '#a855f7' },
  orange: { badge: 'bg-gradient-to-br from-orange-400 to-amber-500', stroke: '#f97316' },
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  accent = 'purple',
  delta,
  spark,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: Accent;
  /** Variação percentual assinada vs. o período anterior (7 dias). */
  delta?: number;
  /** Série diária (últimos 7 dias) para a mini-sparkline. */
  spark?: number[];
}) {
  const tone = ACCENTS[accent];
  const positive = (delta ?? 0) >= 0;

  return (
    <Card hoverable glass glow className="group">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
              tone.badge,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          {spark && spark.length > 0 && (
            <StatsSparkline data={spark} color={tone.stroke} id={accent} />
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-0.5 text-xl font-semibold text-slate-900">{value}</p>
        </div>

        {delta !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              positive ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
            <span className="font-normal text-slate-400">vs período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
