import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { generateToken, addHours } from '@/lib/tokens';
import { sendMail } from '@/lib/mail';
import { handleApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          legalName: data.companyLegalName,
          documentType: data.documentType,
          document: data.document.replace(/\D/g, ''),
        },
      });

      const freePlan = await tx.plan.findFirst({ orderBy: { priceMonthly: 'asc' } });
      if (freePlan) {
        await tx.subscription.create({
          data: {
            companyId: company.id,
            planId: freePlan.id,
            status: 'TRIALING',
            currentPeriodEnd: addHours(new Date(), 24 * 14),
          },
        });
      }

      return tx.user.create({
        data: {
          companyId: company.id,
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: 'OWNER',
        },
      });
    });

    const token = generateToken();
    await prisma.emailVerificationToken.create({
      data: { token, userId: user.id, expiresAt: addHours(new Date(), 48) },
    });

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Confirme seu e-mail — OrcaFacil',
      html: `<p>Olá, ${user.name}!</p><p>Confirme seu e-mail para ativar sua conta no OrcaFacil:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Este link expira em 48 horas.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
