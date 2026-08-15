'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiTextActions } from '@/components/ui/AiTextActions';
import { QuoteItemsEditor, type ProductOption } from '@/components/quotes/QuoteItemsEditor';
import { AiQuoteBuilder } from '@/components/quotes/AiQuoteBuilder';
import { calculateQuoteTotals } from '@/lib/calculations';
import { PDF_TEMPLATE_OPTIONS } from '@/lib/pdf/template-options';
import { formatCurrency } from '@/lib/utils';
import type { QuoteInput } from '@/lib/validations/quote';
import type { AiGeneratedQuote } from '@/lib/ai';

export interface ClientOption {
  id: string;
  name: string;
}

interface QuoteFormProps {
  quoteId?: string;
  initialData: QuoteInput;
  clients: ClientOption[];
  products: ProductOption[];
  premiumAllowed: boolean;
}

export function QuoteForm({
  quoteId,
  initialData,
  clients,
  products,
  premiumAllowed,
}: QuoteFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<QuoteInput>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const totals = useMemo(
    () =>
      calculateQuoteTotals({
        items: form.items,
        discountType: form.discountType,
        discountValue: form.discountValue,
        freight: form.freight,
      }),
    [form.items, form.discountType, form.discountValue, form.freight],
  );

  function applyAiResult(result: AiGeneratedQuote) {
    update('items', [
      ...form.items,
      ...result.items.map((item) => ({
        productId: null,
        description: item.description,
        imageUrl: null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
      })),
    ]);
    if (result.paymentTerms) update('paymentTerms', result.paymentTerms);
    if (result.deliveryTerms) update('deliveryTerms', result.deliveryTerms);
    if (result.warranty) update('warranty', result.warranty);
    if (result.notes) update('notes', result.notes);

    if (result.clientName) {
      const match = clients.find((c) =>
        c.name.toLowerCase().includes(result.clientName!.toLowerCase()),
      );
      if (match) update('clientId', match.id);
    }
  }

  async function handleSubmit(e: React.FormEvent, statusOverride?: QuoteInput['status']) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { ...form, status: statusOverride || form.status };

    const res = await fetch(quoteId ? `/api/quotes/${quoteId}` : '/api/quotes', {
      method: quoteId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Não foi possível salvar o orçamento.');
      return;
    }

    const saved = await res.json();
    router.push(`/dashboard/quotes/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      {!quoteId && <AiQuoteBuilder onGenerated={applyAiResult} />}

      <Card>
        <CardHeader>
          <CardTitle>Dados do orçamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Select
            className="sm:col-span-1"
            label="Cliente"
            name="clientId"
            value={form.clientId}
            onChange={(e) => update('clientId', e.target.value)}
            required
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
          <Input
            label="Data de emissão"
            name="issueDate"
            type="date"
            value={form.issueDate}
            onChange={(e) => update('issueDate', e.target.value)}
            required
          />
          <Input
            label="Válido até"
            name="validUntil"
            type="date"
            value={form.validUntil}
            onChange={(e) => update('validUntil', e.target.value)}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteItemsEditor
            items={form.items}
            products={products}
            onChange={(items) => update('items', items)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Tipo de desconto"
              name="discountType"
              value={form.discountType}
              onChange={(e) => update('discountType', e.target.value as QuoteInput['discountType'])}
            >
              <option value="PERCENT">Percentual (%)</option>
              <option value="FIXED">Valor fixo (R$)</option>
            </Select>
            <Input
              label="Desconto"
              name="discountValue"
              type="number"
              min={0}
              step="0.01"
              value={form.discountValue}
              onChange={(e) => update('discountValue', Number(e.target.value))}
            />
            <Input
              label="Frete"
              name="freight"
              type="number"
              min={0}
              step="0.01"
              value={form.freight}
              onChange={(e) => update('freight', Number(e.target.value))}
            />
          </div>

          <div className="ml-auto w-full max-w-xs space-y-1 rounded-xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Desconto</span>
              <span>- {formatCurrency(totals.discountAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <span>{formatCurrency(totals.freight)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condições comerciais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Condições de pagamento</label>
              <AiTextActions
                text={form.paymentTerms || ''}
                onResult={(r) => update('paymentTerms', r)}
              />
            </div>
            <Textarea
              name="paymentTerms"
              rows={2}
              value={form.paymentTerms || ''}
              onChange={(e) => update('paymentTerms', e.target.value)}
            />
          </div>
          <Input
            label="Prazo de entrega"
            name="deliveryTerms"
            value={form.deliveryTerms || ''}
            onChange={(e) => update('deliveryTerms', e.target.value)}
          />
          <Input
            label="Garantia"
            name="warranty"
            value={form.warranty || ''}
            onChange={(e) => update('warranty', e.target.value)}
          />
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Observações</label>
              <AiTextActions text={form.notes || ''} onResult={(r) => update('notes', r)} />
            </div>
            <Textarea
              name="notes"
              rows={3}
              value={form.notes || ''}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
          <Select
            label="Modelo de PDF"
            name="template"
            value={form.template}
            onChange={(e) => update('template', e.target.value as QuoteInput['template'])}
          >
            {PDF_TEMPLATE_OPTIONS.map((tpl) => {
              // O modelo já salvo no orçamento continua selecionável mesmo que
              // hoje seja bloqueado, senão o select perderia o valor atual.
              const locked = tpl.premium && !premiumAllowed && tpl.value !== initialData.template;
              return (
                <option key={tpl.value} value={tpl.value} disabled={locked}>
                  {tpl.label}
                  {locked ? ' (plano Starter)' : ''}
                </option>
              );
            })}
          </Select>
          {!premiumAllowed && (
            <p className="text-xs text-slate-500">
              Modelos Executivo, Lateral e Catálogo exigem um plano com identidade visual
              personalizada.{' '}
              <Link href="/dashboard/settings/plan" className="font-medium text-brand-600 hover:underline">
                Ver planos
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={loading}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, 'DRAFT')}
        >
          Salvar rascunho
        </Button>
        <Button type="submit" loading={loading}>
          <Sparkles className="h-4 w-4" />
          Salvar orçamento
        </Button>
      </div>
    </form>
  );
}
