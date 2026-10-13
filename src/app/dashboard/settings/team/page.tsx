import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getSession } from '@/lib/session';
import { TeamManager } from '@/components/team/TeamManager';

export default async function TeamPage() {
  const session = await getSession();
  if (!session?.user) redirect('/login');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/settings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Configurações
        </Link>
        <h1 className="text-2xl font-semibold text-slate-100">Equipe</h1>
        <p className="mt-1 text-sm text-slate-400">
          Convide pessoas para acessar a empresa e defina o que cada uma pode fazer.
        </p>
      </div>

      <TeamManager meuId={session.user.id} />
    </div>
  );
}
