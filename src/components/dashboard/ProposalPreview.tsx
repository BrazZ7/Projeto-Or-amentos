import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface ProposalPreviewData {
  id: string;
  number: number;
  quotePrefix: string;
  clientName: string;
  issueDate: Date;
  total: number;
  companyName: string;
  logoUrl: string | null;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
}

/**
 * Miniatura da proposta do último orçamento. É uma representação em HTML, não
 * o PDF real: renderizar o PDF aqui custaria uma requisição pesada a cada
 * carregamento do painel só para mostrar uma prévia de 200px.
 */
export function ProposalPreview({ quote }: { quote: ProposalPreviewData | null }) {
  return (
    <div className="panel p-5">
      <h2 className="text-base font-semibold text-slate-100">Prévia da proposta</h2>

      {!quote ? (
        <p className="py-8 text-center text-sm text-slate-500">
          Crie um orçamento para ver a prévia aqui.
        </p>
      ) : (
        <Link href={`/dashboard/quotes/${quote.id}`} className="group mt-4 block">
          <div className="overflow-hidden rounded-xl bg-white p-4 text-slate-900 shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {quote.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- logo do usuário, sem otimização necessária nesta miniatura
                  <img src={quote.logoUrl} alt="" className="mb-2 h-6 object-contain" />
                ) : (
                  <span className="mb-2 inline-block rounded border border-slate-300 px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider text-slate-400">
                    Seu logo
                  </span>
                )}
                <p className="truncate text-[11px] font-bold text-slate-900">Proposta Comercial</p>
                <p className="truncate text-[8px] text-slate-500">
                  ORÇAMENTO Nº {quote.quotePrefix}-{String(quote.number).padStart(4, '0')}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[8px] font-semibold text-slate-700">Cliente</p>
                <p className="max-w-24 truncate text-[8px] text-slate-500">{quote.clientName}</p>
                <p className="mt-1 text-[8px] font-semibold text-slate-700">Data de emissão</p>
                <p className="text-[8px] text-slate-500">{formatDate(quote.issueDate)}</p>
              </div>
            </div>

            <table className="mt-3 w-full border-collapse">
              <thead>
                <tr className="border-y border-slate-200 text-[7px] uppercase text-slate-500">
                  <th className="py-1 text-left font-semibold">Item</th>
                  <th className="py-1 text-left font-semibold">Descrição</th>
                  <th className="py-1 text-right font-semibold">Qtd.</th>
                  <th className="py-1 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.slice(0, 3).map((item, index) => (
                  <tr key={index} className="border-b border-slate-100 text-[7.5px] text-slate-700">
                    <td className="py-1">{index + 1}</td>
                    <td className="max-w-28 truncate py-1">{item.description}</td>
                    <td className="py-1 text-right">{item.quantity}</td>
                    <td className="py-1 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-2 flex items-center justify-between rounded bg-slate-100 px-2 py-1.5">
              <span className="text-[8px] font-semibold text-slate-600">Total</span>
              <span className="text-[9px] font-bold text-slate-900">
                {formatCurrency(quote.total)}
              </span>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
