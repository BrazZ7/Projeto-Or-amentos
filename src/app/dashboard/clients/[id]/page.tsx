import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ClientForm } from '@/components/clients/ClientForm';

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const client = await prisma.client.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!client) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Editar cliente</h1>
        <p className="mt-1 text-sm text-slate-500">Atualize os dados de {client.name}.</p>
      </div>
      <ClientForm
        clientId={client.id}
        initialData={{
          type: client.type,
          name: client.name,
          document: client.document || '',
          email: client.email || '',
          phone: client.phone || '',
          whatsapp: client.whatsapp || '',
          addressStreet: client.addressStreet || '',
          addressNumber: client.addressNumber || '',
          addressComplement: client.addressComplement || '',
          addressNeighborhood: client.addressNeighborhood || '',
          addressCity: client.addressCity || '',
          addressState: client.addressState || '',
          addressZipCode: client.addressZipCode || '',
          notes: client.notes || '',
          stateRegistration: client.stateRegistration || '',
          stateRegistrationType: client.stateRegistrationType,
          cityCode: client.cityCode || '',
        }}
      />
    </div>
  );
}
