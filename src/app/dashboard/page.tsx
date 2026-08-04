import Link from 'next/link';
import { FileText, CheckCircle2, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatCurrency,
  formatDate,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
} from '@/lib/utils';

export default async function DashboardPage() {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [totalQuotes, approvedAgg, sentOrLaterCount, approvedCount, recentClients, expiringQuotes] =
    await Promise.all([
      prisma.quote.count({ where: { companyId } }),
      prisma.quote.aggregate({
        where: { companyId, status: 'APPROVED' },
        _sum: { total: true },
      }),
      prisma.quote.count({
        where: { companyId, status: { in: ['SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED'] } },
      }),
      prisma.quote.count({ where: { companyId, status: 'APPROVED' } }),
      prisma.client.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
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
    ]);

  const conversionRate = sentOrLaterCount > 0 ? (approvedCount / sentOrLaterCount) * 100 : 0;
  const approvedTotal = Number(approvedAgg._sum.total || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral dos seus orçamentos e clientes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={FileText} label="Orçamentos criados" value={String(totalQuotes)} />
        <StatsCard
          icon={CheckCircle2}
          label="Valor aprovado"
          value={formatCurrency(approvedTotal)}
          accent="text-emerald-600 bg-emerald-50"
        />
        <StatsCard
          icon={TrendingUp}
          label="Taxa de conversão"
          value={`${conversionRate.toFixed(1)}%`}
          accent="text-indigo-600 bg-indigo-50"
        />
        <StatsCard
          icon={Users}
          label="Clientes cadastrados"
          value={String(await prisma.client.count({ where: { companyId } }))}
          accent="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card hoverable>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Próximos do vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringQuotes.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Nenhum orçamento vencendo nos próximos 7 dias.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {expiringQuotes.map((quote) => (
                  <li key={quote.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/dashboard/quotes/${quote.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-brand-600"
                      >
                        Orçamento #{quote.number} — {quote.client.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Válido até {formatDate(quote.validUntil)}
                      </p>
                    </div>
                    <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card hoverable>
          <CardHeader>
            <CardTitle>Clientes recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <EmptyState
                title="Nenhum cliente cadastrado"
                description="Cadastre seu primeiro cliente para começar a criar orçamentos."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentClients.map((client) => (
                  <li key={client.id} className="flex items-center justify-between py-3">
                    <div>
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-brand-600"
                      >
                        {client.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {client.type === 'PF' ? 'Pessoa física' : 'Pessoa jurídica'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(client.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
