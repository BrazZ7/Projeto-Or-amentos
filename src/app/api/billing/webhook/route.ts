import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const companyId = checkoutSession.metadata?.companyId;
      const planId = checkoutSession.metadata?.planId;
      if (companyId && planId) {
        await prisma.subscription.upsert({
          where: { companyId },
          create: {
            companyId,
            planId,
            status: 'ACTIVE',
            stripeCustomerId: String(checkoutSession.customer || ''),
            stripeSubscriptionId: String(checkoutSession.subscription || ''),
          },
          update: {
            planId,
            status: 'ACTIVE',
            stripeCustomerId: String(checkoutSession.customer || ''),
            stripeSubscriptionId: String(checkoutSession.subscription || ''),
          },
        });
      }
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'past_due' ? 'PAST_DUE' : 'CANCELED',
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: 'CANCELED' },
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
