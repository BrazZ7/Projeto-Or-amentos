import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export class RateLimitError extends Error {
  constructor(
    message: string,
    /** Segundos até a janela liberar, para o cabeçalho Retry-After. */
    readonly retryAfterSeconds: number,
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/** Limites por ação. Janela em segundos. */
export const RATE_LIMITS = {
  // Autenticação: protege contra força bruta e enumeração de e-mail.
  login: { limit: 10, windowSeconds: 15 * 60 },
  register: { limit: 5, windowSeconds: 60 * 60 },
  forgotPassword: { limit: 5, windowSeconds: 60 * 60 },
  // IA: cada chamada custa token da chave do operador.
  ai: { limit: 30, windowSeconds: 60 * 60 },
  upload: { limit: 60, windowSeconds: 60 * 60 },
  // Decisão do cliente no link público — endpoint sem autenticação.
  publicDecision: { limit: 20, windowSeconds: 60 * 60 },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * IP de origem. Atrás de proxy (Vercel) o socket é do proxy, então vale o
 * primeiro endereço do x-forwarded-for. Sem cabeçalho — execução local ou
 * chamada direta — cai num rótulo fixo, que ainda limita o total daquela rota.
 */
export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'sem-ip';
}

/**
 * Consome uma unidade da janela e lança RateLimitError se passou do limite.
 *
 * O incremento é um único INSERT ... ON CONFLICT DO UPDATE: precisa ser atômico
 * porque duas requisições simultâneas com ler-depois-escrever contariam como
 * uma. O mesmo comando também reinicia a janela quando ela expirou, evitando
 * uma segunda ida ao banco.
 */
export async function enforceRateLimit(action: RateLimitAction, identifier: string) {
  const { limit, windowSeconds } = RATE_LIMITS[action];
  const key = `${action}:${identifier}`;

  const rows = await prisma.$queryRaw<{ count: number; window_start: Date }[]>`
    INSERT INTO "RateLimit" ("id", "key", "count", "windowStart")
    VALUES (${randomUUID()}, ${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}::double precision)
        THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimit"."windowStart" < now() - make_interval(secs => ${windowSeconds}::double precision)
        THEN now()
        ELSE "RateLimit"."windowStart"
      END
    RETURNING "count", "windowStart" AS window_start
  `;

  void pruneOccasionally();

  const row = rows[0];
  if (!row || row.count <= limit) return;

  const elapsed = (Date.now() - new Date(row.window_start).getTime()) / 1000;
  const retryAfterSeconds = Math.max(1, Math.ceil(windowSeconds - elapsed));

  throw new RateLimitError(
    `Muitas tentativas. Tente novamente em ${formatWait(retryAfterSeconds)}.`,
    retryAfterSeconds,
  );
}

/** Maior janela configurada: além dela, a linha não serve para mais nada. */
const LONGEST_WINDOW_SECONDS = Math.max(
  ...Object.values(RATE_LIMITS).map((config) => config.windowSeconds),
);

/**
 * Remove janelas vencidas de vez em quando. A tabela só cresce — uma linha por
 * IP, e-mail ou empresa por ação — e o projeto não tem agendador, então a
 * limpeza é oportunista: roda em ~1% das chamadas, o que basta para manter o
 * tamanho estável sem somar uma consulta a cada requisição.
 */
async function pruneOccasionally() {
  if (Math.random() > 0.01) return;
  const cutoff = new Date(Date.now() - LONGEST_WINDOW_SECONDS * 2 * 1000);
  try {
    await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: cutoff } } });
  } catch {
    // Limpeza é oportunista: falhar aqui não pode derrubar a requisição.
  }
}

function formatWait(seconds: number) {
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minuto${minutes === 1 ? '' : 's'}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hora${hours === 1 ? '' : 's'}`;
}
