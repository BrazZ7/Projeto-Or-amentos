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
      {links.map((link) => {
        const active =
          link.href === '/dashboard' ? pathname === link.href : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
