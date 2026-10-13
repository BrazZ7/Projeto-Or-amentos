'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarDays, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface RevenuePoint {
  label: string; // "Jan"
  fullLabel: string; // "Janeiro/2026"
  revenue: number;
  quotes: number;
}

const METRICS = {
  revenue: { label: 'Faturamento', format: (v: number) => formatCurrency(v) },
  quotes: { label: 'Orçamentos', format: (v: number) => `${v}` },
} as const;

const PERIODS = [
  { value: 3, label: 'Últimos 3 meses' },
  { value: 6, label: 'Últimos 6 meses' },
  { value: 12, label: 'Últimos 12 meses' },
] as const;

type MetricKey = keyof typeof METRICS;

function compactCurrency(value: number) {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

export function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [months, setMonths] = useState<number>(6);

  // A série chega com 12 meses; o seletor de período só recorta a cauda, o que
  // evita ida ao servidor a cada troca.
  const visible = data.slice(-months);
  const meta = METRICS[metric];

  return (
    <div className="panel p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-100">Evolução do faturamento</h2>
          <span
            title="Soma dos orçamentos aprovados em cada mês"
            className="cursor-help text-slate-500 transition-colors hover:text-slate-300"
          >
            <Info className="h-4 w-4" />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as MetricKey)}
            aria-label="Métrica"
            className="rounded-lg border border-hairline-strong bg-night-850/80 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          >
            {Object.entries(METRICS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <div className="relative flex items-center">
            <CalendarDays className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
            <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            aria-label="Período"
            className="rounded-lg border border-hairline-strong bg-night-850/80 py-1.5 pl-7 pr-3 text-xs text-slate-300 transition-colors hover:border-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
          >
              {PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visible} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value: number) =>
                metric === 'revenue' ? compactCurrency(value) : String(value)
              }
              width={52}
            />
            <Tooltip
              cursor={{ stroke: 'rgba(59,130,246,0.35)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload as RevenuePoint;
                return (
                  <div className="panel-overlay px-3 py-2">
                    <p className="text-xs text-slate-400">{point.fullLabel}</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {meta.format(metric === 'revenue' ? point.revenue : point.quotes)}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#60a5fa"
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              dot={{ r: 3, fill: '#0e1626', stroke: '#60a5fa', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#60a5fa', stroke: '#bfdbfe', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
