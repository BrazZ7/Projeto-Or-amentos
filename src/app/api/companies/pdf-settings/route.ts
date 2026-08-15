import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { pdfSettingsSchema } from '@/lib/validations/company';
import { handleApiError } from '@/lib/api-utils';
import { assertTemplateAllowed } from '@/lib/plan-limits';

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = pdfSettingsSchema.parse(body);

    await assertTemplateAllowed(session.user.companyId, data.pdfTemplate);

    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data,
    });

    return NextResponse.json(company);
  } catch (error) {
    return handleApiError(error);
  }
}
