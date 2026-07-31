'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyLegalName: '',
    documentType: 'CNPJ',
    document: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível concluir o cadastro.');
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Confira seu e-mail</h2>
        <p className="mt-3 text-sm text-slate-500">
          Enviamos um link de confirmação para <strong>{form.email}</strong>. Clique nele para
          ativar sua conta e fazer login.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Criar conta grátis</h2>
      <p className="mt-1 text-sm text-slate-500">Comece a criar orçamentos profissionais hoje.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Razão social da empresa"
          name="companyLegalName"
          value={form.companyLegalName}
          onChange={(e) => update('companyLegalName', e.target.value)}
          required
        />
        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Tipo"
            name="documentType"
            value={form.documentType}
            onChange={(e) => update('documentType', e.target.value)}
            className="col-span-1"
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
            className="col-span-2"
          />
        </div>
        <Input
          label="Seu nome"
          name="name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          hint="Mínimo de 8 caracteres."
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          required
          minLength={8}
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
