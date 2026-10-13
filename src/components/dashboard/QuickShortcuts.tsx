import Link from 'next/link';
import { FileText, UserPlus, PackagePlus, BarChart3 } from 'lucide-react';

const SHORTCUTS = [
  { href: '/dashboard/quotes/new', label: 'Novo orçamento', icon: FileText },
  { href: '/dashboard/clients/new', label: 'Novo cliente', icon: UserPlus },
  { href: '/dashboard/products/new', label: 'Novo produto', icon: PackagePlus },
  { href: '/dashboard/reports', label: 'Relatórios', icon: BarChart3 },
];

export function QuickShortcuts() {
  return (
    <div className="panel p-5">
      <h2 className="text-base font-semibold text-slate-100">Atalhos rápidos</h2>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-hairline bg-night-850/60 px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:bg-night-700/60"
          >
            <shortcut.icon className="h-5 w-5 text-slate-400 transition-colors group-hover:text-brand-300" />
            <span className="text-[11px] leading-tight text-slate-400 transition-colors group-hover:text-slate-200">
              {shortcut.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
