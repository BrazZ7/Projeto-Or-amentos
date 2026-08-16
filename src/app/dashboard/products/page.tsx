import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { ProductsGrid } from '@/components/products/ProductsGrid';

export default async function ProductsPage() {
  const session = await requireSession();

  const products = await prisma.product.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
      category: true,
      unit: true,
      price: true,
      imageUrl: true,
      active: true,
      trackStock: true,
      stockQuantity: true,
      minStockAlert: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Produtos e serviços</h1>
          <p className="mt-1 text-sm text-slate-400">Catálogo usado na montagem dos orçamentos.</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </Link>
      </div>

      <ProductsGrid
        products={products.map((p) => ({
          ...p,
          price: Number(p.price),
          stockQuantity: Number(p.stockQuantity),
          minStockAlert: p.minStockAlert != null ? Number(p.minStockAlert) : null,
        }))}
      />
    </div>
  );
}
