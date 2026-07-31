'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { CompanyInput } from '@/lib/validations/company';

export function CompanyForm({ initialData }: { initialData: CompanyInput }) {
  const router = useRouter();
  const [form, setForm] = useState<CompanyInput>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof CompanyInput>(key: K, value: CompanyInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch('/api/companies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível salvar os dados da empresa.');
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados fiscais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Razão social"
            name="legalName"
            value={form.legalName}
            onChange={(e) => update('legalName', e.target.value)}
            required
          />
          <Input
            label="Nome fantasia"
            name="tradeName"
            value={form.tradeName || ''}
            onChange={(e) => update('tradeName', e.target.value)}
          />
          <Select
            label="Tipo de documento"
            name="documentType"
            value={form.documentType}
            onChange={(e) => update('documentType', e.target.value as CompanyInput['documentType'])}
          >
            <option value="CNPJ">CNPJ</option>
            <option value="CPF">CPF</option>
          </Select>
          <Input
            label="CPF/CNPJ"
            name="document"
            value={form.document}
            onChange={(e) => update('document', e.target.value)}
            required
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Input
            label="E-mail"
            name="email"
            type="email"
            value={form.email || ''}
            onChange={(e) => update('email', e.target.value)}
          />
          <Input
            label="Telefone"
            name="phone"
            value={form.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
          />
          <Input
            label="WhatsApp"
            name="whatsapp"
            value={form.whatsapp || ''}
            onChange={(e) => update('whatsapp', e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <Input
            className="sm:col-span-2"
            label="Endereço"
            name="addressStreet"
            value={form.addressStreet || ''}
            onChange={(e) => update('addressStreet', e.target.value)}
          />
          <Input
            label="Número"
            name="addressNumber"
            value={form.addressNumber || ''}
            onChange={(e) => update('addressNumber', e.target.value)}
          />
          <Input
            label="Complemento"
            name="addressComplement"
            value={form.addressComplement || ''}
            onChange={(e) => update('addressComplement', e.target.value)}
          />
          <Input
            label="Bairro"
            name="addressNeighborhood"
            value={form.addressNeighborhood || ''}
            onChange={(e) => update('addressNeighborhood', e.target.value)}
          />
          <Input
            label="Cidade"
            name="addressCity"
            value={form.addressCity || ''}
            onChange={(e) => update('addressCity', e.target.value)}
          />
          <Input
            label="Estado"
            name="addressState"
            value={form.addressState || ''}
            onChange={(e) => update('addressState', e.target.value)}
          />
          <Input
            label="CEP"
            name="addressZipCode"
            value={form.addressZipCode || ''}
            onChange={(e) => update('addressZipCode', e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identidade visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6">
            <ImageUpload
              label="Logotipo"
              value={form.logoUrl}
              onChange={(url) => update('logoUrl', url)}
            />
            <ImageUpload
              label="Assinatura"
              value={form.signatureUrl}
              onChange={(url) => update('signatureUrl', url)}
              aspect="wide"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Cor primária
              </label>
              <input
                type="color"
                value={form.primaryColor || '#4a54e1'}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Cor secundária
              </label>
              <input
                type="color"
                value={form.secondaryColor || '#1e293b'}
                onChange={(e) => update('secondaryColor', e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-300"
              />
            </div>
            <Select
              label="Fonte do PDF"
              name="fontFamily"
              value={form.fontFamily || 'Helvetica'}
              onChange={(e) => update('fontFamily', e.target.value)}
            >
              <option value="Helvetica">Helvetica</option>
              <option value="Times-Roman">Times New Roman</option>
              <option value="Courier">Courier</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados para pagamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Banco"
            name="bankName"
            value={form.bankName || ''}
            onChange={(e) => update('bankName', e.target.value)}
          />
          <Input
            label="Agência"
            name="bankAgency"
            value={form.bankAgency || ''}
            onChange={(e) => update('bankAgency', e.target.value)}
          />
          <Input
            label="Conta"
            name="bankAccount"
            value={form.bankAccount || ''}
            onChange={(e) => update('bankAccount', e.target.value)}
          />
          <Input
            label="Chave PIX"
            name="pixKey"
            value={form.pixKey || ''}
            onChange={(e) => update('pixKey', e.target.value)}
          />
          <Textarea
            className="sm:col-span-2"
            label="Observações de pagamento"
            name="paymentNotes"
            rows={2}
            value={form.paymentNotes || ''}
            onChange={(e) => update('paymentNotes', e.target.value)}
          />
        </CardContent>
      </Card>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">Dados salvos com sucesso.</p>}

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
