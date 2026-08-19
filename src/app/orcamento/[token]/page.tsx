'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Download,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  formatCurrency,
  formatDate,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
} from '@/lib/utils';

interface PublicQuote {
  number: number;
  quotePrefix: string;
  status: string;
  issueDate: string;
  validUntil: string;
  subtotal: number;
  discountType: string;
  discountValue: number;
  freight: number;
  total: number;
  paymentTerms: string | null;
  deliveryTerms: string | null;
  warranty: string | null;
  notes: string | null;
  items: {
    description: string;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  client: { name: string };
  company: {
    legalName: string;
    tradeName: string | null;
    logoUrl: string | null;
    primaryColor: string;
    whatsapp: string | null;
    email: string | null;
    phone: string | null;
  };
}

export default function PublicQuotePage() {
  const params = useParams<{ token: string }>();
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<'APPROVE' | 'REJECT' | null>(null);

  useEffect(() => {
    fetch(`/api/public/quotes/${params.token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setQuote(data);
      })
      .catch((err) => setError(err.message || 'Não foi possível carregar o orçamento.'));
  }, [params.token]);

  async function handleDecision(decision: 'APPROVE' | 'REJECT') {
    if (!quote) return;
    const label = decision === 'APPROVE' ? 'aprovar' : 'recusar';
    if (!confirm(`Tem certeza que deseja ${label} este orçamento?`)) return;

    setDeciding(decision);
    const res = await fetch(`/api/public/quotes/${params.token}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    const data = await res.json();
    setDeciding(null);

    if (!res.ok) {
      alert(data.error || 'Não foi possível registrar sua decisão.');
      return;
    }
    setQuote((prev) => (prev ? { ...prev, status: data.status } : prev));
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
        <div className="text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const decidable = ['SENT', 'VIEWED'].includes(quote.status);
  const whatsappNumber = quote.company.whatsapp?.replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(
    `Olá! Segue o orçamento ${quote.quotePrefix}-${String(quote.number).padStart(4, '0')} no valor de ${formatCurrency(quote.total)}: ${typeof window !== 'undefined' ? window.location.href : ''}`,
  );

  return (
    <div className="min-h-screen bg-surface-muted py-8">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {quote.company.logoUrl && (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white">
                <Image src={quote.company.logoUrl} alt={quote.company.legalName} fill className="object-contain" />
              </div>
            )}
            <span className="font-semibold text-slate-900">
              {quote.company.tradeName || quote.company.legalName}
            </span>
          </div>
          <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
            {QUOTE_STATUS_LABELS[quote.status]}
          </Badge>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">Orçamento</p>
              <p className="text-xl font-semibold text-slate-900">
                {quote.quotePrefix}-{String(quote.number).padStart(4, '0')}
              </p>
              <p className="mt-1 text-sm text-slate-500">Para {quote.client.name}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Emitido em {formatDate(quote.issueDate)}</p>
              <p>Válido até {formatDate(quote.validUntil)}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {quote.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={item.imageUrl} alt={item.description} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.description}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 ml-auto w-full max-w-xs space-y-1 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Desconto</span>
              <span>
                -{' '}
                {formatCurrency(
                  quote.discountType === 'PERCENT'
                    ? (quote.subtotal * quote.discountValue) / 100
                    : quote.discountValue,
                )}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <span>{formatCurrency(quote.freight)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span style={{ color: quote.company.primaryColor }}>{formatCurrency(quote.total)}</span>
            </div>
          </div>

          {(quote.paymentTerms || quote.deliveryTerms || quote.warranty || quote.notes) && (
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm">
              {quote.paymentTerms && (
                <p>
                  <span className="font-medium text-slate-700">Pagamento: </span>
                  <span className="text-slate-600">{quote.paymentTerms}</span>
                </p>
              )}
              {quote.deliveryTerms && (
                <p>
                  <span className="font-medium text-slate-700">Entrega: </span>
                  <span className="text-slate-600">{quote.deliveryTerms}</span>
                </p>
              )}
              {quote.warranty && (
                <p>
                  <span className="font-medium text-slate-700">Garantia: </span>
                  <span className="text-slate-600">{quote.warranty}</span>
                </p>
              )}
              {quote.notes && (
                <p>
                  <span className="font-medium text-slate-700">Observações: </span>
                  <span className="text-slate-600">{quote.notes}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`/api/public/quotes/${params.token}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </a>
          {whatsappNumber && (
            <a
              href={`https://wa.me/55${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">
                <MessageCircle className="h-4 w-4" />
                Compartilhar no WhatsApp
              </Button>
            </a>
          )}
          {decidable && (
            <>
              <Button
                variant="danger"
                loading={deciding === 'REJECT'}
                onClick={() => handleDecision('REJECT')}
              >
                <XCircle className="h-4 w-4" />
                Recusar
              </Button>
              <Button
                loading={deciding === 'APPROVE'}
                onClick={() => handleDecision('APPROVE')}
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar orçamento
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
