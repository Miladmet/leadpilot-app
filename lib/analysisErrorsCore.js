/**
 * LeadPilot AI Analysis Error Classification Core
 *
 * Classifies errors into retryable vs non-retryable categories:
 * - SCHEMA_MISMATCH: Prisma P2021/P2022 schema drift (NON-RETRYABLE)
 * - NETWORK_TIMEOUT: Timeouts and delays (RETRYABLE)
 * - NETWORK_FAILURE: Connection refused or offline (RETRYABLE)
 * - TEMPORARY_SERVICE_DISRUPTION: 429 rate limits, 502/503 (RETRYABLE)
 * - CONFIGURATION_ERROR: Invalid API keys or permissions (NON-RETRYABLE)
 * - GENERAL_ANALYSIS_ERROR: Scraping defenses, blocked access (NON-RETRYABLE)
 *
 * Strictly suppresses "Retry" recommendations for schema drift and non-retryable issues.
 */

const ANALYSIS_ERROR_CODES = {
  SCHEMA_MISMATCH: 'SCHEMA_MISMATCH',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_FAILURE: 'NETWORK_FAILURE',
  TEMPORARY_SERVICE_DISRUPTION: 'TEMPORARY_SERVICE_DISRUPTION',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  GENERAL_ANALYSIS_ERROR: 'GENERAL_ANALYSIS_ERROR'
};

/**
 * Extracts table or column information from Prisma P2021 / P2022 error messages.
 */
function extractPrismaDetails(err) {
  const message = err?.message || String(err || '');
  const code = err?.code || (message.includes('P2021') ? 'P2021' : message.includes('P2022') ? 'P2022' : 'SCHEMA_MISMATCH');
  
  let model = 'Prospect';
  let missingItem = 'Unknown';

  if (code === 'P2021') {
    const tableMatch = message.match(/table [`"](?:public\.)?([^`"]+)[`"]/i);
    if (tableMatch) {
      model = tableMatch[1];
      missingItem = tableMatch[1];
    }
  }

  if (code === 'P2022') {
    const colMatch = message.match(/column [`"]([^`"]+)[`"]/i);
    if (colMatch) {
      const full = colMatch[1];
      const parts = full.split('.');
      if (parts.length > 1) {
        model = parts[0].replace(/^public\./i, '');
        missingItem = parts[1];
      } else {
        missingItem = parts[0];
      }
    }
  }

  return {
    prismaErrorCode: code,
    model,
    missingItem,
    migrationStatus: 'Pending Migration'
  };
}

/**
 * Classifies an error into a structured, user-friendly, and developer-actionable payload.
 */
function classifyAnalysisError(err) {
  const message = err?.message || (typeof err === 'string' ? err : '');
  const lowerMsg = message.toLowerCase();
  const code = err?.code || '';

  // 1. SCHEMA_MISMATCH (Prisma P2021 & P2022)
  if (
    code === 'P2021' ||
    code === 'P2022' ||
    lowerMsg.includes('p2021') ||
    lowerMsg.includes('p2022') ||
    lowerMsg.includes('schema mismatch') ||
    lowerMsg.includes('does not exist in the current database')
  ) {
    const adminDetails = extractPrismaDetails(err);
    return {
      classification: ANALYSIS_ERROR_CODES.SCHEMA_MISMATCH,
      isRetryable: false,
      referenceCode: 'SCHEMA_MISMATCH',
      userMessage: 'Analysis could not be saved because the application and database schemas are out of sync.\n\nThis issue cannot be resolved by retrying.',
      adminDetails,
      httpStatus: 500
    };
  }

  // 2. NETWORK_TIMEOUT (ETIMEDOUT, 504, timeout) -> RETRYABLE
  if (
    lowerMsg.includes('etimedout') ||
    lowerMsg.includes('esockettimedout') ||
    lowerMsg.includes('timed out') ||
    lowerMsg.includes('timeout') ||
    err?.status === 504
  ) {
    return {
      classification: ANALYSIS_ERROR_CODES.NETWORK_TIMEOUT,
      isRetryable: true,
      referenceCode: 'NETWORK_TIMEOUT',
      userMessage: 'The website took too long to respond. The host may be slow. Please retry the analysis.',
      httpStatus: 504
    };
  }

  // 3. NETWORK_FAILURE (ECONNREFUSED, ENOTFOUND, network error) -> RETRYABLE
  if (
    lowerMsg.includes('econnrefused') ||
    lowerMsg.includes('enotfound') ||
    lowerMsg.includes('failed to fetch') ||
    lowerMsg.includes('network error') ||
    lowerMsg.includes('offline')
  ) {
    return {
      classification: ANALYSIS_ERROR_CODES.NETWORK_FAILURE,
      isRetryable: true,
      referenceCode: 'NETWORK_FAILURE',
      userMessage: 'A network connectivity issue occurred. Please retry in a few moments.',
      httpStatus: 503
    };
  }

  // 4. TEMPORARY_SERVICE_DISRUPTION (429 Rate limits, 502/503 gateway) -> RETRYABLE
  if (
    lowerMsg.includes('429') ||
    lowerMsg.includes('quota') ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('resource_exhausted') ||
    lowerMsg.includes('502') ||
    lowerMsg.includes('503') ||
    lowerMsg.includes('service unavailable') ||
    lowerMsg.includes('bad gateway')
  ) {
    return {
      classification: ANALYSIS_ERROR_CODES.TEMPORARY_SERVICE_DISRUPTION,
      isRetryable: true,
      referenceCode: 'SERVICE_DISRUPTION',
      userMessage: 'Service temporarily busy or rate limited. Please retry in 30-60 seconds.',
      httpStatus: 429
    };
  }

  // 5. CONFIGURATION_ERROR (API Key invalid, 403) -> NON-RETRYABLE
  if (
    lowerMsg.includes('api_key') ||
    lowerMsg.includes('api key') ||
    lowerMsg.includes('invalid key') ||
    lowerMsg.includes('unauthorized') ||
    err?.status === 403
  ) {
    return {
      classification: ANALYSIS_ERROR_CODES.CONFIGURATION_ERROR,
      isRetryable: false,
      referenceCode: 'CONFIGURATION_ERROR',
      userMessage: 'Invalid Google Gemini API key or credentials. Please check your environment configuration.',
      httpStatus: 403
    };
  }

  // 6. GENERAL_ANALYSIS_ERROR (Scraping defenses, bot blocks) -> NON-RETRYABLE
  return {
    classification: ANALYSIS_ERROR_CODES.GENERAL_ANALYSIS_ERROR,
    isRetryable: false,
    referenceCode: 'ANALYSIS_ERROR',
    userMessage: 'Opportunity analysis failed. The website may have strong scraping protections or bot defenses.',
    httpStatus: 500
  };
}

module.exports = {
  ANALYSIS_ERROR_CODES,
  extractPrismaDetails,
  classifyAnalysisError
};
