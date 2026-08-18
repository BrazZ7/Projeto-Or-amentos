'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, PackagePlus, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  CATALOG_BRANDS,
  CATEGORY_LABELS,
  filterCatalog,
  type CatalogCategory,
} from '@/lib/catalog';
import { cn } from '@/lib/utils';

export function CatalogBrowser({ existingCodes }: { existingCodes: string[] }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [category, setCategory] = useState<CatalogCategory | 'ALL'>('ALL');
  const [brand, setBrand] = useState<string>('ALL');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const alreadyHave = useMemo(() => new Set(existingCodes), [existingCodes]);
  const results = useMemo(() => filterCatalog({ term, category, brand }), [term, category, brand]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function importSelected() {
    if (selected.size === 0) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch('/api/products/catalog-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected] }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível importar os itens.');
      return;
    }

    setSelected(new Set());
    setMessage(
      data.imported === 0
        ? 'Esses itens já estavam no seu cadastro.'
        : `${data.imported} ${data.imported === 1 ? 'produto adicionado' : 'produtos adicionados'} ao seu cadastro com preço e estoque zerados.` +
            (data.skipped ? ` ${data.skipped} já existiam e foram ignorados.` : ''),
    );
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="panel flex items-start gap-3 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
        <p className="text-sm text-slate-400">
          Importar um item apenas <strong className="text-slate-200">cadastra o produto</strong>. O
          estoque continua zerado até você registrar uma entrada — ter o item na lista não significa
          ter na prateleira. O preço também fica em branco, porque varia por fornecedor.
        </p>
      </div>

      <div className="panel grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, marca ou código..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as CatalogCategory | 'ALL')}
          aria-label="Categoria"
        >
          <option value="ALL">Todas as categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Marca">
          <option value="ALL">Todas as marcas</option>
          {CATALOG_BRANDS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {results.length} {results.length === 1 ? 'item encontrado' : 'itens encontrados'}
          {selected.size > 0 && ` · ${selected.size} selecionado${selected.size === 1 ? '' : 's'}`}
        </p>
        <Button onClick={importSelected} loading={loading} disabled={selected.size === 0}>
          <PackagePlus className="h-4 w-4" />
          Adicionar {selected.size > 0 ? `${selected.size} ` : ''}ao meu cadastro
        </Button>
      </div>

      {message && (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
          {error}
        </p>
      )}

      {results.length === 0 ? (
        <p className="panel p-8 text-center text-sm text-slate-500">
          Nada encontrado com esses filtros.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const have = alreadyHave.has(item.code);
            const isSelected = selected.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={have}
                onClick={() => toggle(item.id)}
                className={cn(
                  'panel p-4 text-left transition-all duration-200',
                  have
                    ? 'cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'border-brand-400/50 ring-1 ring-brand-400/40'
                      : 'hover:-translate-y-0.5 hover:border-hairline-strong',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-slate-100">{item.name}</span>
                  {isSelected && !have && (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-slate-300">
                    {item.brand}
                  </span>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-slate-400">
                    {CATEGORY_LABELS[item.category]}
                  </span>
                  <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-slate-400">
                    por {item.unit}
                  </span>
                  {have && (
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                      já cadastrado
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
