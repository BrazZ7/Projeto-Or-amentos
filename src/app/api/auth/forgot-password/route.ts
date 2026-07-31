import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { generateToken, addHours } from '@/lib/tokens';
import { sendMail } from '@/lib/mail';
import { handleApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Sempre responde com sucesso, mesmo se o e-mail não existir, para não
    // vazar quais e-mails estão cadastrados no sistema.
    if (user) {
      const token = generateToken();
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt: addHours(new Date(), 2) },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: 'Recuperação de senha — OrcaFacil',
        html: `<p>Olá, ${user.name}!</p><p>Clique no link abaixo para definir uma nova senha (válido por 2 horas):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se você não solicitou isso, ignore este e-mail.</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
