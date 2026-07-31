import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PdfSettingsForm } from '@/components/company/PdfSettingsForm';

export default async function PdfSettingsPage() {
  const session = await requireSession();

  const company = await prisma.company.findUniqueOrThrow({
    where: { id: session.user.companyId },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Modelos de PDF</h1>
        <p className="mt-1 text-sm text-slate-500">
          Personalize o modelo, layout e textos padrão usados na geração dos orçamentos.
        </p>
      </div>
      <PdfSettingsForm
        initialData={{
          pdfTemplate: company.pdfTemplate,
          logoPosition: company.logoPosition,
          headerText: company.headerText || '',
          footerText: company.footerText || '',
          quotePrefix: company.quotePrefix,
          defaultValidityDays: company.defaultValidityDays,
          defaultPaymentTerms: company.defaultPaymentTerms || '',
          defaultDeliveryTerms: company.defaultDeliveryTerms || '',
          defaultWarranty: company.defaultWarranty || '',
          defaultNotes: company.defaultNotes || '',
        }}
      />
    </div>
  );
}
