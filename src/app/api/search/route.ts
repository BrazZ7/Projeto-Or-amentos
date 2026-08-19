import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';

export interface SearchResult {
  id: string;
  type: 'quote' | 'client' | 'product';
  title: string;
  subtitle: string;
  href: string;
}

const LIMIT_PER_TYPE = 5;

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;
    const term = (request.nextUrl.searchParams.get('q') || '').trim();

    if (term.length < 2) return NextResponse.json({ results: [] });

    const contains = { contains: term, mode: 'insensitive' as const };
    // Busca por número só faz sentido quando o termo é numérico.
    const asNumber = /^\d+$/.test(term) ? Number(term) : undefined;

    const [quotes, clients, products] = await Promise.all([
      prisma.quote.findMany({
        where: {
          companyId,
          OR: [
            ...(asNumber !== undefined ? [{ number: asNumber }] : []),
            { client: { name: contains } },
          ],
        },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: LIMIT_PER_TYPE,
      }),
      prisma.client.findMany({
        where: { companyId, OR: [{ name: contains }, { document: contains }, { email: contains }] },
        orderBy: { name: 'asc' },
        take: LIMIT_PER_TYPE,
      }),
      prisma.product.findMany({
        where: { companyId, OR: [{ name: contains }, { code: contains }, { category: contains }] },
        orderBy: { name: 'asc' },
        take: LIMIT_PER_TYPE,
      }),
    ]);

    const results: SearchResult[] = [
      ...quotes.map((quote) => ({
        id: quote.id,
        type: 'quote' as const,
        title: `Orçamento #${quote.number}`,
        subtitle: quote.client.name,
        href: `/dashboard/quotes/${quote.id}`,
      })),
      ...clients.map((client) => ({
        id: client.id,
        type: 'client' as const,
        title: client.name,
        subtitle: client.email || client.document || (client.type === 'PF' ? 'Pessoa física' : 'Pessoa jurídica'),
        href: `/dashboard/clients/${client.id}`,
      })),
      ...products.map((product) => ({
        id: product.id,
        type: 'product' as const,
        title: product.name,
        subtitle: product.code || product.category || 'Produto',
        href: `/dashboard/products/${product.id}`,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    return handleApiError(error);
  }
}
