'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AiGeneratedQuote } from '@/lib/ai';

export function AiQuoteBuilder({ onGenerated }: { onGenerated: (result: AiGeneratedQuote) => void }) {
  const [requestText, setRequestText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!requestText.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch('/api/ai/generate-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: requestText }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Não foi possível montar o orçamento com IA.');
      return;
    }
    onGenerated(data);
  }

  return (
    <Card className="border-brand-200 bg-brand-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          Montar orçamento com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400">
          Descreva o que o cliente pediu e a IA monta um rascunho com os itens, valores estimados e
          condições — depois é só revisar e ajustar.
        </p>
        <Textarea
          name="aiRequestText"
          rows={3}
          placeholder="Ex: Orçamento para pintura de uma sala de 20m², tinta acrílica, com prazo de 5 dias úteis."
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button type="button" onClick={handleGenerate} loading={loading} disabled={!requestText.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Gerar rascunho
        </Button>
      </CardContent>
    </Card>
  );
}
