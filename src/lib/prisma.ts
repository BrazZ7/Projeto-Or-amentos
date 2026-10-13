import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cliente único do Prisma, reaproveitado em todos os ambientes.
 *
 * Guardar no global também em produção é o que faz a aplicação sobreviver em
 * serverless: cada rota é um pacote separado, e sem isto o mesmo processo
 * acabaria com vários clientes, cada um com seu pool. Num pico de acesso isso
 * esgota o limite de conexões do banco e as requisições começam a falhar.
 *
 * Em desenvolvimento ele resolve outro problema: o hot reload reavalia o
 * módulo a cada alteração e iria acumulando clientes até travar.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;
