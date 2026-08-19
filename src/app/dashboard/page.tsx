import { subMonths, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { FileText, CheckCircle2, Clock, DollarSign } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueAreaChart, type RevenuePoint } from '@/components/dashboard/charts/RevenueAreaChart';
import { RecentQuotesTable } from '@/components/dashboard/RecentQuotesTable';
import { ProposalPreview } from '@/components/dashboard/ProposalPreview';
import { RecentActivity, type ActivityItem } from '@/components/dashboard/RecentActivity';
import { QuickShortcuts } from '@/components/dashboard/QuickShortcuts';
import { formatCurrency } from '@/lib/utils';

const PENDING_STATUSES = ['DRAFT', 'SENT', 'VIEWED'] as const;

function pctDelta(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default async function DashboardPage() {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const now = new Date();
  const twelveMonthsAgo = startOfMonth(subMonths(now, 11));
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    totalQuotes,
    approvedCount,
    pendingCount,
    monthRevenue,
    prevMonthRevenue,
    quotesThisMonth,
    quotesLastMonth,
    approvedThisMonth,
    approvedLastMonth,
    pendingLastMonth,
    monthlySeries,
    recentQuotes,
    latestQuote,
    company,
    activityQuotes,
  ] = await Promise.all([
    prisma.quote.count({ where: { companyId } }),
    prisma.quote.count({ where: { companyId, status: 'APPROVED' } }),
    prisma.quote.count({ where: { companyId, status: { in: [...PENDING_STATUSES] } } }),
    prisma.quote.aggregate({
      where: { companyId, status: 'APPROVED', approvedAt: { gte: thisMonthStart } },
      _sum: { total: true },
    }),
    prisma.quote.aggregate({
      where: {
        companyId,
        status: 'APPROVED',
        approvedAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
      _sum: { total: true },
    }),
    prisma.quote.count({ where: { companyId, createdAt: { gte: thisMonthStart } } }),
    prisma.quote.count({
      where: { companyId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.quote.count({
      where: { companyId, status: 'APPROVED', approvedAt: { gte: thisMonthStart } },
    }),
    prisma.quote.count({
      where: {
        companyId,
        status: 'APPROVED',
        approvedAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
    prisma.quote.count({
      where: {
        companyId,
        status: { in: [...PENDING_STATUSES] },
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
    // Série de 12 meses: o seletor de período do gráfico recorta no cliente.
    prisma.quote.findMany({
      where: { companyId, createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true, approvedAt: true, total: true, status: true },
    }),
    prisma.quote.findMany({
      where: { companyId },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.quote.findFirst({
      where: { companyId },
      include: {
        client: { select: { name: true } },
        items: { orderBy: { order: 'asc' }, take: 3 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
    prisma.quote.findMany({
      where: { companyId },
      select: {
        id: true,
        number: true,
        createdAt: true,
        sentAt: true,
        viewedAt: true,
        approvedAt: true,
        rejectedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 12,
    }),
  ]);

  const revenueThisMonth = Number(monthRevenue._sum.total || 0);
  const revenuePrevMonth = Number(prevMonthRevenue._sum.total || 0);

  const monthlyData: RevenuePoint[] = Array.from({ length: 12 }, (_, index) => {
    const monthStart = startOfMonth(subMonths(now, 11 - index));
    const approved = monthlySeries.filter(
      (quote) => quote.approvedAt && isSameMonth(quote.approvedAt, monthStart),
    );
    const created = monthlySeries.filter((quote) => isSameMonth(quote.createdAt, monthStart));
    return {
      label: monthStart.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      fullLabel: `${monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      revenue: approved.reduce((total, quote) => total + Number(quote.total), 0),
      quotes: created.length,
    };
  });

  // Cada carimbo de data vira um item do feed; a lista é achatada e ordenada
  // pelo instante em que aconteceu.
  const activities: ActivityItem[] = activityQuotes
    .flatMap((quote) => {
      const events: ActivityItem[] = [
        { kind: 'CREATED' as const, at: quote.createdAt },
        ...(quote.sentAt ? [{ kind: 'SENT' as const, at: quote.sentAt }] : []),
        ...(quote.viewedAt ? [{ kind: 'VIEWED' as const, at: quote.viewedAt }] : []),
        ...(quote.approvedAt ? [{ kind: 'APPROVED' as const, at: quote.approvedAt }] : []),
        ...(quote.rejectedAt ? [{ kind: 'REJECTED' as const, at: quote.rejectedAt }] : []),
      ].map((event) => ({
        id: `${quote.id}-${event.kind}`,
        kind: event.kind,
        at: event.at,
        quoteId: quote.id,
        quoteNumber: quote.number,
      }));
      return events;
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 4);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        {/* 4 lado a lado a partir de lg, que é onde a casca de desktop começa.
            Abaixo disso ficam 2x2: em 375px cada card teria ~80px e o valor em
            reais não caberia. */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={FileText}
            label="Orçamentos gerados"
            value={String(totalQuotes)}
            accent="blue"
            delta={pctDelta(quotesThisMonth, quotesLastMonth)}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Aprovados"
            value={String(approvedCount)}
            accent="emerald"
            delta={pctDelta(approvedThisMonth, approvedLastMonth)}
          />
          <StatsCard
            icon={Clock}
            label="Pendentes"
            value={String(pendingCount)}
            accent="amber"
            delta={pctDelta(pendingCount, pendingLastMonth)}
          />
          <StatsCard
            icon={DollarSign}
            label="Faturamento mensal"
            value={formatCurrency(revenueThisMonth)}
            accent="violet"
            delta={pctDelta(revenueThisMonth, revenuePrevMonth)}
          />
        </div>

        <RevenueAreaChart data={monthlyData} />

        <RecentQuotesTable
          quotes={recentQuotes.map((quote) => ({
            id: quote.id,
            number: quote.number,
            quotePrefix: company.quotePrefix,
            clientName: quote.client.name,
            issueDate: quote.issueDate,
            status: quote.status,
            total: Number(quote.total),
            publicToken: quote.publicToken,
          }))}
        />
      </div>

      <div className="space-y-6">
        <ProposalPreview
          quote={
            latestQuote && {
              id: latestQuote.id,
              number: latestQuote.number,
              quotePrefix: company.quotePrefix,
              clientName: latestQuote.client.name,
              issueDate: latestQuote.issueDate,
              total: Number(latestQuote.total),
              companyName: company.tradeName || company.legalName,
              logoUrl: company.logoUrl,
              items: latestQuote.items.map((item) => ({
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.total),
              })),
            }
          }
        />
        <RecentActivity items={activities} />
        <QuickShortcuts />
      </div>
    </div>
  );
}
