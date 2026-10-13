import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { requireRole } from '@/lib/rbac';
import { companySchema } from '@/lib/validations/company';
import { handleApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await requireSession();
    const company = await prisma.company.findUnique({ where: { id: session.user.companyId } });
    return NextResponse.json(company);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole('ADMIN');
    const body = await request.json();
    const data = companySchema.parse(body);

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: { ...data, document: data.document.replace(/\D/g, '') },
    });

    return NextResponse.json(company);
  } catch (error) {
    return handleApiError(error);
  }
}
