import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  let dbStatus: 'Connected' | 'Degraded' | 'Offline' = 'Connected';
  let serverStatus: 'Operational' | 'Degraded' | 'Offline' = 'Operational';
  let authStatus: 'Ready' | 'Config Issue' | 'Unavailable' = 'Ready';

  // 1. Verify Database Connectivity
  try {
    // Quick, non-blocking check
    await prisma.$queryRawUnsafe('SELECT 1;');
  } catch (dbErr) {
    console.error('[Auth Diagnostics] Database check failed:', dbErr);
    dbStatus = 'Degraded';
    serverStatus = 'Degraded';
  }

  // 2. Verify Authentication Setup
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 16) {
    console.warn('[Auth Diagnostics] JWT_SECRET missing or insecure');
    authStatus = 'Config Issue';
  }

  const elapsed = Date.now() - start;

  return NextResponse.json({
    success: true,
    serverStatus,
    databaseStatus: dbStatus,
    authStatus,
    latencyMs: elapsed,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}
