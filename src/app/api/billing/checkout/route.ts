import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/rbac';
import { handleApiError } from '@/lib/api-utils';
import { getStripe } from '@/lib/stripe';

const schema = z.object({ planId: z.string().min(1) });

/**
 * Cria uma sessão de checkout do Stripe para o plano escolhido. Requer que o
 * plano tenha um `stripePriceId` configurado e que STRIPE_SECRET_KEY esteja
 * definido no ambiente. O webhook em /api/billing/webhook atualiza a
 * assinatura da empresa quando o pagamento é confirmado.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole('OWNER');
    const { planId } = schema.parse(await request.json());

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado.' }, { status: 404 });
    }
    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Este plano ainda não possui cobrança recorrente configurada.' },
        { status: 422 },
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      client_reference_id: session.user.companyId,
      metadata: { companyId: session.user.companyId, planId: plan.id },
      success_url: `${appUrl}/dashboard/settings/plan?checkout=success`,
      cancel_url: `${appUrl}/dashboard/settings/plan?checkout=canceled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return handleApiError(error);
  }
}
