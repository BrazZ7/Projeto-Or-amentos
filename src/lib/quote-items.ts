import { prisma } from '@/lib/prisma';

/**
 * Garante que todo productId informado nos itens de um orçamento pertence à
 * empresa autenticada. Sem essa checagem, uma empresa poderia referenciar o
 * produto de outra e, na aprovação pública, causar baixa de estoque cruzada
 * entre tenants.
 */
export async function assertItemsBelongToCompany(
  companyId: string,
  items: { productId?: string | null }[],
) {
  const productIds = Array.from(
    new Set(items.map((item) => item.productId).filter((id): id is string => !!id)),
  );
  if (productIds.length === 0) return;

  const owned = await prisma.product.count({
    where: { id: { in: productIds }, companyId },
  });

  if (owned !== productIds.length) {
    throw Object.assign(new Error('Um ou mais produtos do orçamento são inválidos.'), {
      status: 422,
    });
  }
}
