import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { addHours } from '@/lib/tokens';
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

      // Conta já criada com e-mail confirmado — sem etapa de verificação por
      // e-mail por enquanto, para permitir cadastro e login imediatos.
      return tx.user.create({
        data: {
          companyId: company.id,
          name: data.name,
          email: data.email.toLowerCase(),
          passwordHash,
          role: 'OWNER',
          emailVerified: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    return handleApiError(error);
  }
}
