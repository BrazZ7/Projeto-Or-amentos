import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PlanSubscribeButton } from '@/components/company/PlanSubscribeButton';

const statusLabels: Record<string, string> = {
  TRIALING: 'Período de teste',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
};

export default async function PlanPage() {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const [subscription, plans, quotesThisMonth, clientsCount, productsCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { companyId }, include: { plan: true } }),
    prisma.plan.findMany({ orderBy: { priceMonthly: 'asc' } }),
    prisma.quote.count({
      where: {
        companyId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.client.count({ where: { companyId } }),
    prisma.product.count({ where: { companyId } }),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Plano e assinatura</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie os limites de uso da sua conta.</p>
      </div>

      {subscription && (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Plano atual: {subscription.plan.name}</CardTitle>
            <Badge className="bg-brand-50 text-brand-700">
              {statusLabels[subscription.status]}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription.currentPeriodEnd && (
              <p className="text-sm text-slate-500">
                Renovação/expiração em {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <UsageBar
                label="Orçamentos este mês"
                used={quotesThisMonth}
                limit={subscription.plan.maxQuotesPerMonth}
              />
              <UsageBar label="Clientes" used={clientsCount} limit={subscription.plan.maxClients} />
              <UsageBar label="Produtos" used={productsCount} limit={subscription.plan.maxProducts} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          return (
            <Card key={plan.id} className={isCurrent ? 'border-brand-400 ring-1 ring-brand-100' : ''}>
              <CardContent className="flex flex-col gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">
                    {formatCurrency(Number(plan.priceMonthly))}
                    <span className="text-sm font-normal text-slate-400">/mês</span>
                  </p>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>Até {plan.maxQuotesPerMonth} orçamentos/mês</li>
                  <li>Até {plan.maxClients} clientes</li>
                  <li>Até {plan.maxProducts} produtos</li>
                  <li>Até {plan.maxUsers} usuário(s)</li>
                  {plan.hasAiFeatures && <li>Recursos de IA inclusos</li>}
                  {plan.hasCustomBrand && <li>Identidade visual personalizada</li>}
                </ul>
                <PlanSubscribeButton planId={plan.id} isCurrent={isCurrent} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const over = used > limit;
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className={over ? 'font-medium text-rose-600' : ''}>
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-brand-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
