'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
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

    if (!res.ok) {
      setLoading(false);
      setError(data.error || 'Não foi possível concluir o cadastro.');
      return;
    }

    // Sem etapa de confirmação por e-mail por enquanto: loga direto após o
    // cadastro e manda para o painel.
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Conta criada, mas não foi possível entrar automaticamente. Faça login.');
      router.push('/login');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-100">Criar conta grátis</h2>
      <p className="mt-1 text-sm text-slate-400">Comece a criar orçamentos profissionais hoje.</p>

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

      <p className="mt-6 text-center text-sm text-slate-400">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
