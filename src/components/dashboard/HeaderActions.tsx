import { Calendar, ChevronDown, Bell } from 'lucide-react';

/**
 * Ações visuais do cabeçalho do painel (seletor de período + notificações).
 * Puramente decorativo por enquanto: o painel sempre mostra os últimos 7
 * dias — não há filtro de período nem notificações reais ligados ainda.
 */
export function HeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="glass sheen-hover flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-brand-700"
      >
        <Calendar className="h-4 w-4 text-brand-600" />
        Período: Últimos 7 dias
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      <button
        type="button"
        aria-label="Notificações"
        className="glass relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:text-brand-600"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>
    </div>
  );
}
