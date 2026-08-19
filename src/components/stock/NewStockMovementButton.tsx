'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { STOCK_MOVEMENT_REASONS_BY_TYPE } from '@/lib/stock-labels';

export interface StockProductOption {
  id: string;
  name: string;
  unit: string;
  stockQuantity: number;
}

interface NewStockMovementButtonProps {
  products: StockProductOption[];
  defaultProductId?: string;
}

export function NewStockMovementButton({ products, defaultProductId }: NewStockMovementButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || '');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [reason, setReason] = useState('PURCHASE');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultProductId) {
      setProductId(defaultProductId);
      setOpen(true);
    }
  }, [defaultProductId]);

  const reasonOptions = STOCK_MOVEMENT_REASONS_BY_TYPE[type];

  function handleTypeChange(newType: 'IN' | 'OUT') {
    setType(newType);
    setReason(STOCK_MOVEMENT_REASONS_BY_TYPE[newType][0].value);
  }

  function resetForm() {
    setType('IN');
    setReason('PURCHASE');
    setQuantity('');
    setUnitCost('');
    setUnitPrice('');
    setNotes('');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/stock/movements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        type,
        reason,
        quantity: Number(quantity),
        unitCost: unitCost === '' ? null : Number(unitCost),
        unitPrice: unitPrice === '' ? null : Number(unitPrice),
        notes: notes || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Não foi possível registrar a movimentação.');
      return;
    }

    setOpen(false);
    resetForm();
    router.refresh();
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova movimentação
      </Button>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title="Nova movimentação de estoque"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Produto"
            name="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (estoque: {product.stockQuantity} {product.unit})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('IN')}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                type === 'IN'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-hairline text-slate-400'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('OUT')}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                type === 'OUT'
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-hairline text-slate-400'
              }`}
            >
              Saída
            </button>
          </div>

          <Select
            label="Motivo"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {reasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantidade"
              name="quantity"
              type="number"
              min={0.01}
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {type === 'IN' && reason === 'PURCHASE' && (
              <Input
                label="Custo unitário (R$)"
                name="unitCost"
                type="number"
                min={0}
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                hint="Atualiza o custo do produto"
              />
            )}
            {type === 'OUT' && reason === 'SALE' && (
              <Input
                label="Valor unitário (R$)"
                name="unitPrice"
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            )}
          </div>

          <Textarea
            label="Observações"
            name="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
