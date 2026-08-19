import { redirect } from 'next/navigation';
import { addDays, startOfDay } from 'date-fns';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarBrand } from '@/components/dashboard/SidebarBrand';
import { SidebarFooter } from '@/components/dashboard/SidebarFooter';
import { Topbar } from '@/components/dashboard/Topbar';
import { BackgroundBlobs } from '@/components/ui/BackgroundBlobs';
import { PlanFeaturesProvider } from '@/components/providers/PlanFeaturesProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { NotificationItem } from '@/components/dashboard/NotificationsMenu';
import { formatCurrency } from '@/lib/utils';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const companyId = session.user.companyId;
  const today = startOfDay(new Date());

  // O sino mostra o que realmente pede ação: orçamento perto de vencer,
  // esperando resposta ou já visto pelo cliente sem decisão.
  const [expiring, pending, viewed, subscription] = await Promise.all([
    prisma.quote.findMany({
      where: {
        companyId,
        status: { in: ['DRAFT', 'SENT', 'VIEWED'] },
        validUntil: { gte: new Date(), lte: addDays(today, 7) },
      },
      include: { client: { select: { name: true } } },
      orderBy: { validUntil: 'asc' },
      take: 5,
    }),
    prisma.quote.findMany({
      where: { companyId, status: 'SENT' },
      include: { client: { select: { name: true } } },
      orderBy: { sentAt: 'desc' },
      take: 3,
    }),
    prisma.quote.findMany({
      where: { companyId, status: 'VIEWED' },
      include: { client: { select: { name: true } } },
      orderBy: { viewedAt: 'desc' },
      take: 3,
    }),
    prisma.subscription.findUnique({ where: { companyId }, include: { plan: true } }),
  ]);

  // O cargo até está no JWT, mas congelado no login: ler do banco faz a
  // interface concordar com o requireRole das rotas, que também lê daqui.
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const notifications: NotificationItem[] = [
    ...expiring.map((quote) => ({
      id: `exp-${quote.id}`,
      kind: 'EXPIRING' as const,
      title: `Orçamento #${quote.number} vence em breve`,
      detail: `${quote.client.name} · ${formatCurrency(Number(quote.total))}`,
      href: `/dashboard/quotes/${quote.id}`,
    })),
    ...viewed.map((quote) => ({
      id: `viw-${quote.id}`,
      kind: 'VIEWED' as const,
      title: `#${quote.number} foi visualizado`,
      detail: `${quote.client.name} ainda não respondeu`,
      href: `/dashboard/quotes/${quote.id}`,
    })),
    ...pending.map((quote) => ({
      id: `pen-${quote.id}`,
      kind: 'PENDING' as const,
      title: `#${quote.number} aguardando resposta`,
      detail: quote.client.name,
      href: `/dashboard/quotes/${quote.id}`,
    })),
  ];

  return (
    <div className="relative min-h-screen lg:flex">
      {/* Fica atrás de tudo: é o que o backdrop-blur dos painéis borra. */}
      <BackgroundBlobs position="fixed" dim />
      {/* A aresta direita da sidebar é um gradiente prateado, não uma borda
          uniforme: no mockup ela brilha mais na altura do conteúdo e some nas
          pontas. */}
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col bg-white/[0.04] px-4 py-6 backdrop-blur-2xl backdrop-saturate-150 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gradient-to-b after:from-transparent after:via-white/20 after:to-transparent lg:flex">
        <SidebarBrand />
        <Sidebar className="mt-8 flex-1" />
        <SidebarFooter
          userName={session.user.name || 'Usuário'}
          userRole={currentUser?.role ?? 'MEMBER'}
          planName={subscription?.plan.name ?? null}
          planComplete={!!subscription?.plan.hasCustomBrand}
        />
      </aside>

      <div className="min-w-0 flex-1">
        <Topbar companyName={session.user.companyName} />
        <div className="px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <DashboardHeader userName={session.user.name || 'Usuário'} notifications={notifications} />
          <main className="animate-fade-in-up pt-4">
            <PlanFeaturesProvider
              aiAllowed={subscription?.plan.hasAiFeatures ?? true}
              role={currentUser?.role ?? 'MEMBER'}
            >
              {children}
            </PlanFeaturesProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
