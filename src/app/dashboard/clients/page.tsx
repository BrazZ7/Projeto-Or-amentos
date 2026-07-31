import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { ClientsTable } from '@/components/clients/ClientsTable';

export default async function ClientsPage() {
  const session = await requireSession();

  const clients = await prisma.client.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, type: true, document: true, email: true, phone: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">Gerencie seus clientes pessoa física e jurídica.</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        </Link>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
