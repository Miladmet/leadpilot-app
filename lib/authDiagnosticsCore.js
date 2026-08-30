/**
 * LeadPilot AI Authentication Diagnostics Core
 *
 * Classifies login failures into:
 * 1. USER_NOT_FOUND
 * 2. INVALID_PASSWORD
 * 3. ACCOUNT_DISABLED
 * 4. EMAIL_NOT_VERIFIED
 * 5. AUTH_PROVIDER_ERROR
 * 6. DATABASE_CONNECTION_ERROR
 *
 * Produces structured internal server logs:
 * {
 *   classification,
 *   userExists,
 *   authProviderReachable,
 *   databaseConnected,
 *   timestamp
 * }
 *
 * And formats Development Diagnostics panels for development mode only.
 */

const AUTH_FAILURE_TYPES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  AUTH_PROVIDER_ERROR: 'AUTH_PROVIDER_ERROR',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR'
};

/**
 * Classifies an authentication failure based on user status, password check, and database health.
 */
function classifyLoginFailure({ user, passwordMatches, isDbConnected = true, isAuthServiceReachable = true, dbError = null, authError = null }) {
  if (!isDbConnected || dbError) {
    return {
      classification: AUTH_FAILURE_TYPES.DATABASE_CONNECTION_ERROR,
      userExists: false,
      authProviderReachable: isAuthServiceReachable,
      databaseConnected: false,
      timestamp: new Date().toISOString()
    };
  }

  if (authError || !isAuthServiceReachable) {
    return {
      classification: AUTH_FAILURE_TYPES.AUTH_PROVIDER_ERROR,
      userExists: !!user,
      authProviderReachable: false,
      databaseConnected: true,
      timestamp: new Date().toISOString()
    };
  }

  if (!user) {
    return {
      classification: AUTH_FAILURE_TYPES.USER_NOT_FOUND,
      userExists: false,
      authProviderReachable: true,
      databaseConnected: true,
      timestamp: new Date().toISOString()
    };
  }

  if (user.subscriptionStatus === 'disabled' || user.subscriptionStatus === 'suspended' || user.disabled === true) {
    return {
      classification: AUTH_FAILURE_TYPES.ACCOUNT_DISABLED,
      userExists: true,
      authProviderReachable: true,
      databaseConnected: true,
      timestamp: new Date().toISOString()
    };
  }

  if (user.emailVerified === false) {
    return {
      classification: AUTH_FAILURE_TYPES.EMAIL_NOT_VERIFIED,
      userExists: true,
      authProviderReachable: true,
      databaseConnected: true,
      timestamp: new Date().toISOString()
    };
  }

  if (!passwordMatches) {
    return {
      classification: AUTH_FAILURE_TYPES.INVALID_PASSWORD,
      userExists: true,
      authProviderReachable: true,
      databaseConnected: true,
      timestamp: new Date().toISOString()
    };
  }

  return {
    classification: AUTH_FAILURE_TYPES.AUTH_PROVIDER_ERROR,
    userExists: true,
    authProviderReachable: true,
    databaseConnected: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Formats the development diagnostics payload.
 */
function formatDevDiagnostics(diag) {
  return {
    classification: diag.classification,
    environment: 'Development',
    database: diag.databaseConnected ? 'Connected' : 'Disconnected',
    authService: diag.authProviderReachable ? 'Reachable' : 'Unreachable',
    userRecord: diag.userExists ? 'Found' : 'Not Found',
    timestamp: diag.timestamp
  };
}

module.exports = {
  AUTH_FAILURE_TYPES,
  classifyLoginFailure,
  formatDevDiagnostics
};
