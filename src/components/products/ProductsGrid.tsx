'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Pencil, Trash2, Package } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

export interface ProductRow {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  unit: string;
  price: number;
  imageUrl: string | null;
  active: boolean;
  trackStock: boolean;
  stockQuantity: number;
  minStockAlert: number | null;
}

export function ProductsGrid({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q),
    );
  }, [products, query]);

  async function handleDelete(id: string) {
    if (!confirm('Excluir este produto/serviço?')) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou código..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Nenhum produto ou serviço encontrado"
          description="Cadastre produtos e serviços para agilizar a criação de orçamentos."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {product.imageUrl ? (
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Package className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-slate-900">{product.name}</p>
                  {!product.active && (
                    <Badge className="shrink-0 bg-slate-100 text-slate-500">Inativo</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {product.code ? `Cód. ${product.code} · ` : ''}
                  {product.category || 'Sem categoria'}
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-700">
                  {formatCurrency(product.price)}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {product.unit}</span>
                </p>
                {product.trackStock && (
                  <p className="mt-1 text-xs">
                    <span
                      className={
                        product.minStockAlert != null && product.stockQuantity < product.minStockAlert
                          ? 'font-semibold text-amber-700'
                          : 'text-slate-500'
                      }
                    >
                      Estoque: {product.stockQuantity} {product.unit}
                    </span>
                    {product.minStockAlert != null && product.stockQuantity < product.minStockAlert && (
                      <Badge className="ml-1.5 bg-amber-100 text-amber-700">Baixo</Badge>
                    )}
                  </p>
                )}
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
