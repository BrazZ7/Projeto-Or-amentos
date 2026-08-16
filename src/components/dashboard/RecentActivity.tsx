import Link from 'next/link';
import { CheckCircle2, FileText, Send, XCircle, Eye } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  kind: 'CREATED' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED';
  quoteNumber: number;
  quoteId: string;
  at: Date;
}

const META = {
  CREATED: { icon: FileText, className: 'bg-blue-500/15 text-blue-300', text: 'criado' },
  SENT: { icon: Send, className: 'bg-indigo-500/15 text-indigo-300', text: 'enviado' },
  VIEWED: { icon: Eye, className: 'bg-slate-500/15 text-slate-300', text: 'visualizado' },
  APPROVED: { icon: CheckCircle2, className: 'bg-emerald-500/15 text-emerald-300', text: 'aprovado' },
  REJECTED: { icon: XCircle, className: 'bg-rose-500/15 text-rose-300', text: 'recusado' },
} as const;

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="panel p-5">
      <h2 className="text-base font-semibold text-slate-100">Atividades recentes</h2>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">Nenhuma atividade ainda.</p>
      ) : (
        <>
          <ul className="mt-4 space-y-4">
            {items.map((item) => {
              const meta = META[item.kind];
              return (
                <li key={item.id} className="flex gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.className}`}
                  >
                    <meta.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-slate-300">
                      Orçamento{' '}
                      <Link
                        href={`/dashboard/quotes/${item.quoteId}`}
                        className="font-medium text-slate-100 hover:text-brand-300"
                      >
                        #{item.quoteNumber}
                      </Link>{' '}
                      {meta.text}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{formatRelativeTime(item.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href="/dashboard/quotes"
            className="mt-4 inline-block text-xs font-medium text-brand-300 hover:text-brand-200"
          >
            Ver todas as atividades
          </Link>
        </>
      )}
    </div>
  );
}
