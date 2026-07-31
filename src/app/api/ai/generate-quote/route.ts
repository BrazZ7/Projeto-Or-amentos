import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { generateQuoteFromRequest } from '@/lib/ai';

const schema = z.object({ request: z.string().min(5, 'Descreva a solicitação com mais detalhes.') });

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const { request: requestText } = schema.parse(await request.json());
    const result = await generateQuoteFromRequest(requestText);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
