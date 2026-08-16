import { redirect } from 'next/navigation';
import { FileText } from 'lucide-react';
import { getSession } from '@/lib/session';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { SignOutButton } from '@/components/dashboard/SignOutButton';
import { BackgroundBlobs } from '@/components/ui/BackgroundBlobs';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 lg:flex">
      <BackgroundBlobs position="fixed" vivid />

      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/50 bg-white/50 px-4 py-6 shadow-glass backdrop-blur-xl lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2 text-lg font-semibold text-slate-900">
          <FileText className="h-6 w-6 text-brand-600" />
          OrcaFacil
        </div>
        <Sidebar className="flex-1" />
        <div className="border-t border-slate-900/10 pt-3">
          <p className="truncate px-3 pb-2 text-xs font-medium text-slate-400">
            {session.user.companyName}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1">
        <Topbar companyName={session.user.companyName} />
        <main className="mx-auto max-w-7xl animate-fade-in-up px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
