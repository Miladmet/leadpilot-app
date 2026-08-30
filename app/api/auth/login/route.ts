import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { serialize } from 'cookie';
import { classifyLoginFailure, formatDevDiagnostics } from '@/lib/authDiagnostics';

const isDev = process.env.NODE_ENV !== 'production';

export async function POST(req: NextRequest) {
  let email = '';
  let password = '';

  try {
    const body = await req.json();
    email = body.email || '';
    password = body.password || '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Look up user by email
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbErr: any) {
      const diag = classifyLoginFailure({ user: null, dbError: dbErr, isDbConnected: false });
      console.error('[Auth Failure Diagnostics]:', {
        classification: diag.classification,
        userExists: diag.userExists,
        authProviderReachable: diag.authProviderReachable,
        databaseConnected: diag.databaseConnected,
        timestamp: diag.timestamp
      });

      return NextResponse.json(
        {
          error: 'The authentication service encountered an unexpected error. Please retry.',
          ...(isDev ? { devDiagnostics: formatDevDiagnostics(diag) } : {})
        },
        { status: 500 }
      );
    }

    // 2. Evaluate password match safely
    let passwordMatches = false;
    let authErrorOccurred = false;

    if (user) {
      try {
        passwordMatches = comparePassword(password, user.passwordHash);
      } catch (authErr: any) {
        authErrorOccurred = true;
        console.error('[Auth Provider Evaluation Error]:', authErr);
      }
    }

    // 3. Handle Failure Cases
    if (!user || !passwordMatches || authErrorOccurred) {
      const diag = classifyLoginFailure({
        user,
        passwordMatches,
        isDbConnected: true,
        isAuthServiceReachable: !authErrorOccurred,
        authError: authErrorOccurred ? new Error('Password hash comparison failed') : null
      });

      // Internal structured logging - NEVER return generic 401 messages internally
      console.error('[Auth Failure Diagnostics]:', {
        classification: diag.classification,
        userExists: diag.userExists,
        authProviderReachable: diag.authProviderReachable,
        databaseConnected: diag.databaseConnected,
        timestamp: diag.timestamp
      });

      // Production users always receive standard message without sensitive details
      const responsePayload: any = {
        error: 'The email or password you entered is incorrect.'
      };

      // Development mode includes devDiagnostics for troubleshooting
      if (isDev) {
        responsePayload.devDiagnostics = formatDevDiagnostics(diag);
      }

      return NextResponse.json(responsePayload, { status: 401 });
    }

    // 4. Successful Authentication
    const token = signToken({ userId: user.id, email: user.email });

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
    const diag = classifyLoginFailure({
      user: null,
      authError: error,
      isAuthServiceReachable: false
    });

    console.error('[Auth Failure Diagnostics]:', {
      classification: diag.classification,
      userExists: diag.userExists,
      authProviderReachable: diag.authProviderReachable,
      databaseConnected: diag.databaseConnected,
      timestamp: diag.timestamp
    });

    return NextResponse.json(
      {
        error: 'The authentication service encountered an unexpected error. Please retry.',
        ...(isDev ? { devDiagnostics: formatDevDiagnostics(diag) } : {})
      },
      { status: 500 }
    );
  }
}
