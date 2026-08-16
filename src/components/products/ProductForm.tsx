'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Loader2, Boxes, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AiTextActions } from '@/components/ui/AiTextActions';
import type { ProductInput } from '@/lib/validations/product';

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductInput>;
  currentStock?: number;
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
  trackStock: true,
  minStockAlert: null,
  ncm: '',
  cest: '',
  cfop: '',
  taxOrigin: 0,
  taxSituation: '',
};

export function ProductForm({ productId, initialData, currentStock }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>({ ...emptyForm, ...initialData });
  const [loading, setLoading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImportFromUrl() {
    if (!importUrl.trim()) {
      setImportError('Cole o link do produto para importar.');
      return;
    }
    setImporting(true);
    setImportError(null);
    setImportMessage(null);

    const res = await fetch('/api/ai/import-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: importUrl.trim() }),
    });
    const data = await res.json();
    setImporting(false);

    if (!res.ok) {
      setImportError(data.error || 'Não foi possível importar os dados desse link.');
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: data.name || prev.name,
      price: typeof data.price === 'number' ? data.price : prev.price,
      description: data.description || prev.description,
      category: data.category || prev.category,
    }));
    setImportMessage(
      data.price == null
        ? 'Dados importados, mas não encontramos um preço nessa página — confira o valor.'
        : 'Dados importados do link. Revise as informações antes de salvar.',
    );
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
    <form onSubmit={handleSubmit} className="glass space-y-6 rounded-2xl p-6 sm:p-8">
      <div className="glass-solid rounded-xl p-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Link2 className="h-4 w-4 text-brand-600" />
          Importar de um link (opcional)
        </label>
        <p className="mb-2 text-xs text-slate-500">
          Cole o link do produto em outro site — a IA identifica nome, preço e características automaticamente.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            className="flex-1"
            placeholder="https://..."
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleImportFromUrl} loading={importing}>
            <Sparkles className="h-4 w-4" />
            Buscar dados
          </Button>
        </div>
        {importMessage && <p className="mt-2 text-xs text-emerald-600">{importMessage}</p>}
        {importError && <p className="mt-2 text-xs text-rose-600">{importError}</p>}
      </div>

      <div className="flex gap-5">
        <ImageUpload
          label="Imagem"
          value={form.imageUrl}
          onChange={(url) => update('imageUrl', url || '')}
        />
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome"
            name="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
          <Input
            label="Código (SKU)"
            name="code"
            value={form.code || ''}
            onChange={(e) => update('code', e.target.value)}
          />
          <Input
            label="Categoria"
            name="category"
            value={form.category || ''}
            onChange={(e) => update('category', e.target.value)}
          />
          <Input
            label="Unidade"
            name="unit"
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
          name="description"
          rows={3}
          value={form.description || ''}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Preço de venda (R$)"
          name="price"
          type="number"
          step="0.01"
          min={0}
          value={form.price}
          onChange={(e) => update('price', Number(e.target.value))}
          required
        />
        <Input
          label="Custo (R$)"
          name="cost"
          type="number"
          step="0.01"
          min={0}
          value={form.cost}
          onChange={(e) => update('cost', Number(e.target.value))}
        />
        <Input
          label="Garantia"
          name="warranty"
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

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.trackStock}
              onChange={(e) => update('trackStock', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <Boxes className="h-4 w-4 text-slate-400" />
            Controla estoque
          </label>
          {productId && form.trackStock && (
            <Link
              href={`/dashboard/stock?productId=${productId}`}
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Ver/registrar movimentações
            </Link>
          )}
        </div>

        {form.trackStock && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {productId && (
              <div>
                <p className="mb-1.5 text-sm font-medium text-slate-700">Estoque atual</p>
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {currentStock ?? 0} {form.unit}
                </p>
              </div>
            )}
            <Input
              label="Alertar quando o estoque for menor que"
              name="minStockAlert"
              type="number"
              min={0}
              step="0.01"
              value={form.minStockAlert ?? ''}
              onChange={(e) =>
                update('minStockAlert', e.target.value === '' ? null : Number(e.target.value))
              }
              placeholder="Opcional"
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Dados fiscais (NF-e)</h2>
          <span className="text-xs text-slate-400">Necessários apenas para emitir nota</span>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Sem NCM e CFOP a SEFAZ rejeita a nota. Você pode salvar o produto sem eles e preencher
          depois — a emissão avisa exatamente o que estiver faltando.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="NCM"
            name="ncm"
            value={form.ncm || ''}
            onChange={(e) => update('ncm', e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="8 dígitos, ex: 85176294"
          />
          <Input
            label="CFOP"
            name="cfop"
            value={form.cfop || ''}
            onChange={(e) => update('cfop', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Padrão: 5102"
          />
          <Input
            label="CEST"
            name="cest"
            value={form.cest || ''}
            onChange={(e) => update('cest', e.target.value.replace(/\D/g, '').slice(0, 7))}
            placeholder="Só com substituição tributária"
          />
          <Select
            label="Origem da mercadoria"
            name="taxOrigin"
            value={String(form.taxOrigin ?? 0)}
            onChange={(e) => update('taxOrigin', Number(e.target.value))}
          >
            <option value="0">0 — Nacional</option>
            <option value="1">1 — Estrangeira, importação direta</option>
            <option value="2">2 — Estrangeira, adquirida no mercado interno</option>
            <option value="3">3 — Nacional, importação entre 40% e 70%</option>
            <option value="4">4 — Nacional, produção conforme processos produtivos</option>
            <option value="5">5 — Nacional, importação até 40%</option>
            <option value="6">6 — Estrangeira, importação direta sem similar nacional</option>
            <option value="7">7 — Estrangeira, mercado interno sem similar nacional</option>
            <option value="8">8 — Nacional, importação superior a 70%</option>
          </Select>
          <Input
            label="CSOSN / CST de ICMS"
            name="taxSituation"
            value={form.taxSituation || ''}
            onChange={(e) => update('taxSituation', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Simples: 102 · Normal: 00"
          />
        </div>
      </div>

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
