'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  formatCurrency,
  formatDate,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
} from '@/lib/utils';

export interface QuoteRow {
  id: string;
  number: number;
  status: string;
  validUntil: string;
  total: number;
  client: { name: string };
}

export function QuotesTable({ quotes }: { quotes: QuoteRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return quotes.filter((quote) => {
      const matchesQuery =
        !query || quote.client.name.toLowerCase().includes(query.toLowerCase()) || String(quote.number).includes(query);
      const matchesStatus = !statusFilter || quote.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [quotes, query, statusFilter]);

  async function handleDelete(id: string) {
    if (!confirm('Excluir este orçamento? Essa ação não pode ser desfeita.')) return;
    setDeletingId(id);
    await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por cliente ou número..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          className="max-w-[180px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum orçamento encontrado"
          description="Crie seu primeiro orçamento para começar a enviar propostas profissionais."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="hidden px-4 py-3 sm:table-cell">Validade</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/quotes/${quote.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                      #{quote.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{quote.client.name}</td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                    {formatDate(quote.validUntil)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                      {QUOTE_STATUS_LABELS[quote.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(quote.id)}
                        disabled={deletingId === quote.id}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
