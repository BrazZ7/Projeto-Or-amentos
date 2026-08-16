'use client';

import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { calculateItemTotal } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils';
import type { QuoteItemInput } from '@/lib/validations/quote';

export interface ProductOption {
  id: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  trackStock?: boolean;
  stockQuantity?: number;
}

interface QuoteItemsEditorProps {
  items: QuoteItemInput[];
  products: ProductOption[];
  onChange: (items: QuoteItemInput[]) => void;
}

const blankItem: QuoteItemInput = {
  productId: null,
  description: '',
  imageUrl: null,
  quantity: 1,
  unitPrice: 0,
  discount: 0,
};

export function QuoteItemsEditor({ items, products, onChange }: QuoteItemsEditorProps) {
  function updateItem(index: number, patch: Partial<QuoteItemInput>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  function addBlankItem() {
    onChange([...items, { ...blankItem }]);
  }

  function addProductItem(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    onChange([
      ...items,
      {
        productId: product.id,
        description: product.name,
        imageUrl: product.imageUrl,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
          Nenhum item adicionado ainda.
        </p>
      )}

      {items.map((item, index) => {
        const linkedProduct = products.find((p) => p.id === item.productId);
        const insufficientStock =
          linkedProduct?.trackStock && (linkedProduct.stockQuantity ?? 0) < item.quantity;

        return (
        <div key={index} className="rounded-xl border border-hairline p-3">
          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Input
                label={index === 0 ? 'Descrição' : undefined}
                name={`items.${index}.description`}
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={index === 0 ? 'Qtd.' : undefined}
                name={`items.${index}.quantity`}
                type="number"
                min={0.01}
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={index === 0 ? 'Vlr. unit.' : undefined}
                name={`items.${index}.unitPrice`}
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label={index === 0 ? 'Desconto' : undefined}
                name={`items.${index}.discount`}
                type="number"
                min={0}
                step="0.01"
                value={item.discount}
                onChange={(e) => updateItem(index, { discount: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-end justify-between sm:col-span-1">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between">
            {insufficientStock ? (
              <p className="text-xs font-medium text-amber-700">
                Estoque disponível: {linkedProduct?.stockQuantity ?? 0} {linkedProduct?.unit}
              </p>
            ) : (
              <span />
            )}
            <p className="text-right text-xs font-medium text-slate-400">
              Total do item: {formatCurrency(calculateItemTotal(item))}
            </p>
          </div>
        </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addBlankItem}>
          <Plus className="h-4 w-4" />
          Item personalizado
        </Button>
        {products.length > 0 && (
          <Select
            className="max-w-xs"
            name="addProductFromCatalog"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                addProductItem(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="">+ Adicionar produto/serviço do catálogo</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatCurrency(product.price)}
                {product.trackStock ? ` (estoque: ${product.stockQuantity ?? 0})` : ''}
              </option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
