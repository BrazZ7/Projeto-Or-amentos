'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Eye, Download, Link2, Check } from 'lucide-react';

/** Menu de ações da linha da tabela — o "⋮" do mockup. */
export function QuoteRowMenu({ quoteId, publicToken }: { quoteId: string; publicToken: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/orcamento/${publicToken}`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1200);
  }

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ações do orçamento"
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="panel absolute right-0 top-full z-30 mt-1 w-48 animate-scale-in overflow-hidden p-0">
          <Link
            href={`/dashboard/quotes/${quoteId}`}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <Eye className="h-4 w-4 text-slate-500" />
            Abrir orçamento
          </Link>
          <a
            href={`/api/quotes/${quoteId}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Baixar PDF
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Link2 className="h-4 w-4 text-slate-500" />
            )}
            {copied ? 'Link copiado' : 'Copiar link público'}
          </button>
        </div>
      )}
    </div>
  );
}
