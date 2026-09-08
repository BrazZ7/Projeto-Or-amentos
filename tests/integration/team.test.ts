import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';
import { PlanLimitError } from '@/lib/plan-limits';
import { ForbiddenError } from '@/lib/rbac';
import {
  TeamError,
  alterarCargo,
  assertCabeMaisUmUsuario,
  buscarConviteValido,
  criarConvite,
  removerUsuario,
} from '@/lib/team';
import { createCompanyWithPlan, resetDatabase } from '../helpers';

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

let contador = 0;

async function criarUsuario(companyId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER') {
  contador += 1;
  return prisma.user.create({
    data: {
      companyId,
      name: `Usuario ${role} ${contador}`,
      email: `u${contador}-${Date.now()}@teste.com`,
      passwordHash: 'irrelevante',
      role,
    },
  });
}

describe('limite de usuarios do plano', () => {
  it('conta convite pendente como vaga ocupada', async () => {
    // Sem isso, convidar mais gente que o plano permite só estoura quando todos
    // aceitam — e aí não há o que fazer senão remover quem já entrou.
    const { company } = await createCompanyWithPlan({ maxUsers: 2 });
    const dono = await criarUsuario(company.id, 'OWNER');

    await criarConvite({
      companyId: company.id,
      email: 'convidado@teste.com',
      role: 'MEMBER',
      invitedById: dono.id,
      cargoDeQuemConvida: 'OWNER',
    });

    // 1 usuário + 1 convite = 2, que é o teto.
    await expect(assertCabeMaisUmUsuario(company.id)).rejects.toBeInstanceOf(PlanLimitError);
  });

  it('libera a vaga quando o convite e cancelado', async () => {
    const { company } = await createCompanyWithPlan({ maxUsers: 2 });
    const dono = await criarUsuario(company.id, 'OWNER');

    const convite = await criarConvite({
      companyId: company.id,
      email: 'convidado@teste.com',
      role: 'MEMBER',
      invitedById: dono.id,
      cargoDeQuemConvida: 'OWNER',
    });

    await prisma.invitation.delete({ where: { id: convite.id } });
    await expect(assertCabeMaisUmUsuario(company.id)).resolves.toBeUndefined();
  });

  it('nao conta convite expirado', async () => {
    const { company } = await createCompanyWithPlan({ maxUsers: 2 });
    const dono = await criarUsuario(company.id, 'OWNER');

    const convite = await criarConvite({
      companyId: company.id,
      email: 'convidado@teste.com',
      role: 'MEMBER',
      invitedById: dono.id,
      cargoDeQuemConvida: 'OWNER',
    });
    await prisma.invitation.update({
      where: { id: convite.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await expect(assertCabeMaisUmUsuario(company.id)).resolves.toBeUndefined();
  });

  it('empresa sem assinatura nao e barrada', async () => {
    const company = await prisma.company.create({
      data: { legalName: 'Sem Plano LTDA', documentType: 'CNPJ', document: '11111111000191' },
    });
    await criarUsuario(company.id, 'OWNER');
    await expect(assertCabeMaisUmUsuario(company.id)).resolves.toBeUndefined();
  });
});

describe('criar convite', () => {
  it('barra cargo acima do de quem convida', async () => {
    const { company } = await createCompanyWithPlan({ maxUsers: 10 });
    const admin = await criarUsuario(company.id, 'ADMIN');

    await expect(
      criarConvite({
        companyId: company.id,
        email: 'novo@teste.com',
        role: 'OWNER',
        invitedById: admin.id,
        cargoDeQuemConvida: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('recusa quem ja tem conta', async () => {
    const { company } = await createCompanyWithPlan({ maxUsers: 10 });
    const dono = await criarUsuario(company.id, 'OWNER');

    await expect(
      criarConvite({
        companyId: company.id,
        email: dono.email,
        role: 'MEMBER',
        invitedById: dono.id,
        cargoDeQuemConvida: 'OWNER',
      }),
    ).rejects.toBeInstanceOf(TeamError);
  });

  it('reconvidar substitui o link anterior em vez de acumular', async () => {
    const { company } = await createCompanyWithPlan({ maxUsers: 10 });
    const dono = await criarUsuario(company.id, 'OWNER');

    const primeiro = await criarConvite({
      companyId: company.id,
      email: 'convidado@teste.com',
      role: 'MEMBER',
      invitedById: dono.id,
      cargoDeQuemConvida: 'OWNER',
    });
    const segundo = await criarConvite({
      companyId: company.id,
      email: 'convidado@teste.com',
      role: 'ADMIN',
      invitedById: dono.id,
      cargoDeQuemConvida: 'OWNER',
    });

    expect(segundo.token).not.toBe(primeiro.token);
    expect(segundo.role).toBe('ADMIN');
    expect(await prisma.invitation.count({ where: { companyId: company.id } })).toBe(1);
    // O link antigo tem que morrer, senão continuam existindo dois válidos.
    await expect(buscarConviteValido(primeiro.token)).rejects.toBeInstanceOf(TeamError);
  });

  it('recusa convite expirado e convite ja usado', async () => {
    const { company } = await createCompanyWithPlan({ maxUsers: 10 });
    const dono = await criarUsuario(company.id, 'OWNER');

    const convite = await criarConvite({
      companyId: company.id,
      email: 'convidado@teste.com',
      role: 'MEMBER',
      invitedById: dono.id,
      cargoDeQuemConvida: 'OWNER',
    });

    await prisma.invitation.update({
      where: { id: convite.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(buscarConviteValido(convite.token)).rejects.toThrow(/expirou/i);

    await prisma.invitation.update({
      where: { id: convite.id },
      data: { expiresAt: new Date(Date.now() + 60_000), acceptedAt: new Date() },
    });
    await expect(buscarConviteValido(convite.token)).rejects.toThrow(/j[áa] foi usado/i);
  });
});

describe('remover e mudar cargo', () => {
  it('nao deixa remover a si mesmo', async () => {
    const { company } = await createCompanyWithPlan();
    const dono = await criarUsuario(company.id, 'OWNER');

    await expect(
      removerUsuario({ companyId: company.id, alvoId: dono.id, quemRemoveId: dono.id }),
    ).rejects.toThrow(/a si mesmo/i);
  });

  it('nao deixa a empresa sem proprietario', async () => {
    const { company } = await createCompanyWithPlan();
    const dono = await criarUsuario(company.id, 'OWNER');
    const admin = await criarUsuario(company.id, 'ADMIN');

    await expect(
      removerUsuario({ companyId: company.id, alvoId: dono.id, quemRemoveId: admin.id }),
    ).rejects.toThrow(/pelo menos um propriet/i);

    await expect(
      alterarCargo({
        companyId: company.id,
        alvoId: dono.id,
        novoCargo: 'MEMBER',
        quemAlteraId: admin.id,
        cargoDeQuemAltera: 'ADMIN',
      }),
    ).rejects.toThrow(/pelo menos um propriet/i);
  });

  it('deixa remover o dono quando existe outro', async () => {
    const { company } = await createCompanyWithPlan();
    const dono1 = await criarUsuario(company.id, 'OWNER');
    const dono2 = await criarUsuario(company.id, 'OWNER');

    await expect(
      removerUsuario({ companyId: company.id, alvoId: dono1.id, quemRemoveId: dono2.id }),
    ).resolves.toBeTruthy();
    expect(await prisma.user.count({ where: { companyId: company.id } })).toBe(1);
  });

  it('nao alcanca usuario de outra empresa', async () => {
    const { company: empresaA } = await createCompanyWithPlan();
    const { company: empresaB } = await createCompanyWithPlan();
    const daA = await criarUsuario(empresaA.id, 'OWNER');
    const daB = await criarUsuario(empresaB.id, 'MEMBER');

    await expect(
      removerUsuario({ companyId: empresaA.id, alvoId: daB.id, quemRemoveId: daA.id }),
    ).rejects.toThrow(/n[ãa]o encontrado/i);

    // E continua existindo na empresa dele.
    expect(await prisma.user.findUnique({ where: { id: daB.id } })).not.toBeNull();
  });

  it('nao deixa mudar o proprio cargo', async () => {
    const { company } = await createCompanyWithPlan();
    const dono = await criarUsuario(company.id, 'OWNER');

    await expect(
      alterarCargo({
        companyId: company.id,
        alvoId: dono.id,
        novoCargo: 'MEMBER',
        quemAlteraId: dono.id,
        cargoDeQuemAltera: 'OWNER',
      }),
    ).rejects.toThrow(/pr[óo]prio cargo/i);
  });

  it('admin nao promove ninguem a proprietario', async () => {
    const { company } = await createCompanyWithPlan();
    await criarUsuario(company.id, 'OWNER');
    const admin = await criarUsuario(company.id, 'ADMIN');
    const membro = await criarUsuario(company.id, 'MEMBER');

    await expect(
      alterarCargo({
        companyId: company.id,
        alvoId: membro.id,
        novoCargo: 'OWNER',
        quemAlteraId: admin.id,
        cargoDeQuemAltera: 'ADMIN',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
