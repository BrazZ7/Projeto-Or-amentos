'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { sendJson } from '@/lib/http';

export interface CreatedClient {
  id: string;
  name: string;
}

/**
 * Cadastro rápido de cliente, para não abandonar um orçamento pela metade só
 * para cadastrar quem vai recebê-lo.
 *
 * Pede apenas o que a validação exige (tipo e nome) mais contato, que é o que
 * o orçamento usa para chegar ao cliente. Endereço e dados fiscais ficam de
 * fora de propósito: são obrigatórios só na hora de emitir NF-e, e pedi-los
 * aqui transformaria um atalho num formulário tão longo quanto o original.
 */
export function QuickClientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (client: CreatedClient) => void;
}) {
  const [type, setType] = useState<'PF' | 'PJ'>('PJ');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fechar() {
    setError(null);
    onClose();
  }

  async function salvar() {
    setLoading(true);
    setError(null);

    const result = await sendJson<{ id: string; name: string }>(
      '/api/clients',
      'POST',
      {
        type,
        name: name.trim(),
        document: document.trim() || null,
        phone: phone.trim() || null,
        // O orçamento é enviado por WhatsApp: sem outro número, o telefone
        // serve para os dois.
        whatsapp: phone.trim() || null,
        email: email.trim(),
      },
      'Não foi possível cadastrar o cliente.',
    );
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onCreated({ id: result.data.id, name: result.data.name });
    setType('PJ');
    setName('');
    setDocument('');
    setPhone('');
    setEmail('');
    onClose();
  }

  return (
    <Modal open={open} onClose={fechar} title="Cadastrar cliente">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo"
            name="quickClientType"
            value={type}
            onChange={(e) => setType(e.target.value as 'PF' | 'PJ')}
          >
            <option value="PJ">Pessoa jurídica</option>
            <option value="PF">Pessoa física</option>
          </Select>
          <Input
            label={type === 'PJ' ? 'CNPJ' : 'CPF'}
            name="quickClientDocument"
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <Input
          label={type === 'PJ' ? 'Razão social ou nome fantasia' : 'Nome completo'}
          name="quickClientName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Telefone / WhatsApp"
            name="quickClientPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Opcional"
          />
          <Input
            label="E-mail"
            name="quickClientEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <p className="text-xs text-slate-500">
          Endereço e dados fiscais podem ser completados depois em Clientes — só são exigidos para
          emitir NF-e.
        </p>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={fechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} loading={loading} disabled={name.trim().length < 2}>
            Cadastrar e selecionar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
