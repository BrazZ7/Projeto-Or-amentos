import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { assertAiAllowed } from '@/lib/plan-limits';
import { enforceRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { searchProductPrices, PriceSearchError } from '@/lib/price-search';

const schema = z.object({
  query: z.string().min(3, 'Descreva o produto com pelo menos 3 caracteres.').max(200),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    // Cada busca dispara pesquisas na web, que são cobradas por uso — passa
    // pelo mesmo gate de plano e pelo mesmo limite dos outros recursos de IA.
    await assertAiAllowed(session.user.companyId);
    await enforceRateLimit('ai', session.user.companyId);

    const { query } = schema.parse(await request.json());
    const result = await searchProductPrices(query);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PriceSearchError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return handleApiError(error);
  }
}
