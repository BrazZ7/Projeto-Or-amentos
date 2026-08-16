'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Users, Package, Search, Loader2, CornerDownLeft } from 'lucide-react';
import type { SearchResult } from '@/app/api/search/route';

const TYPE_META = {
  quote: { icon: FileText, label: 'Orçamento', className: 'bg-blue-500/15 text-blue-300' },
  client: { icon: Users, label: 'Cliente', className: 'bg-emerald-500/15 text-emerald-300' },
  product: { icon: Package, label: 'Produto', className: 'bg-violet-500/15 text-violet-300' },
} as const;

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      setTerm('');
      setResults([]);
      setActive(0);
      // Sem o timeout o input ainda não está montado quando o efeito roda.
      const id = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // AbortController evita que uma resposta antiga chegue depois de uma mais
    // nova e sobrescreva a lista com resultado de outro termo.
    const controller = new AbortController();
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setActive(0);
      } catch {
        // Requisição cancelada por outra digitação — nada a fazer.
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(id);
    };
  }, [term, open]);

  function go(result: SearchResult) {
    onClose();
    router.push(result.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') return onClose();
    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[active]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-night-950/80 backdrop-blur-sm" onClick={onClose} />

      <div
        className="panel-overlay relative w-full max-w-xl animate-scale-in overflow-hidden p-0"
        role="dialog"
        aria-modal="true"
        aria-label="Busca"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          {loading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-300" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
          )}
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar orçamentos, clientes, produtos..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="shrink-0 rounded-md border border-hairline-strong bg-night-700/80 px-1.5 py-0.5 font-sans text-[11px] text-slate-400">
            ESC
          </kbd>
        </div>

        {term.trim().length < 2 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Digite ao menos 2 caracteres para buscar.
          </p>
        ) : results.length === 0 && !loading ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Nada encontrado para “{term.trim()}”.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((result, index) => {
              const meta = TYPE_META[result.type];
              return (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(result)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                    >
                      <meta.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-100">
                        {result.title}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{result.subtitle}</span>
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-slate-500">
                      {meta.label}
                    </span>
                    {index === active && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
