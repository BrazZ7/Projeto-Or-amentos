import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { QuoteActions } from '@/components/quotes/QuoteActions';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '@/lib/utils';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const quote = await prisma.quote.findFirst({
    where: { id: params.id, companyId },
    include: { items: { orderBy: { order: 'asc' } }, client: true },
  });
  if (!quote) notFound();

  const [clients, products] = await Promise.all([
    prisma.client.findMany({ where: { companyId }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.product.findMany({
      where: { companyId, active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        unit: true,
        trackStock: true,
        stockQuantity: true,
      },
    }),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">Orçamento #{quote.number}</h1>
            <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
              {QUOTE_STATUS_LABELS[quote.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {quote.client.name} · Total {formatCurrency(Number(quote.total))}
          </p>
        </div>
      </div>

      <QuoteActions
        quoteId={quote.id}
        publicToken={quote.publicToken}
        status={quote.status}
        clientEmail={quote.client.email}
        clientWhatsapp={quote.client.whatsapp}
        total={formatCurrency(Number(quote.total))}
      />

      <QuoteForm
        quoteId={quote.id}
        clients={clients}
        products={products.map((p) => ({
          ...p,
          price: Number(p.price),
          stockQuantity: Number(p.stockQuantity),
        }))}
        initialData={{
          clientId: quote.clientId,
          issueDate: toDateInputValue(quote.issueDate),
          validUntil: toDateInputValue(quote.validUntil),
          status: quote.status,
          items: quote.items.map((item) => ({
            productId: item.productId,
            description: item.description,
            imageUrl: item.imageUrl,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discount: Number(item.discount),
          })),
          discountType: quote.discountType,
          discountValue: Number(quote.discountValue),
          freight: Number(quote.freight),
          paymentTerms: quote.paymentTerms || '',
          deliveryTerms: quote.deliveryTerms || '',
          warranty: quote.warranty || '',
          notes: quote.notes || '',
          template: quote.template,
        }}
      />
    </div>
  );
}
