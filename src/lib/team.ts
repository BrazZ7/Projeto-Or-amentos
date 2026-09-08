import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { PlanLimitError } from '@/lib/plan-limits';
import { ForbiddenError, hasRole, type Role } from '@/lib/rbac';

/** Sete dias: tempo de sobra para alguém ver o e-mail, sem deixar link válido para sempre. */
const VALIDADE_DIAS = 7;

export class TeamError extends Error {
  constructor(
    message: string,
    readonly status = 422,
  ) {
    super(message);
  }
}

/**
 * Confere se ainda cabe mais uma pessoa no plano.
 *
 * Convite pendente conta como vaga ocupada. Sem isso, dez convites enviados de
 * uma vez estouram o limite quando todos aceitarem — e aí não há o que fazer
 * senão remover alguém que já entrou.
 */
export async function assertCabeMaisUmUsuario(companyId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });

  // Empresa sem assinatura não é barrada, como no resto das regras de plano.
  if (!subscription) return;

  const [usuarios, convites] = await Promise.all([
    prisma.user.count({ where: { companyId } }),
    prisma.invitation.count({ where: { companyId, acceptedAt: null, expiresAt: { gt: new Date() } } }),
  ]);

  const ocupadas = usuarios + convites;
  if (ocupadas >= subscription.plan.maxUsers) {
    throw new PlanLimitError(
      `Seu plano ${subscription.plan.name} permite ${subscription.plan.maxUsers} ` +
        `${subscription.plan.maxUsers === 1 ? 'usuário' : 'usuários'} e você já usa ${ocupadas} ` +
        `(${usuarios} na equipe, ${convites} ${convites === 1 ? 'convite pendente' : 'convites pendentes'}). ` +
        'Remova alguém, cancele um convite ou faça upgrade.',
    );
  }
}

/**
 * Quem convida não pode dar um cargo acima do seu.
 *
 * Sem essa regra um ADMIN promoveria alguém a OWNER e, por tabela, ganharia
 * acesso a plano e cobrança — que é justamente o que o cargo dele não alcança.
 */
export function assertPodeAtribuirCargo(cargoDeQuemConvida: string, cargoAlvo: Role) {
  if (!hasRole(cargoDeQuemConvida, cargoAlvo)) {
    throw new ForbiddenError('Você não pode dar um cargo acima do seu.');
  }
}

export async function criarConvite({
  companyId,
  email,
  role,
  invitedById,
  cargoDeQuemConvida,
}: {
  companyId: string;
  email: string;
  role: Role;
  invitedById: string;
  cargoDeQuemConvida: string;
}) {
  const destinatario = email.trim().toLowerCase();

  assertPodeAtribuirCargo(cargoDeQuemConvida, role);

  // E-mail é único no sistema inteiro (User.email @unique), então convidar
  // alguém que já tem conta em outra empresa nunca daria certo — melhor dizer
  // isso agora do que deixar quebrar no aceite.
  const jaTemConta = await prisma.user.findUnique({
    where: { email: destinatario },
    select: { companyId: true },
  });
  if (jaTemConta) {
    throw new TeamError(
      jaTemConta.companyId === companyId
        ? 'Essa pessoa já faz parte da sua equipe.'
        : 'Esse e-mail já tem conta no sistema e não pode ser convidado.',
    );
  }

  await assertCabeMaisUmUsuario(companyId);

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + VALIDADE_DIAS * 24 * 60 * 60 * 1000);

  // Reconvidar substitui o convite anterior: dois links válidos para a mesma
  // pessoa só criam confusão sobre qual vale.
  return prisma.invitation.upsert({
    where: { companyId_email: { companyId, email: destinatario } },
    create: { companyId, email: destinatario, role, token, expiresAt, invitedById },
    update: { role, token, expiresAt, invitedById, acceptedAt: null, acceptedById: null },
  });
}

/** Busca um convite pelo token, recusando o que não serve mais. */
export async function buscarConviteValido(token: string) {
  const convite = await prisma.invitation.findUnique({
    where: { token },
    include: { company: { select: { legalName: true, tradeName: true } } },
  });

  if (!convite) throw new TeamError('Convite não encontrado.', 404);
  if (convite.acceptedAt) throw new TeamError('Este convite já foi usado.', 410);
  if (convite.expiresAt < new Date()) throw new TeamError('Este convite expirou.', 410);

  return convite;
}

/**
 * Remove alguém da equipe.
 *
 * Duas travas: ninguém remove a si mesmo — quem quer sair pede a outro
 * administrador, senão uma empresa fica sem dono por engano — e a última conta
 * OWNER não pode sair, ou a empresa perde acesso a plano e cobrança para sempre.
 */
export async function removerUsuario({
  companyId,
  alvoId,
  quemRemoveId,
}: {
  companyId: string;
  alvoId: string;
  quemRemoveId: string;
}) {
  if (alvoId === quemRemoveId) {
    throw new TeamError('Você não pode remover a si mesmo. Peça a outro administrador.');
  }

  const alvo = await prisma.user.findFirst({ where: { id: alvoId, companyId } });
  if (!alvo) throw new TeamError('Usuário não encontrado nesta empresa.', 404);

  if (alvo.role === 'OWNER') {
    const donos = await prisma.user.count({ where: { companyId, role: 'OWNER' } });
    if (donos <= 1) {
      throw new TeamError('A empresa precisa de pelo menos um proprietário.');
    }
  }

  await prisma.user.delete({ where: { id: alvoId } });
  return alvo;
}

/** Troca o cargo de alguém, com as mesmas travas de quem pode o quê. */
export async function alterarCargo({
  companyId,
  alvoId,
  novoCargo,
  quemAlteraId,
  cargoDeQuemAltera,
}: {
  companyId: string;
  alvoId: string;
  novoCargo: Role;
  quemAlteraId: string;
  cargoDeQuemAltera: string;
}) {
  if (alvoId === quemAlteraId) {
    throw new TeamError('Você não pode mudar o próprio cargo.');
  }

  assertPodeAtribuirCargo(cargoDeQuemAltera, novoCargo);

  const alvo = await prisma.user.findFirst({ where: { id: alvoId, companyId } });
  if (!alvo) throw new TeamError('Usuário não encontrado nesta empresa.', 404);

  // Rebaixar quem é OWNER esbarra na mesma trava da remoção.
  if (alvo.role === 'OWNER' && novoCargo !== 'OWNER') {
    const donos = await prisma.user.count({ where: { companyId, role: 'OWNER' } });
    if (donos <= 1) {
      throw new TeamError('A empresa precisa de pelo menos um proprietário.');
    }
  }

  return prisma.user.update({ where: { id: alvoId }, data: { role: novoCargo } });
}
