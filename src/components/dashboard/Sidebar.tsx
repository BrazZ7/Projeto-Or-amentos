'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Boxes,
  Building2,
  Palette,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard },
  { href: '/dashboard/quotes', label: 'Orçamentos', icon: FileText },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users },
  { href: '/dashboard/products', label: 'Produtos e serviços', icon: Package },
  { href: '/dashboard/stock', label: 'Estoque', icon: Boxes },
  { href: '/dashboard/company', label: 'Minha empresa', icon: Building2 },
  { href: '/dashboard/settings/pdf', label: 'Modelos de PDF', icon: Palette },
  { href: '/dashboard/settings/plan', label: 'Plano e assinatura', icon: CreditCard },
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
              'group relative flex animate-fade-in-up items-center gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-out',
              active
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow-brand'
                : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-900/5 hover:text-slate-900',
            )}
          >
            <link.icon
              className={cn(
                'h-4 w-4 shrink-0 transition-transform duration-200',
                !active && 'group-hover:scale-110',
              )}
            />
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
