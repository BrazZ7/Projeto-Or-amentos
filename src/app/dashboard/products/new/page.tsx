import { ProductForm } from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Novo produto/serviço</h1>
        <p className="mt-1 text-sm text-slate-400">Adicione um item ao seu catálogo.</p>
      </div>
      <ProductForm />
    </div>
  );
}
