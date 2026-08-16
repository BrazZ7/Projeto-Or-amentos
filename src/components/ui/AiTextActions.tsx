'use client';

import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import type { TextAiAction } from '@/lib/ai';

const actionLabels: Record<TextAiAction, string> = {
  improve: 'Melhorar texto',
  fix: 'Corrigir texto',
  professional: 'Deixar mais profissional',
  summarize: 'Resumir',
};

/**
 * Menu de ações de IA para um campo de texto: melhora, corrige, deixa mais
 * profissional ou resume o conteúdo atual, substituindo-o pelo resultado.
 */
export function AiTextActions({
  text,
  onResult,
  disabled,
}: {
  text: string;
  onResult: (result: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<TextAiAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: TextAiAction) {
    setOpen(false);
    setLoading(action);
    setError(null);

    const res = await fetch('/api/ai/transform-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, text }),
    });
    const data = await res.json();
    setLoading(null);

    if (!res.ok) {
      setError(data.error || 'Não foi possível usar a IA agora.');
      return;
    }
    onResult(data.result);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        disabled={disabled || !text.trim() || loading !== null}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        IA
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-hairline bg-night-800 py-1 shadow-lg">
          {(Object.keys(actionLabels) as TextAiAction[]).map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => run(action)}
              className="block w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-night-850"
            >
              {actionLabels[action]}
            </button>
          ))}
        </div>
      )}
      {error && <p className="absolute mt-1 w-48 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
