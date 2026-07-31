import { redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { getSession } from '@/lib/session';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { SignOutButton } from '@/components/dashboard/SignOutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-surface-muted lg:flex">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold text-slate-900">
          <FileText className="h-6 w-6 text-brand-600" />
          OrcaFacil
        </div>
        <Sidebar className="flex-1" />
        <div className="border-t border-slate-100 pt-3">
          <p className="truncate px-3 pb-2 text-xs font-medium text-slate-400">
            {session.user.companyName}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1">
        <Topbar companyName={session.user.companyName} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
