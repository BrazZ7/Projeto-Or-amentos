import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { handleApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
