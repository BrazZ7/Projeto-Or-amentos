'use client';

import { useState } from 'react';
import { Search, Loader2, ExternalLink, TrendingDown } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usePlanFeatures } from '@/components/providers/PlanFeaturesProvider';
import { formatCurrency } from '@/lib/utils';
import { sendJson } from '@/lib/http';
import type { PriceSearchResult } from '@/lib/price-search';

/**
 * Busca o preço de mercado do produto na web e mostra as ofertas encontradas.
 *
 * Nada é preenchido sozinho: cada oferta traz loja, valor e link, e o usuário
 * escolhe qual usar. Preço de varejo muda por dia, região e vendedor, e pode ou
 * não incluir frete — preencher automaticamente mandaria um número não conferido
 * direto para o orçamento do cliente.
 */
export function PriceSearchButton({
  query,
  onPick,
  label = 'Buscar preço na web',
  compact = false,
}: {
  /** O que procurar: descrição do item ou nome do produto. */
  query: string;
  /** Recebe o valor escolhido. Sem isto, o resultado é só consulta. */
  onPick?: (price: number) => void;
  label?: string;
  compact?: boolean;
}) {
  const { aiAllowed } = usePlanFeatures();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PriceSearchResult | null>(null);

  if (!aiAllowed) return null;

  const termo = query.trim();
  const habilitado = termo.length >= 3 && !loading;

  async function buscar() {
    setOpen(true);
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await sendJson<PriceSearchResult>(
      '/api/ai/price-search',
      'POST',
      { query: termo },
      'Não foi possível buscar o preço.',
    );
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.data);
  }

  return (
    <>
      <button
        type="button"
        onClick={buscar}
        disabled={!habilitado}
        title={termo.length < 3 ? 'Descreva o item antes de buscar' : label}
        className={
          compact
            ? 'inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-brand-400 transition-colors hover:bg-white/5 hover:text-brand-300 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent'
            : 'inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 transition-colors hover:text-brand-300 disabled:cursor-not-allowed disabled:text-slate-600'
        }
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
        {compact ? 'Preço' : label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Preço de mercado" maxWidth="max-w-xl">
        <p className="text-sm text-slate-400">
          Procurando por <span className="text-slate-200">{termo}</span>
        </p>

        {loading && (
          <div className="flex items-center gap-3 py-10 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            Pesquisando em lojas brasileiras...
          </div>
        )}

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

        {result && (
          <div className="mt-4 space-y-4">
            {result.offers.length > 0 && (
              <div className="flex flex-wrap gap-4 rounded-xl border border-hairline bg-white/[0.03] px-4 py-3">
                <div>
                  <p className="text-xs text-slate-500">Menor preço</p>
                  <p className="flex items-center gap-1.5 text-lg font-semibold text-emerald-300">
                    <TrendingDown className="h-4 w-4" />
                    {formatCurrency(result.lowest ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Média</p>
                  <p className="text-lg font-semibold text-slate-100">
                    {formatCurrency(result.average ?? 0)}
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-400">{result.summary}</p>

            <ul className="divide-y divide-hairline border-y border-hairline">
              {result.offers.map((oferta, i) => (
                <li key={`${oferta.store}-${i}`} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{oferta.store}</p>
                    {oferta.note && <p className="truncate text-xs text-slate-500">{oferta.note}</p>}
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-slate-100">
                    {formatCurrency(oferta.price)}
                  </span>
                  {oferta.url && (
                    <a
                      href={oferta.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      title="Abrir a página da oferta"
                      className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {onPick && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onPick(oferta.price);
                        setOpen(false);
                      }}
                    >
                      Usar
                    </Button>
                  )}
                </li>
              ))}
            </ul>

            <p className="text-xs text-slate-500">
              Valores de varejo coletados na web agora, como referência. Mudam por dia, região e
              vendedor, e podem não incluir frete — confira na loja antes de fechar o orçamento.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
