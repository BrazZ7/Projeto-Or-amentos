import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number | string) {
  const num = typeof value === 'string' ? Number(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('pt-BR');
}

/** "há 2 horas", "há 5 dias" — usado no feed de atividades. */
export function formatRelativeTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  const units: [number, string, string][] = [
    [60, 'minuto', 'minutos'],
    [3600, 'hora', 'horas'],
    [86400, 'dia', 'dias'],
    [2592000, 'mês', 'meses'],
  ];

  if (seconds < 60) return 'agora mesmo';

  for (let i = 0; i < units.length; i += 1) {
    const [threshold, singular, plural] = units[i];
    const next = units[i + 1]?.[0];
    if (!next || seconds < next) {
      const amount = Math.floor(seconds / threshold);
      return `há ${amount} ${amount === 1 ? singular : plural}`;
    }
  }

  return formatDate(date);
}

export function formatDocument(document: string | null | undefined) {
  if (!document) return '';
  const digits = document.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return document;
}

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  VIEWED: 'Visualizado',
  APPROVED: 'Aprovado',
  REJECTED: 'Recusado',
  EXPIRED: 'Vencido',
  CANCELED: 'Cancelado',
};

// Pílulas de status no tema escuro: fundo translúcido da própria cor, texto
// claro e um anel de 1px. Fundo sólido claro (bg-*-100) queimaria a tela.
export const QUOTE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-300 ring-1 ring-inset ring-slate-400/25',
  SENT: 'bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30',
  VIEWED: 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/30',
  REJECTED: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/30',
  EXPIRED: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30',
  CANCELED: 'bg-slate-600/20 text-slate-400 ring-1 ring-inset ring-slate-500/25',
};
