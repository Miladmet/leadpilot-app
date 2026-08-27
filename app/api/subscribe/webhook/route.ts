import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } else {
      // Local development fallback / testing without Stripe CLI signature
      console.warn('Stripe Webhook Signature verification skipped. Reading raw payload.');
      event = JSON.parse(payload);
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data?.object;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription;

        if (userId && tier) {
          const analysesLimit = tier === 'AGENCY' ? 999999 : 200;

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: stripeCustomerId as string,
              stripeSubscriptionId: stripeSubscriptionId as string,
              subscriptionTier: tier,
              subscriptionStatus: 'active',
              analysesLimit,
            },
          });

          await prisma.activityLog.create({
            data: {
              userId,
              action: 'SUBSCRIBED',
              details: `Upgraded to subscription tier ${tier}`,
            },
          });

          console.log(`User ${userId} successfully upgraded to ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSubscriptionId = session.id;
        const status = session.status;
        const priceId = session.items?.data[0]?.price?.id;

        let tier = 'FREE';
        let analysesLimit = 10;
        if (priceId === process.env.STRIPE_PRICE_PRO) {
          tier = 'PRO';
          analysesLimit = 200;
        } else if (priceId === process.env.STRIPE_PRICE_AGENCY) {
          tier = 'AGENCY';
          analysesLimit = 999999;
        }

        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: status,
              subscriptionTier: status === 'active' ? tier : 'FREE',
              analysesLimit: status === 'active' ? analysesLimit : 10,
            },
          });

          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'SUBSCRIPTION_UPDATED',
              details: `Stripe subscription status updated to: ${status} (tier: ${tier})`,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSubscriptionId = session.id;
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: 'FREE',
              subscriptionStatus: 'canceled',
              analysesLimit: 10,
              stripeSubscriptionId: null,
            },
          });

          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'SUBSCRIPTION_CANCELED',
              details: 'Stripe subscription canceled. Downgraded to FREE tier.',
            },
          });

          console.log(`User ${user.id} subscription canceled.`);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
