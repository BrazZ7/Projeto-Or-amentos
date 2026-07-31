'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function PlanSubscribeButton({ planId, isCurrent }: { planId: string; isCurrent: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível iniciar o checkout.');
      return;
    }
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div>
      <Button
        variant={isCurrent ? 'outline' : 'primary'}
        className="w-full"
        onClick={handleClick}
        loading={loading}
        disabled={isCurrent}
      >
        {isCurrent ? 'Plano atual' : 'Assinar'}
      </Button>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
