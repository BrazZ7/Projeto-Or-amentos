'use client';

import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export interface PerformanceDatum {
  day: string;
  quotes: number;
  value: number;
}

const PURPLE = '#8b5cf6';
const CYAN = '#06b6d4';
const GRID = '#e7e9f5';
const AXIS_INK = '#94a3b8';

function compactNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const quotes = payload.find((p) => p.dataKey === 'quotes')?.value ?? 0;
  const value = payload.find((p) => p.dataKey === 'value')?.value ?? 0;
  return (
    <div className="glass-solid rounded-xl px-3.5 py-2.5 text-sm">
      <p className="mb-1.5 text-xs font-medium capitalize text-slate-400">{label}</p>
      <p className="flex items-center gap-1.5 text-slate-400">
        <span className="h-2 w-2 rounded-full" style={{ background: PURPLE }} />
        Orçamentos: <span className="font-semibold text-slate-100">{quotes}</span>
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-slate-400">
        <span className="h-2 w-2 rounded-full" style={{ background: CYAN }} />
        Valor aprovado: <span className="font-semibold text-slate-100">{formatCurrency(Number(value))}</span>
      </p>
    </div>
  );
}

/**
 * "Resumo de desempenho": duas séries em escalas bem diferentes (contagem de
 * orçamentos vs. valor aprovado em R$) plotadas com eixo Y duplo. Normalmente
 * evitaríamos duplo eixo (fica fácil ler correlações que não existem de
 * verdade), mas é exatamente o efeito visual pedido para replicar a
 * referência — mantido de propósito.
 */
export function PerformanceGlowChart({ data }: { data: PerformanceDatum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="0" />
          <XAxis
            dataKey="day"
            axisLine={{ stroke: GRID }}
            tickLine={false}
            tick={{ fill: AXIS_INK, fontSize: 12 }}
            dy={8}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            width={28}
            allowDecimals={false}
            tick={{ fill: AXIS_INK, fontSize: 11 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            width={44}
            tick={{ fill: AXIS_INK, fontSize: 11 }}
            tickFormatter={(value: number) => compactNumber(value)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID, strokeWidth: 1 }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="quotes"
            name="Orçamentos criados"
            stroke={PURPLE}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: PURPLE, stroke: '#ffffff', strokeWidth: 2 }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.65))' }}
            animationDuration={900}
            animationEasing="ease-out"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="value"
            name="Valor aprovado (R$)"
            stroke={CYAN}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: CYAN, stroke: '#ffffff', strokeWidth: 2 }}
            style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.65))' }}
            animationDuration={900}
            animationBegin={150}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
