import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { generateProductDescription } from '@/lib/ai';

const schema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const input = schema.parse(await request.json());
    const result = await generateProductDescription(input);
    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError(error);
  }
}
