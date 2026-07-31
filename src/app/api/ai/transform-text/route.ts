import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { transformText } from '@/lib/ai';

const schema = z.object({
  action: z.enum(['improve', 'fix', 'professional', 'summarize']),
  text: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const { action, text } = schema.parse(await request.json());
    const result = await transformText(action, text);
    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError(error);
  }
}
