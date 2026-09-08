import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { requireRole } from '@/lib/rbac';
import { handleApiError } from '@/lib/api-utils';
import { criarConvite, TeamError } from '@/lib/team';
import { sendMail } from '@/lib/mail';

const conviteSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  role: z.enum(['MEMBER', 'ADMIN', 'OWNER']).default('MEMBER'),
});

/** Lista quem já está na equipe e quem foi convidado e ainda não entrou. */
export async function GET() {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;

    const [membros, convites, subscription] = await Promise.all([
      prisma.user.findMany({
        where: { companyId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.invitation.findMany({
        where: { companyId, acceptedAt: null },
        select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscription.findUnique({ where: { companyId }, include: { plan: true } }),
    ]);

    const agora = new Date();
    return NextResponse.json({
      membros,
      convites: convites.map((c) => ({ ...c, expirado: c.expiresAt < agora })),
      limite: subscription?.plan.maxUsers ?? null,
      planoNome: subscription?.plan.name ?? null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');
    const { email, role } = conviteSchema.parse(await request.json());

    const convite = await criarConvite({
      companyId: session.user.companyId,
      email,
      role,
      invitedById: session.user.id,
      cargoDeQuemConvida: session.user.role,
    });

    const empresa = session.user.companyName;
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/convite?token=${convite.token}`;

    // O convite vale mesmo se o e-mail falhar: o link é devolvido na resposta
    // para quem convidou poder repassar por outro caminho. Sem isso, um SMTP
    // fora do ar tornaria a funcionalidade inútil.
    let emailEnviado = true;
    try {
      await sendMail({
        to: convite.email,
        subject: `Convite para acessar ${empresa} no OrçaFácil`,
        html: `
          <p>Você foi convidado para acessar <strong>${empresa}</strong> no OrçaFácil.</p>
          <p>Clique no link abaixo para criar a sua senha e entrar:</p>
          <p><a href="${url}">${url}</a></p>
          <p>O convite vale por 7 dias.</p>
        `,
      });
    } catch {
      emailEnviado = false;
    }

    return NextResponse.json(
      {
        id: convite.id,
        email: convite.email,
        role: convite.role,
        expiresAt: convite.expiresAt,
        url,
        emailEnviado,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return handleApiError(error);
  }
}
