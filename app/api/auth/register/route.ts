import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'active',
        analysesLimit: 10,
        analysesUsed: 0,
        resetDate: new Date(),
      },
    });

    // Write log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTERED',
        details: `User registered account with email ${email}`,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        analysesLimit: user.analysesLimit,
        analysesUsed: user.analysesUsed,
      },
    });

    response.headers.append(
      'Set-Cookie',
      serialize('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      })
    );

    return response;
  } catch (error: any) {
    console.error('[Auth API] Registration exception:', {
      message: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: 'The registration service encountered an unexpected error. Please retry.' },
      { status: 500 }
    );
  }
}
