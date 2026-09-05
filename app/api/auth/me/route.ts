import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        analysesLimit: true,
        analysesUsed: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Developer account: exempt from all quotas permanently
    if (user.email?.toLowerCase() === 'admettre@gmail.com') {
      user.subscriptionTier = 'AGENCY';
      user.analysesLimit = 999999;
      user.analysesUsed = 0;
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Auth Me API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
