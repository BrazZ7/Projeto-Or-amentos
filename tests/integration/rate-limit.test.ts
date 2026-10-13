import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { RATE_LIMITS, RateLimitError, enforceRateLimit } from '@/lib/rate-limit';
import { resetDatabase } from '../helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const LIMITE_LOGIN = RATE_LIMITS.login.limit;

describe('contagem da janela', () => {
  it('permite ate o limite configurado', async () => {
    for (let i = 0; i < LIMITE_LOGIN; i += 1) {
      await expect(enforceRateLimit('login', 'alvo@teste.com')).resolves.toBeUndefined();
    }
  });

  it('bloqueia a tentativa seguinte com Retry-After util', async () => {
    for (let i = 0; i < LIMITE_LOGIN; i += 1) {
      await enforceRateLimit('login', 'alvo@teste.com');
    }

    await expect(enforceRateLimit('login', 'alvo@teste.com')).rejects.toSatisfy(
      (erro: unknown) =>
        erro instanceof RateLimitError &&
        erro.retryAfterSeconds > 0 &&
        erro.retryAfterSeconds <= RATE_LIMITS.login.windowSeconds,
    );
  });

  it('reinicia depois que a janela vence', async () => {
    await enforceRateLimit('login', 'expira@teste.com');
    await prisma.rateLimit.update({
      where: { key: 'login:expira@teste.com' },
      data: {
        count: 999,
        windowStart: new Date(Date.now() - (RATE_LIMITS.login.windowSeconds + 60) * 1000),
      },
    });

    await expect(enforceRateLimit('login', 'expira@teste.com')).resolves.toBeUndefined();
    const linha = await prisma.rateLimit.findUnique({ where: { key: 'login:expira@teste.com' } });
    expect(linha?.count).toBe(1);
  });
});

describe('isolamento entre contadores', () => {
  it('nao mistura identificadores diferentes', async () => {
    for (let i = 0; i < LIMITE_LOGIN; i += 1) {
      await enforceRateLimit('login', 'um@teste.com');
    }
    await expect(enforceRateLimit('login', 'outro@teste.com')).resolves.toBeUndefined();
  });

  it('nao mistura acoes diferentes', async () => {
    for (let i = 0; i < LIMITE_LOGIN; i += 1) {
      await enforceRateLimit('login', 'mesmo-id');
    }
    await expect(enforceRateLimit('ai', 'mesmo-id')).resolves.toBeUndefined();
  });
});

describe('concorrencia', () => {
  // Com ler-depois-escrever, chamadas simultaneas contariam como uma so e o
  // limite poderia ser furado. O incremento e um unico INSERT ... ON CONFLICT.
  it('nao perde incremento em chamadas simultaneas', async () => {
    const total = 20;
    await Promise.all(
      Array.from({ length: total }, () => enforceRateLimit('ai', 'concorrente').catch(() => null)),
    );

    const linha = await prisma.rateLimit.findUnique({ where: { key: 'ai:concorrente' } });
    expect(linha?.count).toBe(total);
  });

  it('barra o excedente mesmo com disparo simultaneo', async () => {
    const limite = RATE_LIMITS.ai.limit;
    const resultados = await Promise.all(
      Array.from({ length: limite + 5 }, () =>
        enforceRateLimit('ai', 'estouro').then(
          () => 'ok',
          () => 'bloqueado',
        ),
      ),
    );

    expect(resultados.filter((r) => r === 'ok')).toHaveLength(limite);
    expect(resultados.filter((r) => r === 'bloqueado')).toHaveLength(5);
  });
});
