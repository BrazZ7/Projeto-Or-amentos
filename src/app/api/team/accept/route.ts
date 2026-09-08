import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-utils';
import { enforceRateLimit, clientIp } from '@/lib/rate-limit';
import { buscarConviteValido, assertCabeMaisUmUsuario, TeamError } from '@/lib/team';

const schema = z.object({
  token: z.string().min(10),
  name: z.string().min(2, 'Informe seu nome.'),
  password: z.string().min(8, 'A senha precisa de pelo menos 8 caracteres.'),
});

/** Consulta o convite para a tela mostrar de qual empresa ele é, sem exigir login. */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || '';
    const convite = await buscarConviteValido(token);

    return NextResponse.json({
      email: convite.email,
      role: convite.role,
      empresa: convite.company.tradeName || convite.company.legalName,
      expiresAt: convite.expiresAt,
    });
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rota sem sessão: sem limite, o token vira alvo de tentativa em massa.
    const ip = clientIp(request);
    if (ip) await enforceRateLimit('inviteAccept', ip);

    const { token, name, password } = schema.parse(await request.json());
    const convite = await buscarConviteValido(token);

    // Conferido de novo na hora do aceite: entre o envio e o clique, outra
    // pessoa pode ter ocupado a última vaga do plano.
    await assertCabeMaisUmUsuario(convite.companyId);

    const jaTemConta = await prisma.user.findUnique({ where: { email: convite.email } });
    if (jaTemConta) {
      throw new TeamError('Esse e-mail já tem conta no sistema.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Transação: criar o usuário e queimar o convite têm que acontecer juntos,
    // senão o mesmo link cria duas contas.
    const usuario = await prisma.$transaction(async (tx) => {
      const criado = await tx.user.create({
        data: {
          companyId: convite.companyId,
          name: name.trim(),
          email: convite.email,
          passwordHash,
          role: convite.role,
          // Quem clicou no link provou que recebe naquele e-mail.
          emailVerified: new Date(),
        },
      });

      await tx.invitation.update({
        where: { id: convite.id },
        data: { acceptedAt: new Date(), acceptedById: criado.id, token: `usado:${criado.id}` },
      });

      return criado;
    });

    return NextResponse.json({ email: usuario.email }, { status: 201 });
  } catch (error) {
    if (error instanceof TeamError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return handleApiError(error);
  }
}
