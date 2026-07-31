'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { ClientInput } from '@/lib/validations/client';

interface ClientFormProps {
  clientId?: string;
  initialData?: Partial<ClientInput>;
}

const emptyForm: ClientInput = {
  type: 'PF',
  name: '',
  document: '',
  email: '',
  phone: '',
  whatsapp: '',
  addressStreet: '',
  addressNumber: '',
  addressComplement: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  notes: '',
};

export function ClientForm({ clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ClientInput>({ ...emptyForm, ...initialData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(clientId ? `/api/clients/${clientId}` : '/api/clients', {
      method: clientId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Não foi possível salvar o cliente.');
      return;
    }

    router.push('/dashboard/clients');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Tipo de cliente"
          value={form.type}
          onChange={(e) => update('type', e.target.value as ClientInput['type'])}
        >
          <option value="PF">Pessoa física</option>
          <option value="PJ">Pessoa jurídica</option>
        </Select>
        <Input
          className="sm:col-span-2"
          label={form.type === 'PF' ? 'Nome completo' : 'Razão social'}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label={form.type === 'PF' ? 'CPF' : 'CNPJ'}
          value={form.document || ''}
          onChange={(e) => update('document', e.target.value)}
        />
        <Input
          label="E-mail"
          type="email"
          value={form.email || ''}
          onChange={(e) => update('email', e.target.value)}
        />
        <Input
          label="Telefone"
          value={form.phone || ''}
          onChange={(e) => update('phone', e.target.value)}
        />
      </div>

      <Input
        label="WhatsApp"
        value={form.whatsapp || ''}
        onChange={(e) => update('whatsapp', e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Input
          className="sm:col-span-2"
          label="Endereço"
          value={form.addressStreet || ''}
          onChange={(e) => update('addressStreet', e.target.value)}
        />
        <Input
          label="Número"
          value={form.addressNumber || ''}
          onChange={(e) => update('addressNumber', e.target.value)}
        />
        <Input
          label="Complemento"
          value={form.addressComplement || ''}
          onChange={(e) => update('addressComplement', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Input
          label="Bairro"
          value={form.addressNeighborhood || ''}
          onChange={(e) => update('addressNeighborhood', e.target.value)}
        />
        <Input
          label="Cidade"
          value={form.addressCity || ''}
          onChange={(e) => update('addressCity', e.target.value)}
        />
        <Input
          label="Estado"
          value={form.addressState || ''}
          onChange={(e) => update('addressState', e.target.value)}
        />
        <Input
          label="CEP"
          value={form.addressZipCode || ''}
          onChange={(e) => update('addressZipCode', e.target.value)}
        />
      </div>

      <Textarea
        label="Observações"
        rows={3}
        value={form.notes || ''}
        onChange={(e) => update('notes', e.target.value)}
      />

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          Salvar cliente
        </Button>
      </div>
    </form>
  );
}
