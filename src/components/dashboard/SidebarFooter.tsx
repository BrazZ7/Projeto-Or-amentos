import Link from 'next/link';
import { Crown } from 'lucide-react';
import { SignOutButton } from '@/components/dashboard/SignOutButton';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Cartão do plano + identificação do usuário, no rodapé da sidebar. */
export function SidebarFooter({
  userName,
  companyName,
  planName,
  planComplete,
}: {
  userName: string;
  companyName: string;
  planName: string | null;
  planComplete: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden p-4">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-300" />
          <p className="text-sm font-semibold text-slate-100">{planName || 'Sem plano'}</p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          {planComplete
            ? 'Você está aproveitando todos os recursos do plano.'
            : 'Desbloqueie modelos de PDF premium e recursos de IA.'}
        </p>
        <Link href="/dashboard/settings/plan">
          <span className="mt-3 flex w-full items-center justify-center rounded-lg border border-hairline-strong bg-night-700/70 px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-brand-500/40 hover:text-white">
            {planComplete ? 'Gerenciar plano' : 'Fazer upgrade'}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-xl px-2 py-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-semibold text-white">
          {initials(userName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-100">{userName}</p>
          <p className="truncate text-xs text-slate-400">{companyName}</p>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
