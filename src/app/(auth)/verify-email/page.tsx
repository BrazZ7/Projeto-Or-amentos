'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação ausente.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Não foi possível confirmar o e-mail.');
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-600" />
          <p className="mt-4 text-sm text-slate-400">Confirmando seu e-mail...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-4 text-xl font-semibold text-slate-100">E-mail confirmado!</h2>
          <p className="mt-2 text-sm text-slate-400">Sua conta está ativa. Você já pode entrar.</p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
            Ir para o login
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="mx-auto h-10 w-10 text-rose-600" />
          <h2 className="mt-4 text-xl font-semibold text-slate-100">Não foi possível confirmar</h2>
          <p className="mt-2 text-sm text-slate-400">{message}</p>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
