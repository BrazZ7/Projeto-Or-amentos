'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  // Escape fecha. Sem isto o único jeito de sair é achar o X ou o Cancelar, e
  // quem abriu o modal por engano fica procurando.
  // Clique no fundo não fecha de propósito: estes modais contêm formulário, e
  // um clique fora perdido apagaria o que foi digitado sem confirmação.
  useEffect(() => {
    if (!open) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-start justify-center overflow-y-auto bg-night-950/80 p-4 pt-10 backdrop-blur-sm sm:pt-16">
      <div className={`glass-strong w-full ${maxWidth} animate-scale-in rounded-2xl`}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
