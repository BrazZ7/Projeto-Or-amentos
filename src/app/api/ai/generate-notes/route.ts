import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { generateCommercialNotes } from '@/lib/ai';

const schema = z.object({ context: z.string().min(1) });

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    const { context } = schema.parse(await request.json());
    const result = await generateCommercialNotes(context);
    return NextResponse.json({ result });
  } catch (error) {
    return handleApiError(error);
  }
}
