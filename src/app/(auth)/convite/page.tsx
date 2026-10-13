'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { requestJson, sendJson } from '@/lib/http';

interface Convite {
  email: string;
  role: string;
  empresa: string;
}

/**
 * Aceite de convite. Quem chega aqui define o próprio nome e a própria senha —
 * ninguém combina senha por fora, e o convite morre ao ser usado.
 */
function AceitarConvite() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';

  const [convite, setConvite] = useState<Convite | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErro('Link de convite inválido.');
      setCarregando(false);
      return;
    }
    requestJson<Convite>(`/api/team/accept?token=${encodeURIComponent(token)}`).then((res) => {
      if (res.ok) setConvite(res.data);
      else setErro(res.error);
      setCarregando(false);
    });
  }, [token]);

  async function aceitar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    const res = await sendJson('/api/team/accept', 'POST', { token, name, password }, 'Não foi possível aceitar o convite.');

    if (!res.ok) {
      setEnviando(false);
      setErro(res.error);
      return;
    }

    // Entra direto: pedir login logo depois de criar a senha é atrito à toa.
    const login = await signIn('credentials', {
      email: convite!.email,
      password,
      redirect: false,
    });
    setEnviando(false);

    if (login?.error) {
      router.push('/login');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  if (carregando) {
    return <p className="text-sm text-slate-400">Verificando convite...</p>;
  }

  if (!convite) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Convite indisponível</h2>
        <p className="mt-3 text-sm text-slate-400">{erro}</p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-400 hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-100">Entrar na equipe</h2>
      <p className="mt-1 text-sm text-slate-400">
        Você foi convidado para acessar <span className="text-slate-200">{convite.empresa}</span>.
      </p>

      <form onSubmit={aceitar} className="mt-6 space-y-4">
        <Input label="E-mail" name="email" value={convite.email} disabled readOnly />
        <Input
          label="Seu nome"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Crie uma senha"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          hint="Mínimo de 8 caracteres."
        />

        {erro && <p className="text-sm text-rose-400">{erro}</p>}

        <Button type="submit" loading={enviando} className="w-full">
          Aceitar e entrar
        </Button>
      </form>
    </div>
  );
}

export default function ConvitePage() {
  return (
    <Suspense>
      <AceitarConvite />
    </Suspense>
  );
}
