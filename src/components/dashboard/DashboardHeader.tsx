'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, ChevronDown, FileText, Package, Plus, Search, UserPlus } from 'lucide-react';
import { CommandPalette } from '@/components/dashboard/CommandPalette';
import { NotificationsMenu, type NotificationItem } from '@/components/dashboard/NotificationsMenu';
import { cn } from '@/lib/utils';

const CREATE_LINKS = [
  { href: '/dashboard/quotes/new', label: 'Novo orçamento', icon: FileText },
  { href: '/dashboard/clients/new', label: 'Novo cliente', icon: UserPlus },
  { href: '/dashboard/products/new', label: 'Novo produto', icon: Package },
];

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
  const [createOpen, setCreateOpen] = useState(false);

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

  // Fecha o menu de cadastro ao clicar fora. Em captura, senão o clique no
  // próprio chevron fecharia e reabriria no mesmo evento.
  useEffect(() => {
    if (!createOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest('[data-create-menu]')) setCreateOpen(false);
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setCreateOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('keydown', onEscape);
    };
  }, [createOpen]);

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

        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          {/* min-w-0 + flex-1: sem isso a busca não encolhe e o cabeçalho
              quebra em duas linhas quando o botão dividido entra. */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-hairline bg-night-800/70 px-4 py-2.5 text-sm text-slate-400 shadow-panel backdrop-blur-xl transition-colors hover:border-hairline-strong hover:text-slate-300 sm:max-w-md"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">Buscar orçamentos, clientes, produtos...</span>
            <kbd className="hidden shrink-0 rounded-md border border-hairline-strong bg-night-700/80 px-1.5 py-0.5 font-sans text-[11px] text-slate-500 sm:block">
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

          {/* Botão dividido: a ação principal leva ao novo orçamento e o
              chevron abre os outros cadastros. Um chevron decorativo, que não
              abrisse nada, seria pior que não ter. */}
          <div className="relative flex shrink-0 items-stretch" data-create-menu>
            <Link href="/dashboard/quotes/new">
              <span className="sheen-hover inline-flex h-full items-center gap-2 rounded-l-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 pl-4 pr-3 text-sm font-medium text-white shadow-glow-brand transition-all duration-200 hover:shadow-glow-brand-lg">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo orçamento</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              aria-label="Mais opções de cadastro"
              className="inline-flex items-center rounded-r-xl border-l border-white/20 bg-gradient-to-r from-brand-500 to-brand-500 px-2 text-white shadow-glow-brand transition-all duration-200 hover:shadow-glow-brand-lg"
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', createOpen && 'rotate-180')} />
            </button>

            {createOpen && (
              <div className="panel-overlay absolute right-0 top-full z-40 mt-2 w-52 animate-scale-in overflow-hidden p-0">
                {CREATE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setCreateOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
                  >
                    <item.icon className="h-4 w-4 text-slate-500" />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
