import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { CompanyForm } from '@/components/company/CompanyForm';

export default async function CompanyPage() {
  const session = await requireSession();

  const company = await prisma.company.findUniqueOrThrow({
    where: { id: session.user.companyId },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Minha empresa</h1>
        <p className="mt-1 text-sm text-slate-400">
          Esses dados aparecem nos orçamentos gerados em PDF.
        </p>
      </div>
      <CompanyForm
        initialData={{
          legalName: company.legalName,
          tradeName: company.tradeName || '',
          documentType: company.documentType,
          document: company.document,
          email: company.email || '',
          phone: company.phone || '',
          whatsapp: company.whatsapp || '',
          addressStreet: company.addressStreet || '',
          addressNumber: company.addressNumber || '',
          addressComplement: company.addressComplement || '',
          addressNeighborhood: company.addressNeighborhood || '',
          addressCity: company.addressCity || '',
          addressState: company.addressState || '',
          addressZipCode: company.addressZipCode || '',
          logoUrl: company.logoUrl || '',
          signatureUrl: company.signatureUrl || '',
          primaryColor: company.primaryColor,
          secondaryColor: company.secondaryColor,
          fontFamily: company.fontFamily,
          bankName: company.bankName || '',
          bankAgency: company.bankAgency || '',
          bankAccount: company.bankAccount || '',
          pixKey: company.pixKey || '',
          paymentNotes: company.paymentNotes || '',
          stateRegistration: company.stateRegistration || '',
          taxRegime: company.taxRegime,
          cityCode: company.cityCode || '',
        }}
      />
    </div>
  );
}
