'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export interface StockItemForEdit {
  id: string;
  name: string;
  unit: string;
  price: number;
  cost: number;
  stockQuantity: number;
}

export function EditStockItemButton({ item }: { item: StockItemForEdit }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(item.price));
  const [cost, setCost] = useState(String(item.cost));
  const [quantity, setQuantity] = useState(String(item.stockQuantity));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantidadeNova = Number(quantity);
  const diferenca = Number.isFinite(quantidadeNova) ? quantidadeNova - item.stockQuantity : 0;
  const margem = Number(price) - Number(cost);

  function abrir() {
    // Recarrega os valores atuais: o modal pode ter sido fechado com edicao
    // pela metade, e reabrir mostrando numero antigo induziria a erro.
    setPrice(String(item.price));
    setCost(String(item.cost));
    setQuantity(String(item.stockQuantity));
    setNotes('');
    setError(null);
    setOpen(true);
  }

  async function salvar() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/stock/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: Number(price),
        cost: Number(cost),
        quantity: Number(quantity),
        notes: notes.trim() || null,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível salvar as alterações.');
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        aria-label={`Editar ${item.name}`}
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={item.name}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Custo de compra"
              type="number"
              min={0}
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <Input
              label="Preço de venda"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {Number.isFinite(margem) && Number(cost) > 0 && (
            <p className="text-xs text-slate-400">
              Margem: <span className={margem >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                {formatCurrency(margem)}
              </span>{' '}
              por {item.unit}
              {margem >= 0 && Number(cost) > 0 && (
                <> · {((margem / Number(cost)) * 100).toFixed(0)}% sobre o custo</>
              )}
            </p>
          )}

          <div>
            <Input
              label={`Quantidade em estoque (${item.unit})`}
              type="number"
              min={0}
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              hint="Informe a quantidade contada, não a diferença."
            />
            {diferenca !== 0 && Number.isFinite(diferenca) && (
              <p className="mt-1.5 text-xs text-amber-300">
                Vai registrar {diferenca > 0 ? 'entrada' : 'saída'} de{' '}
                {Math.abs(diferenca).toLocaleString('pt-BR')} {item.unit} como ajuste de contagem.
              </p>
            )}
          </div>

          {diferenca !== 0 && (
            <Textarea
              label="Motivo do ajuste (opcional)"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: contagem de inventário, quebra, devolução..."
            />
          )}

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={salvar} loading={loading}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
