'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Mail, MessageCircle, Link2, Ban, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QuoteActionsProps {
  quoteId: string;
  publicToken: string;
  status: string;
  clientEmail: string | null;
  clientWhatsapp: string | null;
  total: string;
}

export function QuoteActions({
  quoteId,
  publicToken,
  status,
  clientEmail,
  clientWhatsapp,
  total,
}: QuoteActionsProps) {
  const router = useRouter();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/orcamento/${publicToken}`
      : `/orcamento/${publicToken}`;

  async function handleSendEmail() {
    setSendingEmail(true);
    setMessage(null);
    const res = await fetch(`/api/quotes/${quoteId}/send-email`, { method: 'POST' });
    const data = await res.json();
    setSendingEmail(false);

    if (!res.ok) {
      setMessage(data.error || 'Não foi possível enviar o e-mail.');
      return;
    }
    setMessage('E-mail enviado com sucesso.');
    router.refresh();
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function updateStatus(newStatus: 'SENT' | 'CANCELED') {
    if (newStatus === 'CANCELED' && !confirm('Cancelar este orçamento?')) return;
    setUpdatingStatus(true);
    await fetch(`/api/quotes/${quoteId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingStatus(false);
    router.refresh();
  }

  const whatsappDigits = clientWhatsapp?.replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(
    `Olá! Segue o orçamento no valor de ${total}: ${publicUrl}`,
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <a href={`/api/quotes/${quoteId}/pdf`} target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </a>
        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? 'Link copiado' : 'Copiar link público'}
        </Button>
        {whatsappDigits && (
          <a
            href={`https://wa.me/55${whatsappDigits}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </a>
        )}
        {clientEmail && (
          <Button variant="outline" size="sm" onClick={handleSendEmail} loading={sendingEmail}>
            <Mail className="h-4 w-4" />
            Enviar por e-mail
          </Button>
        )}
        {status === 'DRAFT' && (
          <Button size="sm" onClick={() => updateStatus('SENT')} loading={updatingStatus}>
            <Send className="h-4 w-4" />
            Marcar como enviado
          </Button>
        )}
        {!['CANCELED', 'APPROVED', 'REJECTED'].includes(status) && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => updateStatus('CANCELED')}
            loading={updatingStatus}
          >
            <Ban className="h-4 w-4" />
            Cancelar
          </Button>
        )}
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
