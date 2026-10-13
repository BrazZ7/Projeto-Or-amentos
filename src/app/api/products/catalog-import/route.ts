import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/session';
import { handleApiError } from '@/lib/api-utils';
import { PlanLimitError } from '@/lib/plan-limits';
import { getCatalogItems } from '@/lib/catalog';

const schema = z.object({ ids: z.array(z.string()).min(1, 'Selecione ao menos um item.') });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const companyId = session.user.companyId;
    const { ids } = schema.parse(await request.json());

    const items = getCatalogItems(ids);
    if (items.length === 0) {
      return NextResponse.json({ error: 'Nenhum item válido selecionado.' }, { status: 422 });
    }

    // Importar de novo o mesmo item não pode duplicar o cadastro. O código é a
    // chave prática: quem já importou "CAB-FLX-25-SIL" tem esse produto.
    const existing = await prisma.product.findMany({
      where: { companyId, code: { in: items.map((item) => item.code) } },
      select: { code: true },
    });
    const alreadyHave = new Set(existing.map((product) => product.code));
    const toCreate = items.filter((item) => !alreadyHave.has(item.code));

    if (toCreate.length === 0) {
      return NextResponse.json({ imported: 0, skipped: items.length });
    }

    // O limite do plano é conferido para o lote inteiro, não item a item:
    // assertWithinPlanLimit valida uma unidade por vez e deixaria passar uma
    // importação que estoura o teto.
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { plan: true },
    });
    if (subscription) {
      const current = await prisma.product.count({ where: { companyId } });
      if (current + toCreate.length > subscription.plan.maxProducts) {
        const remaining = Math.max(0, subscription.plan.maxProducts - current);
        throw new PlanLimitError(
          `Seu plano ${subscription.plan.name} permite ${subscription.plan.maxProducts} produtos e você tem ${current}. ` +
            (remaining > 0
              ? `Selecione no máximo ${remaining} ${remaining === 1 ? 'item' : 'itens'} ou faça upgrade.`
              : 'Faça upgrade do seu plano para importar mais.'),
        );
      }
    }

    const created = await prisma.product.createMany({
      data: toCreate.map((item) => ({
        companyId,
        name: item.name,
        code: item.code,
        description: item.description,
        category: item.brand,
        unit: item.unit,
        // Preço fica zerado: o catálogo não sugere valor, quem define é a
        // empresa. Estoque também nasce zerado — ter o item cadastrado não
        // significa ter o item em mãos; entrada é movimentação à parte.
        price: 0,
        cost: 0,
        trackStock: true,
        ncm: item.ncm,
      })),
    });

    return NextResponse.json({
      imported: created.count,
      skipped: items.length - toCreate.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
