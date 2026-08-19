import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export class ForbiddenError extends Error {
  constructor(message = 'Você não tem permissão para esta ação.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Hierarquia de cargos. É acumulativa: quem é ADMIN faz tudo que MEMBER faz.
 *
 * O corte segue o dano que a ação causa se feita por engano ou por quem não
 * deveria. Trabalho do dia a dia — orçamento, cliente, produto, estoque — é de
 * todo mundo, senão a equipe não opera. Já mexer na identidade da empresa, nos
 * modelos de documento ou emitir nota fiscal afeta o que sai para o cliente e o
 * que vale perante o fisco. Plano e assinatura mexem em dinheiro e ficam só com
 * o dono.
 */
export const ROLE_RANK = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
} as const;

export type Role = keyof typeof ROLE_RANK;

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
};

function rankOf(role: string | undefined) {
  return ROLE_RANK[(role as Role) ?? 'MEMBER'] ?? ROLE_RANK.MEMBER;
}

export function hasRole(role: string | undefined, minimum: Role) {
  return rankOf(role) >= ROLE_RANK[minimum];
}

/**
 * Igual a requireSession, mas também exige um cargo mínimo. Retorna a sessão
 * para a rota seguir usando companyId — o isolamento por empresa continua
 * valendo em cima disso, não no lugar dele.
 *
 * O cargo vem do banco, não do JWT. O token é assinado no login e continua
 * dizendo o cargo antigo até a sessão ser renovada; quem for rebaixado
 * continuaria emitindo nota fiscal até resolver sair e entrar de novo. Uma
 * busca por chave primária, só nas rotas que alteram algo, paga esse risco.
 */
export async function requireRole(minimum: Role) {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !hasRole(user.role, minimum)) {
    throw new ForbiddenError(
      minimum === 'OWNER'
        ? 'Apenas o proprietário da conta pode fazer isso.'
        : 'Esta ação é restrita a administradores da conta.',
    );
  }

  return session;
}
