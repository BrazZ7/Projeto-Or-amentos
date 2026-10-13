'use client';

import { useRef, useState } from 'react';
import { FileUp, Loader2, AlertTriangle, Package, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { usePlanFeatures } from '@/components/providers/PlanFeaturesProvider';
import { formatCurrency } from '@/lib/utils';
import type { ImportedQuote } from '@/lib/quote-import';
import type { QuoteItemInput } from '@/lib/validations/quote';

const MAX_MB = 8;

/**
 * Importa um orçamento pronto (PDF do fornecedor, foto de papel, print de
 * planilha) e identifica os itens.
 *
 * O resultado passa por conferência antes de entrar: documento de terceiro tem
 * erro de digitalização, item quebrado em duas linhas e valor que não fecha.
 * Cada linha vem marcada como produto ou serviço, e a diferença entre a soma
 * dos itens e o total impresso aparece em destaque — é o sinal mais barato de
 * que a leitura falhou em algum ponto.
 */
export function ImportQuoteButton({ onImport }: { onImport: (items: QuoteItemInput[]) => void }) {
  const { aiAllowed } = usePlanFeatures();
  const entrada = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ImportedQuote | null>(null);
  const [escolhidos, setEscolhidos] = useState<Set<number>>(new Set());

  if (!aiAllowed) return null;

  async function enviar(arquivo: File) {
    if (arquivo.size > MAX_MB * 1024 * 1024) {
      setOpen(true);
      setError(`O arquivo tem ${(arquivo.size / 1024 / 1024).toFixed(1)} MB. O limite é ${MAX_MB} MB.`);
      return;
    }

    setOpen(true);
    setLoading(true);
    setError(null);
    setResultado(null);

    const corpo = new FormData();
    corpo.append('file', arquivo);

    // FormData não passa por sendJson, que serializa em JSON.
    let res: Response;
    try {
      res = await fetch('/api/ai/import-quote', { method: 'POST', body: corpo });
    } catch {
      setLoading(false);
      setError('Não foi possível falar com o servidor. Verifique a conexão e tente de novo.');
      return;
    }

    const dados = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(dados?.error || 'Não foi possível ler o documento.');
      return;
    }

    setResultado(dados as ImportedQuote);
    setEscolhidos(new Set((dados as ImportedQuote).items.map((_, i) => i)));
  }

  function alternar(i: number) {
    setEscolhidos((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(i)) proximo.delete(i);
      else proximo.add(i);
      return proximo;
    });
  }

  function aplicar() {
    if (!resultado) return;
    const items: QuoteItemInput[] = resultado.items
      .filter((_, i) => escolhidos.has(i))
      .map((item) => ({
        productId: null,
        description: item.description,
        imageUrl: null,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
      }));

    onImport(items);
    setOpen(false);
    setResultado(null);
  }

  const somaEscolhida = resultado
    ? resultado.items
        .filter((_, i) => escolhidos.has(i))
        .reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    : 0;

  // Diferença acima de um centavo entre a soma lida e o total impresso indica
  // linha perdida ou valor mal lido.
  const divergencia =
    resultado?.documentTotal != null &&
    Math.abs(resultado.documentTotal - resultado.itemsTotal) > 0.01
      ? resultado.documentTotal - resultado.itemsTotal
      : null;

  return (
    <>
      <input
        ref={entrada}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) enviar(arquivo);
          e.target.value = '';
        }}
      />

      <Button type="button" variant="outline" size="sm" onClick={() => entrada.current?.click()}>
        <FileUp className="h-4 w-4" />
        Importar de arquivo
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Importar orçamento"
        maxWidth="max-w-2xl"
      >
        {loading && (
          <div className="flex items-center gap-3 py-10 text-sm text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            Lendo o documento e identificando os itens...
          </div>
        )}

        {error && <p className="text-sm text-rose-400">{error}</p>}

        {resultado && (
          <div className="space-y-4">
            {(resultado.supplier || resultado.clientName) && (
              <p className="text-sm text-slate-400">
                {resultado.supplier && (
                  <>
                    Emitido por <span className="text-slate-200">{resultado.supplier}</span>
                  </>
                )}
                {resultado.supplier && resultado.clientName && ' · '}
                {resultado.clientName && (
                  <>
                    para <span className="text-slate-200">{resultado.clientName}</span>
                  </>
                )}
              </p>
            )}

            {resultado.warnings.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  Confira estes pontos
                </p>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-amber-200/90">
                  {resultado.warnings.map((aviso, i) => (
                    <li key={i}>{aviso}</li>
                  ))}
                </ul>
              </div>
            )}

            {divergencia !== null && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                A soma dos itens ({formatCurrency(resultado.itemsTotal)}) não bate com o total
                impresso no documento ({formatCurrency(resultado.documentTotal ?? 0)}) — diferença de{' '}
                {formatCurrency(Math.abs(divergencia))}. Algum item pode ter ficado de fora.
              </p>
            )}

            {resultado.items.length === 0 ? (
              <p className="text-sm text-slate-400">
                Nenhum item foi identificado nesse documento.
              </p>
            ) : (
              <ul className="divide-y divide-hairline border-y border-hairline">
                {resultado.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={escolhidos.has(i)}
                      onChange={() => alternar(i)}
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
                      aria-label={`Incluir ${item.description}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200">{item.description}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                        {item.kind === 'servico' ? (
                          <Wrench className="h-3 w-3" />
                        ) : (
                          <Package className="h-3 w-3" />
                        )}
                        {item.kind === 'servico' ? 'Serviço' : 'Produto'} · {item.quantity}{' '}
                        {item.unit} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-slate-100">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">
                {escolhidos.size} de {resultado.items.length} · soma{' '}
                <span className="text-slate-100">{formatCurrency(somaEscolhida)}</span>
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={aplicar} disabled={escolhidos.size === 0}>
                  Adicionar {escolhidos.size} {escolhidos.size === 1 ? 'item' : 'itens'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Os itens entram no orçamento sem preço de venda ajustado — o valor lido é o do
              documento de origem. Revise antes de enviar ao cliente.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
