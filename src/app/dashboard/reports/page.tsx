import { startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { TrendingUp, Users, Package, Percent } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueAreaChart, type RevenuePoint } from '@/components/dashboard/charts/RevenueAreaChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const FUNNEL_STEPS = [
  { key: 'created', label: 'Criados' },
  { key: 'sent', label: 'Enviados' },
  { key: 'viewed', label: 'Visualizados' },
  { key: 'approved', label: 'Aprovados' },
] as const;

export default async function ReportsPage() {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const now = new Date();
  const twelveMonthsAgo = startOfMonth(subMonths(now, 11));

  const [quotes, statusGroups, clientGroups, itemGroups, approvedAgg, ticketAgg] = await Promise.all([
    prisma.quote.findMany({
      where: { companyId, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true, approvedAt: true, sentAt: true, viewedAt: true, total: true, status: true },
    }),
    prisma.quote.groupBy({ by: ['status'], where: { companyId }, _count: { _all: true } }),
    prisma.quote.groupBy({
      by: ['clientId'],
      where: { companyId, status: 'APPROVED' },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
    prisma.quoteItem.groupBy({
      by: ['description'],
      where: { quote: { companyId, status: 'APPROVED' } },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
    prisma.quote.aggregate({ where: { companyId, status: 'APPROVED' }, _sum: { total: true } }),
    prisma.quote.aggregate({ where: { companyId, status: 'APPROVED' }, _avg: { total: true } }),
  ]);

  const clientIds = clientGroups.map((group) => group.clientId);
  const clients = clientIds.length
    ? await prisma.client.findMany({
        where: { id: { in: clientIds }, companyId },
        select: { id: true, name: true },
      })
    : [];
  const clientName = (id: string) => clients.find((client) => client.id === id)?.name ?? 'Cliente';

  const monthlyData: RevenuePoint[] = Array.from({ length: 12 }, (_, index) => {
    const monthStart = startOfMonth(subMonths(now, 11 - index));
    return {
      label: monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      fullLabel: monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      revenue: quotes
        .filter((quote) => quote.approvedAt && isSameMonth(quote.approvedAt, monthStart))
        .reduce((total, quote) => total + Number(quote.total), 0),
      quotes: quotes.filter((quote) => isSameMonth(quote.createdAt, monthStart)).length,
    };
  });

  const funnel = {
    created: quotes.length,
    sent: quotes.filter((quote) => quote.sentAt).length,
    viewed: quotes.filter((quote) => quote.viewedAt).length,
    approved: quotes.filter((quote) => quote.approvedAt).length,
  };
  const conversion = funnel.sent > 0 ? (funnel.approved / funnel.sent) * 100 : 0;

  const totalApproved = Number(approvedAgg._sum.total || 0);
  const averageTicket = Number(ticketAgg._avg.total || 0);
  const activeClients = clientGroups.length;

  const totalStatus = statusGroups.reduce((total, group) => total + group._count._all, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Relatórios</h1>
        <p className="mt-1 text-sm text-slate-400">
          Desempenho comercial dos últimos 12 meses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={TrendingUp}
          label="Total aprovado"
          value={formatCurrency(totalApproved)}
          accent="emerald"
        />
        <StatsCard
          icon={Percent}
          label="Taxa de conversão"
          value={`${conversion.toFixed(1)}%`}
          accent="blue"
        />
        <StatsCard
          icon={Package}
          label="Ticket médio"
          value={formatCurrency(averageTicket)}
          accent="violet"
        />
        <StatsCard
          icon={Users}
          label="Clientes que compraram"
          value={String(activeClients)}
          accent="amber"
        />
      </div>

      <RevenueAreaChart data={monthlyData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-100">Funil de conversão</h2>
          {funnel.created === 0 ? (
            <EmptyState title="Sem dados no período" description="Crie orçamentos para ver o funil." />
          ) : (
            <ul className="mt-4 space-y-3">
              {FUNNEL_STEPS.map((step) => {
                const value = funnel[step.key];
                const percent = funnel.created > 0 ? (value / funnel.created) * 100 : 0;
                return (
                  <li key={step.key}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{step.label}</span>
                      <span className="text-slate-400">
                        {value}
                        <span className="ml-1.5 text-xs text-slate-400">{percent.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-night-850">
                      <div
                        className="h-full origin-left animate-grow-x rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                        style={{ width: `${Math.max(percent, 2)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-100">Orçamentos por status</h2>
          {totalStatus === 0 ? (
            <EmptyState title="Nenhum orçamento" description="A distribuição aparece aqui." />
          ) : (
            <ul className="mt-4 space-y-2.5">
              {statusGroups
                .sort((a, b) => b._count._all - a._count._all)
                .map((group) => {
                  const percent = (group._count._all / totalStatus) * 100;
                  return (
                    <li key={group.status} className="flex items-center gap-3">
                      <Badge className={`${QUOTE_STATUS_COLORS[group.status]} w-28 justify-center`}>
                        {QUOTE_STATUS_LABELS[group.status] || group.status}
                      </Badge>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-night-850">
                        <div
                          className="h-full origin-left animate-grow-x rounded-full bg-slate-500/60"
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm text-slate-400">
                        {group._count._all}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-100">Melhores clientes</h2>
          {clientGroups.length === 0 ? (
            <EmptyState title="Nenhuma venda aprovada" description="O ranking aparece aqui." />
          ) : (
            <ul className="mt-4 divide-y divide-hairline">
              {clientGroups.map((group, index) => (
                <li key={group.clientId} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-sm font-semibold text-slate-400">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                    {clientName(group.clientId)}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-slate-100">
                      {formatCurrency(Number(group._sum.total || 0))}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {group._count._all} orçamento{group._count._all === 1 ? '' : 's'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-100">Itens mais vendidos</h2>
          {itemGroups.length === 0 ? (
            <EmptyState title="Nenhum item aprovado" description="O ranking aparece aqui." />
          ) : (
            <ul className="mt-4 divide-y divide-hairline">
              {itemGroups.map((group, index) => (
                <li key={group.description} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-sm font-semibold text-slate-400">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-200">
                    {group.description}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-slate-100">
                      {formatCurrency(Number(group._sum.total || 0))}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {Number(group._sum.quantity || 0)} un.
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
