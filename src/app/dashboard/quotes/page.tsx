import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orçamentos</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe e gerencie seus orçamentos.</p>
        </div>
        <Link href="/dashboard/quotes/new">
          <Button>
            <Plus className="h-4 w-4" />
            Novo orçamento
          </Button>
        </Link>
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
