'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Boxes,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Seis entradas, como no mockup. Empresa, modelos de PDF e plano ficam sob
// Configurações — continuam acessíveis, agora por uma tela índice.
const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/quotes', label: 'Orçamentos', icon: FileText },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/products', label: 'Produtos', icon: Package },
  { href: '/dashboard/stock', label: 'Estoque', icon: Boxes },
  { href: '/dashboard/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {links.map((link, index) => {
        const active =
          link.href === '/dashboard' ? pathname === link.href : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{ animationDelay: `${index * 35}ms` }}
            className={cn(
              'group relative flex animate-fade-in-up items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
              active
                ? 'sheen-hover border border-brand-400/30 bg-gradient-to-r from-brand-600/90 to-brand-500/70 text-white shadow-glow-brand'
                : 'border border-transparent text-slate-400 hover:translate-x-0.5 hover:bg-white/[0.04] hover:text-slate-100',
            )}
          >
            {/* Marcador vertical no item ativo, como no mockup. */}
            {active && (
              <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand-300 shadow-glow-soft" />
            )}
            <link.icon
              className={cn(
                'h-[18px] w-[18px] shrink-0 transition-transform duration-200',
                active ? 'text-white' : 'text-slate-400 group-hover:scale-110 group-hover:text-brand-300',
              )}
            />
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
