import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link de verificação inválido ou expirado.' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return NextResponse.json({ success: true });
}
