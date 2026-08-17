import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { UnauthorizedError } from '@/lib/session';
import { PlanLimitError } from '@/lib/plan-limits';
import { RateLimitError } from '@/lib/rate-limit';

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: error.message },
      { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
    );
  }
  if (error instanceof PlanLimitError) {
    return NextResponse.json({ error: error.message }, { status: 402 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Dados inválidos.', issues: error.flatten().fieldErrors },
      { status: 422 },
    );
  }
  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status || 400;
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ error: 'Erro inesperado.' }, { status: 500 });
}
