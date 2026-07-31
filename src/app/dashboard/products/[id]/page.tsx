import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/products/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const product = await prisma.product.findFirst({
    where: { id: params.id, companyId: session.user.companyId },
  });

  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Editar produto/serviço</h1>
        <p className="mt-1 text-sm text-slate-500">Atualize os dados de {product.name}.</p>
      </div>
      <ProductForm
        productId={product.id}
        initialData={{
          name: product.name,
          code: product.code || '',
          description: product.description || '',
          imageUrl: product.imageUrl || '',
          category: product.category || '',
          unit: product.unit,
          price: Number(product.price),
          cost: Number(product.cost),
          warranty: product.warranty || '',
          active: product.active,
        }}
      />
    </div>
  );
}
