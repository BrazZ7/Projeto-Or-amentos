import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'Pagamentos indisponíveis: configure STRIPE_SECRET_KEY para habilitar assinaturas recorrentes.',
    );
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
  return stripe;
}
