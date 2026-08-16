'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck2, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface InvoiceSummary {
  id: string;
  status: string;
  number: number;
  series: number;
  environment: string;
  accessKey: string | null;
  danfeUrl: string | null;
  xmlUrl: string | null;
  rejectionCode: string | null;
  rejectionMessage: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando na SEFAZ',
  AUTHORIZED: 'Autorizada',
  REJECTED: 'Rejeitada',
  CANCELED: 'Cancelada',
  ERROR: 'Erro de comunicação',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-300',
  PROCESSING: 'bg-amber-100 text-amber-700',
  AUTHORIZED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELED: 'bg-slate-200 text-slate-400',
  ERROR: 'bg-rose-100 text-rose-700',
};

export function InvoiceActions({
  quoteId,
  quoteStatus,
  invoice,
}: {
  quoteId: string;
  quoteStatus: string;
  invoice: InvoiceSummary | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);

  async function handleIssue() {
    setLoading(true);
    setError(null);
    setMissing([]);

    const res = await fetch(`/api/quotes/${quoteId}/invoice`, { method: 'POST' });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível emitir a NF-e.');
      // A API devolve a lista de campos fiscais faltando; mostrá-la evita o
      // usuário ter que caçar o que está incompleto.
      setMissing(Array.isArray(data.missing) ? data.missing : []);
      return;
    }
    router.refresh();
  }

  async function handleRefresh() {
    if (!invoice) return;
    setLoading(true);
    await fetch(`/api/invoices/${invoice.id}`);
    setLoading(false);
    router.refresh();
  }

  const canIssue =
    quoteStatus === 'APPROVED' &&
    (!invoice || ['REJECTED', 'CANCELED', 'ERROR'].includes(invoice.status));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {invoice && (
          <Badge className={STATUS_COLORS[invoice.status] || 'bg-slate-100 text-slate-300'}>
            NF-e {invoice.number}/{invoice.series} · {STATUS_LABELS[invoice.status] || invoice.status}
          </Badge>
        )}

        {invoice?.environment === 'HOMOLOGACAO' && (
          <Badge className="bg-amber-100 text-amber-700">Homologação — sem valor fiscal</Badge>
        )}

        {canIssue && (
          <Button size="sm" onClick={handleIssue} loading={loading}>
            <FileCheck2 className="h-4 w-4" />
            {invoice ? 'Emitir novamente' : 'Emitir NF-e'}
          </Button>
        )}

        {invoice?.status === 'PROCESSING' && (
          <Button variant="outline" size="sm" onClick={handleRefresh} loading={loading}>
            <RefreshCw className="h-4 w-4" />
            Consultar retorno
          </Button>
        )}

        {invoice?.danfeUrl && (
          <a href={invoice.danfeUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              DANFE
            </Button>
          </a>
        )}
        {invoice?.xmlUrl && (
          <a href={invoice.xmlUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              XML
            </Button>
          </a>
        )}
      </div>

      {invoice?.accessKey && (
        <p className="break-all font-mono text-xs text-slate-400">
          Chave de acesso: {invoice.accessKey}
        </p>
      )}

      {invoice?.rejectionMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
          <p className="text-sm font-medium text-rose-700">
            {invoice.rejectionCode ? `Rejeição ${invoice.rejectionCode}` : 'Falha na emissão'}
          </p>
          <p className="mt-1 text-sm text-rose-600">{invoice.rejectionMessage}</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
          {missing.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm text-amber-700">
              {missing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
