import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { QuoteForm } from '@/components/quotes/QuoteForm';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function NewQuotePage() {
  const session = await requireSession();
  const companyId = session.user.companyId;

  const [clients, products, company] = await Promise.all([
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
    prisma.company.findUniqueOrThrow({ where: { id: companyId } }),
  ]);

  const issueDate = new Date();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + company.defaultValidityDays);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Novo orçamento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monte manualmente ou peça para a IA montar um rascunho a partir de um pedido em texto.
        </p>
      </div>
      <QuoteForm
        clients={clients}
        products={products.map((p) => ({
          ...p,
          price: Number(p.price),
          stockQuantity: Number(p.stockQuantity),
        }))}
        initialData={{
          clientId: '',
          issueDate: toDateInputValue(issueDate),
          validUntil: toDateInputValue(validUntil),
          items: [],
          discountType: 'PERCENT',
          discountValue: 0,
          freight: 0,
          paymentTerms: company.defaultPaymentTerms || '',
          deliveryTerms: company.defaultDeliveryTerms || '',
          warranty: company.defaultWarranty || '',
          notes: company.defaultNotes || '',
          template: company.pdfTemplate,
        }}
      />
    </div>
  );
}
