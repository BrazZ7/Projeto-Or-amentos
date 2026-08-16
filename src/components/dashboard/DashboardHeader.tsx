'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Plus, Search } from 'lucide-react';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { NotificationsMenu, type NotificationItem } from '@/components/dashboard/NotificationsMenu';

export function DashboardHeader({
  userName,
  notifications,
}: {
  userName: string;
  notifications: NotificationItem[];
}) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  // A saudação é do painel. Nas outras telas o próprio conteúdo traz o título,
  // e repetir "Olá, fulano" em cima dele só empurraria a página para baixo.
  const isDashboard = pathname === '/dashboard';
  const firstName = userName.trim().split(/\s+/)[0];

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          {isDashboard && (
            <>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
                Olá, {firstName}! <span className="animate-float">👋</span>
              </h1>
              <p className="mt-1 text-sm text-slate-400">Bem-vindo ao seu painel de orçamentos</p>
            </>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group flex w-full max-w-md items-center gap-3 rounded-xl border border-hairline bg-night-800/70 px-4 py-2.5 text-sm text-slate-400 shadow-panel backdrop-blur-xl transition-colors hover:border-hairline-strong hover:text-slate-300"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">Buscar orçamentos, clientes, produtos...</span>
            <kbd className="hidden shrink-0 rounded-md border border-hairline-strong bg-night-700/80 px-1.5 py-0.5 font-sans text-[11px] text-slate-400 sm:block">
              ⌘ K
            </kbd>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setBellOpen((v) => !v)}
              className="relative rounded-xl border border-hairline bg-night-800/70 p-2.5 text-slate-400 shadow-panel backdrop-blur-xl transition-colors hover:border-hairline-strong hover:text-slate-100"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-semibold text-white shadow-glow-brand">
                  {notifications.length}
                </span>
              )}
            </button>
            {bellOpen && (
              <NotificationsMenu items={notifications} onClose={() => setBellOpen(false)} />
            )}
          </div>

          <Link href="/dashboard/quotes/new">
            <span className="sheen-hover inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-glow-brand transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-brand-lg">
              <Plus className="h-4 w-4" />
              Novo orçamento
            </span>
          </Link>
        </div>
      </header>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
