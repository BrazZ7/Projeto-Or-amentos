import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { assertAiAllowed } from '@/lib/plan-limits';
import { enforceRateLimit } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { generateProductDescription } from '@/lib/ai';

const schema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await assertAiAllowed(session.user.companyId);
    await enforceRateLimit('ai', session.user.companyId);
    const input = schema.parse(await request.json());
    const result = await generateProductDescription(input);
    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError(error);
  }
}
