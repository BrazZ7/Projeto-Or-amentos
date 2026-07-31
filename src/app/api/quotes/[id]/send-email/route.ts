import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { generateQuotePdf } from '@/lib/pdf/generator';
import { sendMail } from '@/lib/mail';
import { formatCurrency } from '@/lib/utils';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();

    const quote = await prisma.quote.findFirst({
      where: { id: params.id, companyId: session.user.companyId },
      include: { items: { orderBy: { order: 'asc' } }, client: true },
    });
    if (!quote) {
      return NextResponse.json({ error: 'Orçamento não encontrado.' }, { status: 404 });
    }
    if (!quote.client.email) {
      return NextResponse.json({ error: 'Este cliente não possui e-mail cadastrado.' }, { status: 422 });
    }

    const company = await prisma.company.findUniqueOrThrow({ where: { id: session.user.companyId } });
    const pdfBuffer = await generateQuotePdf(quote, company);
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orcamento/${quote.publicToken}`;

    await sendMail({
      to: quote.client.email,
      subject: `Orçamento ${company.quotePrefix}-${String(quote.number).padStart(4, '0')} — ${company.tradeName || company.legalName}`,
      html: `<p>Olá, ${quote.client.name}!</p>
        <p>Segue em anexo o orçamento <strong>${company.quotePrefix}-${String(quote.number).padStart(4, '0')}</strong>, no valor total de <strong>${formatCurrency(Number(quote.total))}</strong>.</p>
        <p>Você também pode visualizar, aprovar ou recusar o orçamento online pelo link abaixo:</p>
        <p><a href="${publicUrl}">${publicUrl}</a></p>
        <p>Atenciosamente,<br/>${company.tradeName || company.legalName}</p>`,
      attachments: [
        { filename: `orcamento-${quote.number}.pdf`, content: pdfBuffer },
      ],
    });

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: quote.status === 'DRAFT' ? 'SENT' : quote.status,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    return handleApiError(error);
  }
}
