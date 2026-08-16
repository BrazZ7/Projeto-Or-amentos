import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { QuotesTable } from '@/components/quotes/QuotesTable';

export default async function QuotesPage() {
  const session = await requireSession();

  const quotes = await prisma.quote.findMany({
    where: { companyId: session.user.companyId },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      {/* Sem botão de novo orçamento aqui: o cabeçalho do painel já traz um,
          fixo em todas as telas. */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Orçamentos</h1>
        <p className="mt-1 text-sm text-slate-400">Acompanhe e gerencie seus orçamentos.</p>
      </div>

      <QuotesTable
        quotes={quotes.map((q) => ({
          id: q.id,
          number: q.number,
          status: q.status,
          validUntil: q.validUntil.toISOString(),
          total: Number(q.total),
          client: { name: q.client.name },
        }))}
      />
    </div>
  );
}
