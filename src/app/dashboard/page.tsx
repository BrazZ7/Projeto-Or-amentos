import Link from 'next/link';
import {
  subMonths,
  startOfMonth,
  isSameMonth,
  subDays,
  addDays,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  differenceInCalendarDays,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  FileText,
  CheckCircle2,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { HeaderActions } from '@/components/dashboard/HeaderActions';
import { QuoteStatusChart } from '@/components/dashboard/charts/QuoteStatusChart';
import { RevenueTrendChart } from '@/components/dashboard/charts/RevenueTrendChart';
import { PerformanceGlowChart } from '@/components/dashboard/charts/PerformanceGlowChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatCurrency, QUOTE_STATUS_LABELS } from '@/lib/utils';

const QUOTE_STATUS_ORDER = [
  'DRAFT',
  'SENT',
  'VIEWED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELED',
] as const;

const AVATAR_COLORS = [
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-orange-400 to-amber-500',
  'bg-gradient-to-br from-pink-500 to-rose-500',
];

const URGENCY_STYLES = {
  high: { badge: 'bg-rose-100 text-rose-600', pill: 'bg-rose-100 text-rose-700' },
  medium: { badge: 'bg-amber-100 text-amber-600', pill: 'bg-amber-100 text-amber-700' },
  low: { badge: 'bg-sky-100 text-sky-600', pill: 'bg-sky-100 text-sky-700' },
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function urgencyFor(daysLeft: number) {
  if (daysLeft <= 3) return URGENCY_STYLES.high;
  if (daysLeft <= 6) return URGENCY_STYLES.medium;
  return URGENCY_STYLES.low;
}

function pctDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

export default async function DashboardPage() {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const today = startOfDay(new Date());
  const sevenDaysFromNow = addDays(today, 7);
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
  const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const prev7Days = eachDayOfInterval({ start: subDays(today, 13), end: subDays(today, 7) });
  const windowStart = subDays(today, 13);

  const [
    totalQuotes,
    approvedAgg,
    sentOrLaterCount,
    approvedCount,
    clientCount,
    recentClients,
    expiringQuotes,
    statusCounts,
    approvedQuotesForTrend,
    quotesWindow,
    approvedWindow,
    clientsWindow,
  ] = await Promise.all([
    prisma.quote.count({ where: { companyId } }),
    prisma.quote.aggregate({ where: { companyId, status: 'APPROVED' }, _sum: { total: true } }),
    prisma.quote.count({
      where: { companyId, status: { in: ['SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED'] } },
    }),
    prisma.quote.count({ where: { companyId, status: 'APPROVED' } }),
    prisma.client.count({ where: { companyId } }),
    prisma.client.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.quote.findMany({
      where: {
        companyId,
        validUntil: { lte: sevenDaysFromNow, gte: new Date() },
        status: { in: ['DRAFT', 'SENT', 'VIEWED'] },
      },
      include: { client: true },
      orderBy: { validUntil: 'asc' },
      take: 5,
    }),
    prisma.quote.groupBy({ by: ['status'], where: { companyId }, _count: { _all: true } }),
    prisma.quote.findMany({
      where: { companyId, status: 'APPROVED', approvedAt: { gte: sixMonthsAgo } },
      select: { approvedAt: true, total: true },
    }),
    prisma.quote.findMany({
      where: { companyId, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    prisma.quote.findMany({
      where: { companyId, status: 'APPROVED', approvedAt: { gte: windowStart } },
      select: { approvedAt: true, total: true },
    }),
    prisma.client.findMany({
      where: { companyId, createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
  ]);

  const conversionRate = sentOrLaterCount > 0 ? (approvedCount / sentOrLaterCount) * 100 : 0;
  const approvedTotal = Number(approvedAgg._sum.total || 0);

  const statusData = QUOTE_STATUS_ORDER.map((status) => ({
    status,
    label: QUOTE_STATUS_LABELS[status],
    count: statusCounts.find((s) => s.status === status)?._count._all ?? 0,
  })).filter((d) => d.count > 0);

  const revenueTrend = Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(new Date(), 5 - i));
    const value = approvedQuotesForTrend
      .filter((q) => q.approvedAt && isSameMonth(q.approvedAt, monthStart))
      .reduce((total, q) => total + Number(q.total), 0);
    return { month: monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), value };
  });

  // Contagens/somas diárias (últimos 7 dias vs. 7 dias anteriores) — base
  // tanto das sparklines/deltas dos StatsCard quanto do gráfico de desempenho.
  const countByDay = (dates: (Date | null)[], days: Date[]) =>
    days.map((day) => dates.filter((d) => d && isSameDay(d, day)).length);
  const sumByDay = (items: { approvedAt: Date | null; total: unknown }[], days: Date[]) =>
    days.map((day) =>
      items
        .filter((item) => item.approvedAt && isSameDay(item.approvedAt, day))
        .reduce((total, item) => total + Number(item.total), 0),
    );

  const quotesCreatedDates = quotesWindow.map((q) => q.createdAt);
  const clientsCreatedDates = clientsWindow.map((c) => c.createdAt);

  const quotesSparkLast7 = countByDay(quotesCreatedDates, last7Days);
  const quotesSparkPrev7 = countByDay(quotesCreatedDates, prev7Days);
  const quotesDelta = pctDelta(sum(quotesSparkLast7), sum(quotesSparkPrev7));

  const valueSparkLast7 = sumByDay(approvedWindow, last7Days);
  const valueSparkPrev7 = sumByDay(approvedWindow, prev7Days);
  const valueDelta = pctDelta(sum(valueSparkLast7), sum(valueSparkPrev7));

  const approvedCountSparkLast7 = countByDay(
    approvedWindow.map((q) => q.approvedAt),
    last7Days,
  );
  const approvedCountSparkPrev7 = countByDay(
    approvedWindow.map((q) => q.approvedAt),
    prev7Days,
  );
  const conversionLast7 = sum(quotesSparkLast7) ? (sum(approvedCountSparkLast7) / sum(quotesSparkLast7)) * 100 : 0;
  const conversionPrev7 = sum(quotesSparkPrev7) ? (sum(approvedCountSparkPrev7) / sum(quotesSparkPrev7)) * 100 : 0;
  const conversionDelta = pctDelta(conversionLast7, conversionPrev7);

  const clientsSparkLast7 = countByDay(clientsCreatedDates, last7Days);
  const clientsSparkPrev7 = countByDay(clientsCreatedDates, prev7Days);
  const clientsDelta = pctDelta(sum(clientsSparkLast7), sum(clientsSparkPrev7));

  const performanceData = last7Days.map((day, i) => ({
    day: format(day, 'dd/MMM', { locale: ptBR }).toLowerCase(),
    quotes: quotesSparkLast7[i],
    value: valueSparkLast7[i],
  }));

  const clientIds = recentClients.map((c) => c.id);
  const clientTotals = clientIds.length
    ? await prisma.quote.groupBy({
        by: ['clientId'],
        where: { companyId, clientId: { in: clientIds } },
        _sum: { total: true },
        _count: { _all: true },
      })
    : [];
  const recentClientsWithTotals = recentClients.map((client) => {
    const agg = clientTotals.find((c) => c.clientId === client.id);
    return {
      ...client,
      totalValue: Number(agg?._sum.total || 0),
      quoteCount: agg?._count._all || 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
          <p className="mt-1 text-sm text-slate-500">Visão geral dos seus orçamentos e clientes.</p>
        </div>
        <HeaderActions />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={FileText}
          label="Orçamentos criados"
          value={String(totalQuotes)}
          accent="purple"
          delta={quotesDelta}
          spark={quotesSparkLast7}
        />
        <StatsCard
          icon={CheckCircle2}
          label="Valor aprovado"
          value={formatCurrency(approvedTotal)}
          accent="emerald"
          delta={valueDelta}
          spark={valueSparkLast7}
        />
        <StatsCard
          icon={TrendingUp}
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(1)}%`}
          accent="violet"
          delta={conversionDelta}
          spark={approvedCountSparkLast7}
        />
        <StatsCard
          icon={Users}
          label="Clientes cadastrados"
          value={String(clientCount)}
          accent="orange"
          delta={clientsDelta}
          spark={clientsSparkLast7}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card hoverable glow>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Próximos do vencimento
            </CardTitle>
            <Link
              href="/dashboard/quotes"
              className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {expiringQuotes.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Nenhum orçamento vencendo nos próximos 7 dias.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {expiringQuotes.map((quote) => {
                  const daysLeft = Math.max(differenceInCalendarDays(quote.validUntil, new Date()), 0);
                  const style = urgencyFor(daysLeft);
                  const dueLabel = format(quote.validUntil, 'ddMMM', { locale: ptBR });
                  return (
                    <li key={quote.id} className="flex items-center gap-3 py-3">
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-center leading-none',
                          style.badge,
                        )}
                      >
                        <span className="text-sm font-bold">{daysLeft}</span>
                        <span className="text-[9px] font-medium uppercase">dias</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/quotes/${quote.id}`}
                          className="block truncate text-sm font-medium text-slate-900 hover:text-brand-600"
                        >
                          Orçamento #{quote.number} — {quote.client.name}
                        </Link>
                        <p className="text-xs text-slate-500">{formatCurrency(Number(quote.total))}</p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
                          style.pill,
                        )}
                      >
                        Vence em {dueLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card hoverable glow>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Clientes recentes</CardTitle>
            <Link
              href="/dashboard/clients"
              className="flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Ver todas <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentClientsWithTotals.length === 0 ? (
              <EmptyState
                title="Nenhum cliente cadastrado"
                description="Cadastre seu primeiro cliente para começar a criar orçamentos."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentClientsWithTotals.map((client, index) => (
                  <li key={client.id} className="flex items-center gap-3 py-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                        AVATAR_COLORS[index % AVATAR_COLORS.length],
                      )}
                    >
                      {getInitials(client.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="block truncate text-sm font-medium text-slate-900 hover:text-brand-600"
                      >
                        {client.name}
                      </Link>
                      <p className="truncate text-xs text-slate-500">
                        {client.email || (client.type === 'PF' ? 'Pessoa física' : 'Pessoa jurídica')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(client.totalValue)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {client.quoteCount} orçamento{client.quoteCount === 1 ? '' : 's'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card glass hoverable>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-600" />
            Resumo de desempenho
          </CardTitle>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500" />
              Orçamentos criados
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Valor aprovado (R$)
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {sum(quotesSparkLast7) === 0 ? (
            <EmptyState
              icon={<Activity className="h-6 w-6" />}
              title="Sem atividade nos últimos 7 dias"
              description="Crie ou aprove orçamentos para ver a evolução aqui."
            />
          ) : (
            <PerformanceGlowChart data={performanceData} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card glass hoverable>
          <CardHeader>
            <CardTitle>Valor aprovado — últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedQuotesForTrend.length === 0 ? (
              <EmptyState
                icon={<BarChart3 className="h-6 w-6" />}
                title="Ainda sem orçamentos aprovados"
                description="Assim que um orçamento for aprovado, a evolução do valor aparece aqui."
              />
            ) : (
              <RevenueTrendChart data={revenueTrend} />
            )}
          </CardContent>
        </Card>

        <Card glass hoverable>
          <CardHeader>
            <CardTitle>Orçamentos por status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="Nenhum orçamento criado ainda"
                description="Crie seu primeiro orçamento para acompanhar a distribuição por status."
              />
            ) : (
              <QuoteStatusChart data={statusData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
