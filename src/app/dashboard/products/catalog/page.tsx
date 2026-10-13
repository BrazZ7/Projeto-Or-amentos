import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { CatalogBrowser } from '@/components/products/CatalogBrowser';

export default async function ProductCatalogPage() {
  const session = await requireSession();

  // Os codigos ja cadastrados marcam o que a empresa tem, evitando importacao
  // duplicada antes mesmo de chamar a API.
  const existing = await prisma.product.findMany({
    where: { companyId: session.user.companyId, code: { not: null } },
    select: { code: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/products"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Produtos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-100">Catálogo de sugestões</h1>
        <p className="mt-1 text-sm text-slate-400">
          Itens comuns do ramo elétrico, ferramentas e redes. Escolha o que você trabalha em vez de
          cadastrar um por um.
        </p>
      </div>

      <CatalogBrowser
        existingCodes={existing.map((product) => product.code).filter((code): code is string => !!code)}
      />
    </div>
  );
}
