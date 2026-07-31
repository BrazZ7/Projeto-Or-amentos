'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AiTextActions } from '@/components/ui/AiTextActions';
import type { ProductInput } from '@/lib/validations/product';

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductInput>;
}

const emptyForm: ProductInput = {
  name: '',
  code: '',
  description: '',
  imageUrl: '',
  category: '',
  unit: 'un',
  price: 0,
  cost: 0,
  warranty: '',
  active: true,
};

export function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({ ...emptyForm, ...initialData });
  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerateDescription() {
    if (!form.name.trim()) {
      setError('Informe o nome do produto antes de gerar a descrição.');
      return;
    }
    setGeneratingDesc(true);
    setError(null);

    const res = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, category: form.category, notes: form.description }),
    });
    const data = await res.json();
    setGeneratingDesc(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível gerar a descrição.');
      return;
    }
    update('description', data.result);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
      method: productId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Não foi possível salvar o produto.');
      return;
    }

    router.push('/dashboard/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-5">
        <ImageUpload
          label="Imagem"
          value={form.imageUrl}
          onChange={(url) => update('imageUrl', url || '')}
        />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
          <Input
            label="Código (SKU)"
            value={form.code || ''}
            onChange={(e) => update('code', e.target.value)}
          />
          <Input
            label="Categoria"
            value={form.category || ''}
            onChange={(e) => update('category', e.target.value)}
          />
          <Input
            label="Unidade"
            value={form.unit}
            onChange={(e) => update('unit', e.target.value)}
            placeholder="un, kg, h, m²..."
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Descrição</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generatingDesc}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
            >
              {generatingDesc ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Gerar com IA
            </button>
            <AiTextActions text={form.description || ''} onResult={(r) => update('description', r)} />
          </div>
        </div>
        <Textarea
          rows={3}
          value={form.description || ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Preço de venda (R$)"
          type="number"
          step="0.01"
          min={0}
          value={form.price}
          onChange={(e) => update('price', Number(e.target.value))}
          required
        />
        <Input
          label="Custo (R$)"
          type="number"
          step="0.01"
          min={0}
          value={form.cost}
          onChange={(e) => update('cost', Number(e.target.value))}
        />
        <Input
          label="Garantia"
          value={form.warranty || ''}
          onChange={(e) => update('warranty', e.target.value)}
          placeholder="Ex: 90 dias"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => update('active', e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Ativo (disponível para uso em orçamentos)
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Salvar produto
        </Button>
      </div>
    </form>
  );
}
