import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency, formatDate, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '@/lib/utils';

export interface RecentQuoteRow {
  id: string;
  number: number;
  quotePrefix: string;
  clientName: string;
  issueDate: Date;
  status: string;
  total: number;
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-400 to-amber-500',
  'from-pink-500 to-rose-500',
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function RecentQuotesTable({ quotes }: { quotes: RecentQuoteRow[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-semibold text-slate-100">Orçamentos recentes</h2>
        <Link
          href="/dashboard/quotes"
          className="flex items-center gap-0.5 text-xs font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          Ver todos <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {quotes.length === 0 ? (
        <p className="px-5 pb-8 pt-2 text-center text-sm text-slate-400">
          Nenhum orçamento criado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-y border-hairline px-2 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-3 font-medium">Nº do orçamento</th>
                <th className="px-3 py-3 font-medium">Cliente</th>
                <th className="px-3 py-3 font-medium">Data</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {quotes.map((quote, index) => (
                <tr key={quote.id} className="group transition-colors hover:bg-white/[0.03]">
                  <td className="px-3 py-3.5">
                    <Link
                      href={`/dashboard/quotes/${quote.id}`}
                      className="text-sm font-medium text-slate-200 transition-colors group-hover:text-brand-300"
                    >
                      {quote.quotePrefix}-{new Date(quote.issueDate).getFullYear()}-
                      {String(quote.number).padStart(4, '0')}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-semibold text-white',
                          AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                        )}
                      >
                        {initials(quote.clientName)}
                      </span>
                      <span className="truncate text-sm text-slate-300">{quote.clientName}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-sm text-slate-400">
                    {formatDate(quote.issueDate)}
                  </td>
                  <td className="px-3 py-3.5">
                    <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                      {QUOTE_STATUS_LABELS[quote.status] || quote.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right text-sm font-semibold text-slate-100">
                    {formatCurrency(quote.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
