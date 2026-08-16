'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export interface RevenueTrendDatum {
  month: string;
  value: number;
}

const BRAND_LINE = '#4a54e1';
const GRID = '#e7e9f5';
const AXIS_INK = '#94a3b8';

function compactCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="glass-solid rounded-xl px-3.5 py-2.5 text-sm">
      <p className="text-base font-semibold text-slate-900">{formatCurrency(Number(value))}</p>
      <p className="text-xs capitalize text-slate-500">{label}</p>
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: RevenueTrendDatum[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_LINE} stopOpacity={0.32} />
              <stop offset="100%" stopColor={BRAND_LINE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="0" />
          <XAxis
            dataKey="month"
            axisLine={{ stroke: GRID }}
            tickLine={false}
            tick={{ fill: AXIS_INK, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={56}
            tick={{ fill: AXIS_INK, fontSize: 11 }}
            tickFormatter={(value: number) => compactCurrency(value)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID, strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={BRAND_LINE}
            strokeWidth={2}
            fill="url(#revenueFill)"
            dot={{ r: 3, fill: BRAND_LINE, stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: BRAND_LINE, stroke: '#ffffff', strokeWidth: 2 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
