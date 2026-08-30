export type AuthErrorCategory = 
  | 'INVALID_CREDENTIALS' 
  | 'NETWORK_ERROR' 
  | 'BACKEND_ERROR' 
  | 'SERVICE_OUTAGE' 
  | 'VALIDATION_ERROR' 
  | 'UNKNOWN';

export interface ClassifiedAuthError {
  category: AuthErrorCategory;
  userMessage: string;
  actionHint?: string;
  isRetryable: boolean;
  technicalDetails?: string;
}

export interface AuthDiagnosticsData {
  serverStatus: 'Operational' | 'Degraded' | 'Offline';
  databaseStatus: 'Connected' | 'Degraded' | 'Offline';
  authStatus: 'Ready' | 'Config Issue' | 'Unavailable';
  latencyMs: number;
  timestamp: string;
  environment?: string;
}

/**
 * Classifies raw client or server errors into user-friendly categories.
 * Ensures raw exceptions, stack traces, or database errors are NEVER displayed to users.
 */
export function classifyAuthError(err: any, responseStatus?: number): ClassifiedAuthError {
  const rawMsg = err?.message || (typeof err === 'string' ? err : '');
  const lowerMsg = rawMsg.toLowerCase();

  // 1. Network / Connectivity Errors (e.g. Safari "Load failed", Chrome "Failed to fetch", offline)
  if (
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('load failed') ||
    lowerMsg.includes('networkerror') ||
    lowerMsg.includes('network error') ||
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('etimedout') ||
    lowerMsg.includes('offline') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return {
      category: 'NETWORK_ERROR',
      userMessage: 'Unable to connect to the LeadPilot server.',
      actionHint: 'Please check your internet connection or try again in a few moments.',
      isRetryable: true,
      technicalDetails: rawMsg
    };
  }

  // 2. Service Outages / Gateways (HTTP 502, 503, 504)
  if (responseStatus === 502 || responseStatus === 503 || responseStatus === 504 || lowerMsg.includes('gateway') || lowerMsg.includes('service unavailable')) {
    return {
      category: 'SERVICE_OUTAGE',
      userMessage: 'LeadPilot authentication services are temporarily undergoing maintenance.',
      actionHint: 'Our systems are reconnecting. Please retry in a few seconds.',
      isRetryable: true,
      technicalDetails: `HTTP Status ${responseStatus || 'Outage'}: ${rawMsg}`
    };
  }

  // 3. Backend / Database / Server Errors (HTTP 500)
  if (responseStatus === 500 || lowerMsg.includes('internal server error') || lowerMsg.includes('prisma') || lowerMsg.includes('database')) {
    return {
      category: 'BACKEND_ERROR',
      userMessage: 'The authentication service encountered an unexpected issue.',
      actionHint: 'Your account is secure. Please click Retry Connection to re-authenticate.',
      isRetryable: true,
      technicalDetails: rawMsg
    };
  }

  // 4. Invalid Credentials (HTTP 401)
  if (responseStatus === 401 || lowerMsg.includes('invalid email or password') || lowerMsg.includes('invalid credentials') || lowerMsg.includes('unauthorized')) {
    return {
      category: 'INVALID_CREDENTIALS',
      userMessage: 'The email or password you entered is incorrect.',
      actionHint: 'Please double-check your spelling or reset your password.',
      isRetryable: false,
      technicalDetails: 'HTTP 401 Unauthorized'
    };
  }

  // 5. Validation Errors (HTTP 400)
  if (responseStatus === 400 || lowerMsg.includes('already exists') || lowerMsg.includes('password') || lowerMsg.includes('required')) {
    return {
      category: 'VALIDATION_ERROR',
      userMessage: rawMsg.includes('already exists') 
        ? 'An account with this email address already exists.' 
        : (rawMsg || 'Please verify your information meets all requirements.'),
      actionHint: rawMsg.includes('already exists') ? 'Please sign in or use a different email.' : 'Review the highlighted fields above.',
      isRetryable: false,
      technicalDetails: rawMsg
    };
  }

  // 6. Generic Safe Fallback (never leak raw exception text)
  return {
    category: 'UNKNOWN',
    userMessage: 'Sign in could not be completed at this time.',
    actionHint: 'Please check your connection and click Retry.',
    isRetryable: true,
    technicalDetails: rawMsg
  };
}

/**
 * Validates password length and format rules safely.
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
}

/**
 * Fetches real-time diagnostics from the authentication platform.
 */
export async function fetchAuthDiagnostics(): Promise<AuthDiagnosticsData> {
  const start = Date.now();
  try {
    const res = await fetch('/api/auth/diagnostics', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const elapsed = Date.now() - start;
    if (!res.ok) {
      return {
        serverStatus: 'Degraded',
        databaseStatus: 'Degraded',
        authStatus: 'Config Issue',
        latencyMs: elapsed,
        timestamp: new Date().toISOString()
      };
    }
    const data = await res.json();
    return {
      ...data,
      latencyMs: elapsed
    };
  } catch (err) {
    const elapsed = Date.now() - start;
    return {
      serverStatus: 'Offline',
      databaseStatus: 'Offline',
      authStatus: 'Unavailable',
      latencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }
}
