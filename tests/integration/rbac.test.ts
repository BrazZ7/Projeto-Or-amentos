import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createCompanyWithPlan, resetDatabase } from '../helpers';

// A sessao vem do NextAuth, que nao roda fora de uma requisicao. O que importa
// testar aqui e a decisao de cargo, entao a sessao e injetada.
const sessaoAtual: { user: { id: string; companyId: string; role: string } | null } = {
  user: null,
};

vi.mock('@/lib/session', async () => {
  const real = await vi.importActual<typeof import('@/lib/session')>('@/lib/session');
  return {
    ...real,
    requireSession: async () => {
      if (!sessaoAtual.user) throw new real.UnauthorizedError();
      return { user: sessaoAtual.user };
    },
  };
});

const { ForbiddenError, hasRole, requireRole, ROLE_LABELS } = await import('@/lib/rbac');
const { handleApiError } = await import('@/lib/api-utils');

/** Cria o usuario e ja o coloca como sessao ativa. */
async function login(role: 'MEMBER' | 'ADMIN' | 'OWNER') {
  const { company } = await createCompanyWithPlan();
  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      name: `Usuario ${role}`,
      email: `${role.toLowerCase()}-${Date.now()}@teste.com`,
      passwordHash: 'irrelevante',
      role,
    },
  });
  sessaoAtual.user = { id: user.id, companyId: company.id, role };
  return { user, company };
}

beforeEach(async () => {
  sessaoAtual.user = null;
  await resetDatabase();
});
afterAll(() => prisma.$disconnect());

describe('hierarquia de cargos', () => {
  it('e acumulativa: cargo maior faz o que o menor faz', () => {
    expect(hasRole('OWNER', 'MEMBER')).toBe(true);
    expect(hasRole('OWNER', 'ADMIN')).toBe(true);
    expect(hasRole('OWNER', 'OWNER')).toBe(true);
    expect(hasRole('ADMIN', 'MEMBER')).toBe(true);
    expect(hasRole('ADMIN', 'ADMIN')).toBe(true);
    expect(hasRole('MEMBER', 'MEMBER')).toBe(true);
  });

  it('nao deixa cargo menor alcancar exigencia maior', () => {
    expect(hasRole('MEMBER', 'ADMIN')).toBe(false);
    expect(hasRole('MEMBER', 'OWNER')).toBe(false);
    expect(hasRole('ADMIN', 'OWNER')).toBe(false);
  });

  it('trata cargo ausente ou desconhecido como o menor', () => {
    expect(hasRole(undefined, 'MEMBER')).toBe(true);
    expect(hasRole(undefined, 'ADMIN')).toBe(false);
    expect(hasRole('SUPERUSUARIO', 'ADMIN')).toBe(false);
  });

  it('tem rotulo em portugues para todo cargo', () => {
    expect(ROLE_LABELS.OWNER).toBe('Proprietário');
    expect(ROLE_LABELS.ADMIN).toBe('Administrador');
    expect(ROLE_LABELS.MEMBER).toBe('Membro');
  });
});

describe('requireRole', () => {
  it('deixa passar quem tem o cargo exigido', async () => {
    const { user } = await login('ADMIN');
    const session = await requireRole('ADMIN');
    expect(session.user.id).toBe(user.id);
  });

  it('barra o membro em acao de administrador', async () => {
    await login('MEMBER');
    await expect(requireRole('ADMIN')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('barra o administrador em acao exclusiva do dono', async () => {
    await login('ADMIN');
    await expect(requireRole('OWNER')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('explica quando a acao e so do dono', async () => {
    await login('ADMIN');
    await expect(requireRole('OWNER')).rejects.toThrow(/propriet[áa]rio/i);
  });

  it('exige sessao antes de olhar o cargo', async () => {
    sessaoAtual.user = null;
    await expect(requireRole('MEMBER')).rejects.toThrow();
  });

  it('usa o cargo do banco, nao o congelado na sessao', async () => {
    const { user } = await login('OWNER');
    // Rebaixado depois do login: o token ainda diz OWNER.
    await prisma.user.update({ where: { id: user.id }, data: { role: 'MEMBER' } });
    expect(sessaoAtual.user?.role).toBe('OWNER');

    await expect(requireRole('ADMIN')).rejects.toBeInstanceOf(ForbiddenError);
    await expect(requireRole('MEMBER')).resolves.toBeTruthy();
  });

  it('promove sem exigir novo login', async () => {
    const { user } = await login('MEMBER');
    await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    await expect(requireRole('ADMIN')).resolves.toBeTruthy();
  });

  it('barra usuario que nao existe mais', async () => {
    const { user } = await login('OWNER');
    await prisma.user.delete({ where: { id: user.id } });
    await expect(requireRole('MEMBER')).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('resposta HTTP', () => {
  it('devolve 403, e nao 401 nem 400', async () => {
    const res = handleApiError(new ForbiddenError());
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toHaveProperty('error');
  });
});
