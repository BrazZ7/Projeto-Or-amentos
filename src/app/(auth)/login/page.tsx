'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    router.push(params.get('callbackUrl') || '/dashboard');
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-100">Entrar</h2>
      <p className="mt-1 text-sm text-slate-400">Acesse o painel da sua empresa.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="E-mail"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm text-brand-400 hover:underline">
            Esqueceu a senha?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Ainda não tem conta?{' '}
        <Link href="/register" className="font-medium text-brand-400 hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
