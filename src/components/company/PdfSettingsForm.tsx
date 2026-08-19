'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiTextActions } from '@/components/ui/AiTextActions';
import { cn } from '@/lib/utils';
import { PDF_TEMPLATE_OPTIONS } from '@/lib/pdf/template-options';
import type { PdfSettingsInput } from '@/lib/validations/company';
import { RoleGate, useRole } from '@/components/auth/RoleGate';

export function PdfSettingsForm({
  initialData,
  premiumAllowed,
}: {
  initialData: PdfSettingsInput;
  premiumAllowed: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PdfSettingsInput>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const canEdit = useRole().can('ADMIN');

  function update<K extends keyof PdfSettingsInput>(key: K, value: PdfSettingsInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/companies/pdf-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível salvar as configurações.');
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!canEdit && (
        <p className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
          <Lock className="h-4 w-4 shrink-0" />
          Você pode consultar, mas só administradores da conta alteram o modelo dos documentos.
        </p>
      )}

      <fieldset disabled={!canEdit} className="contents">
        <Card>
          <CardHeader>
            <CardTitle>Modelo de PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PDF_TEMPLATE_OPTIONS.map((tpl) => {
                const locked = tpl.premium && !premiumAllowed;
                const selected = form.pdfTemplate === tpl.value;
                return (
                  <button
                    type="button"
                    key={tpl.value}
                    disabled={locked}
                    aria-disabled={locked}
                    onClick={() => !locked && update('pdfTemplate', tpl.value)}
                    className={cn(
                      'relative rounded-xl border p-4 text-left transition-colors',
                      locked
                        ? 'cursor-not-allowed border-hairline bg-night-850 opacity-70'
                        : selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-hairline hover:border-slate-300',
                    )}
                  >
                    {selected && !locked && (
                      <Check className="absolute right-3 top-3 h-4 w-4 text-brand-600" />
                    )}
                    {locked && <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />}
                    <p className={cn('font-medium', locked ? 'text-slate-400' : 'text-slate-100')}>
                      {tpl.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{tpl.description}</p>
                    {locked && (
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-amber-600">
                        Plano Starter
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {!premiumAllowed && (
              <p className="mt-4 text-sm text-slate-400">
                Os modelos Executivo, Lateral e Catálogo fazem parte dos planos com identidade visual
                personalizada.{' '}
                <Link href="/dashboard/settings/plan" className="font-medium text-brand-600 hover:underline">
                  Ver planos
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Posição da logomarca"
              name="logoPosition"
              value={form.logoPosition}
              onChange={(e) => update('logoPosition', e.target.value as PdfSettingsInput['logoPosition'])}
            >
              <option value="LEFT">Esquerda</option>
              <option value="CENTER">Centro</option>
              <option value="RIGHT">Direita</option>
            </Select>
            <Input
              label="Prefixo do número do orçamento"
              name="quotePrefix"
              value={form.quotePrefix || ''}
              onChange={(e) => update('quotePrefix', e.target.value)}
              placeholder="Ex: ORC"
            />
            <Input
              label="Texto de cabeçalho"
              name="headerText"
              value={form.headerText || ''}
              onChange={(e) => update('headerText', e.target.value)}
            />
            <Input
              label="Texto de rodapé"
              name="footerText"
              value={form.footerText || ''}
              onChange={(e) => update('footerText', e.target.value)}
            />
            <Input
              label="Validade padrão (dias)"
              name="defaultValidityDays"
              type="number"
              min={1}
              value={form.defaultValidityDays ?? 15}
              onChange={(e) => update('defaultValidityDays', Number(e.target.value))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Textos padrão dos orçamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Condições de pagamento</label>
                <AiTextActions
                  text={form.defaultPaymentTerms || ''}
                  onResult={(r) => update('defaultPaymentTerms', r)}
                />
              </div>
              <Textarea
                name="defaultPaymentTerms"
                rows={2}
                value={form.defaultPaymentTerms || ''}
                onChange={(e) => update('defaultPaymentTerms', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Prazo de entrega
              </label>
              <Input
                name="defaultDeliveryTerms"
                value={form.defaultDeliveryTerms || ''}
                onChange={(e) => update('defaultDeliveryTerms', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Garantia</label>
              <Input
                name="defaultWarranty"
                value={form.defaultWarranty || ''}
                onChange={(e) => update('defaultWarranty', e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">Observações comerciais</label>
                <AiTextActions
                  text={form.defaultNotes || ''}
                  onResult={(r) => update('defaultNotes', r)}
                />
              </div>
              <Textarea
                name="defaultNotes"
                rows={3}
                value={form.defaultNotes || ''}
                onChange={(e) => update('defaultNotes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

      </fieldset>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Configurações salvas com sucesso.</p>}

      <RoleGate minimum="ADMIN">
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Salvar configurações
          </Button>
        </div>
      </RoleGate>
    </form>
  );
}
