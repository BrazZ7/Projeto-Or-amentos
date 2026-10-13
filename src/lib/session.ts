import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export class UnauthorizedError extends Error {
  constructor(message = 'Não autenticado.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Retorna a sessão atual ou lança UnauthorizedError. Toda rota de API que
 * manipula dados de uma empresa deve usar requireSession() e sempre filtrar
 * as consultas Prisma por `companyId`, nunca confiando em IDs vindos do
 * cliente sem essa checagem — é isso que garante o isolamento entre tenants.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function getSession() {
  return getServerSession(authOptions);
}
