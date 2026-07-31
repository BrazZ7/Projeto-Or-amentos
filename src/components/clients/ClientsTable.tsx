'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDocument } from '@/lib/utils';

export interface ClientRow {
  id: string;
  name: string;
  type: 'PF' | 'PJ';
  document: string | null;
  email: string | null;
  phone: string | null;
}

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.document?.includes(q),
    );
  }, [clients, query]);

  async function handleDelete(id: string) {
    if (!confirm('Excluir este cliente? Essa ação não pode ser desfeita.')) return;
    setDeletingId(id);
    await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por nome, e-mail ou documento..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum cliente encontrado"
          description="Cadastre clientes pessoa física ou jurídica para vincular aos orçamentos."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="hidden px-4 py-3 sm:table-cell">Documento</th>
                <th className="hidden px-4 py-3 md:table-cell">Contato</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <p className="text-xs text-slate-500">
                      {client.type === 'PF' ? 'Pessoa física' : 'Pessoa jurídica'}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                    {formatDocument(client.document)}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    {client.email || client.phone || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(client.id)}
                        disabled={deletingId === client.id}
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
