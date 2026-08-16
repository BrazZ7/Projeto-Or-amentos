import { Badge } from '@/components/ui/Badge';
import { QUOTE_STATUS_COLORS } from '@/lib/utils';

export interface QuoteStatusDatum {
  status: string;
  label: string;
  count: number;
}

/**
 * Distribuição de orçamentos por status. Usa uma única cor de destaque (a da
 * marca) para o comprimento das barras — a identidade de cada categoria já é
 * carregada pelo rótulo/badge ao lado, então a cor não precisa (nem deve)
 * variar por status para ser lida corretamente.
 */
export function QuoteStatusChart({ data }: { data: QuoteStatusDatum[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-4">
      {data.map((d, index) => {
        const pct = (d.count / max) * 100;
        const share = total ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.status} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <Badge className={QUOTE_STATUS_COLORS[d.status]}>{d.label}</Badge>
              <span className="whitespace-nowrap text-sm font-semibold text-slate-700">
                {d.count}
                <span className="ml-1 font-normal text-slate-400">· {share}%</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full origin-left animate-grow-x rounded-full bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_0_10px_-2px_rgba(97,114,243,0.65)] transition-[filter] duration-300 group-hover:brightness-110"
                style={{ width: `${Math.max(pct, 3)}%`, animationDelay: `${index * 80}ms` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
