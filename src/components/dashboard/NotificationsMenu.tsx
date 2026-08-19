'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { AlertTriangle, Clock, Eye } from 'lucide-react';

export interface NotificationItem {
  id: string;
  kind: 'EXPIRING' | 'PENDING' | 'VIEWED';
  title: string;
  detail: string;
  href: string;
}

const ICONS = {
  EXPIRING: { icon: AlertTriangle, className: 'bg-amber-500/15 text-amber-300' },
  PENDING: { icon: Clock, className: 'bg-blue-500/15 text-blue-300' },
  VIEWED: { icon: Eye, className: 'bg-indigo-500/15 text-indigo-300' },
} as const;

export function NotificationsMenu({
  items,
  onClose,
}: {
  items: NotificationItem[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    // Em captura: o clique no próprio sino já alterna o estado, e sem captura
    // o menu fecharia e reabriria no mesmo clique.
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="panel-overlay absolute right-0 top-full z-40 mt-2 w-80 animate-scale-in overflow-hidden p-0"
    >
      <div className="border-b border-hairline px-4 py-3">
        <p className="text-sm font-semibold text-slate-100">Notificações</p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500">Nada precisa da sua atenção.</p>
      ) : (
        <ul className="max-h-80 divide-y divide-hairline overflow-y-auto">
          {items.map((item) => {
            const { icon: Icon, className } = ICONS[item.kind];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${className}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-200">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
