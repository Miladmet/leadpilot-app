import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2024-06-20' as any,
});

// Configure these Stripe Price IDs in your Stripe Dashboard for live environments.
// We provide fallback strings.
export const STRIPE_PRICES = {
  PRO: process.env.STRIPE_PRICE_PRO || 'price_mock_pro_29',
  AGENCY: process.env.STRIPE_PRICE_AGENCY || 'price_mock_agency_79',
};

export async function createCheckoutSession(userId: string, email: string, tier: 'PRO' | 'AGENCY', origin: string) {
  const priceId = STRIPE_PRICES[tier];

  // In mock mode (if secret key is default) we just return a simulated redirect URL
  if (stripeSecret === 'sk_test_mock') {
    return {
      url: `${origin}/dashboard?mock_payment=success&tier=${tier}`,
    };
  }

  // Create or retrieve Stripe Customer
  // Usually we search for user by email first or look up in Stripe. To keep it simple:
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      tier,
    },
    customer_email: email,
    success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard?payment=cancel`,
  });

  return session;
}

export async function createPortalSession(stripeCustomerId: string, origin: string) {
  if (stripeSecret === 'sk_test_mock') {
    return {
      url: `${origin}/dashboard?mock_portal=success`,
    };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${origin}/dashboard`,
  });

  return session;
}
