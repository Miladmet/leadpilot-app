import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    if (tier !== 'PRO' && tier !== 'AGENCY') {
      return NextResponse.json({ error: 'Invalid subscription tier selected' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine base URL origin
    const urlObj = new URL(req.url);
    const origin = `${urlObj.protocol}//${urlObj.host}`;

    const session = await createCheckoutSession(user.id, user.email, tier, origin);

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
