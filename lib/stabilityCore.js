/**
 * LeadPilot AI Production Stability Framework Core
 *
 * Implements fault isolation, timeout protection, exponential backoff retries,
 * safe calculation verification, and resilient CRM queueing.
 */

const TIMEOUT_LIMITS = {
  CRAWL_MS: 30000,          // 30 seconds
  AI_ANALYSIS_MS: 60000,    // 60 seconds
  CRM_SYNC_MS: 15000,       // 15 seconds
  PDF_GENERATION_MS: 20000  // 20 seconds
};

const RETRY_CONFIGS = {
  NETWORK: { maxRetries: 3, backoffMs: 300 },
  CRM_SYNC: { maxRetries: 3, backoffMs: 300 },
  AI_CALL: { maxRetries: 2, backoffMs: 500 },
  STORAGE: { maxRetries: 3, backoffMs: 300 }
};

/**
 * Wraps a promise or async function with a strict timeout limit.
 * If the execution exceeds timeoutMs, rejects or returns a formatted timeout error.
 */
function withTimeout(promiseOrFn, timeoutMs, operationName = 'Operation') {
  const promise = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const timeoutError = new Error(`Operation timed out.`);
      timeoutError.code = 'ETIMEDOUT';
      timeoutError.operation = operationName;
      timeoutError.timeoutMs = timeoutMs;
      reject(timeoutError);
    }, timeoutMs);

    promise
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Executes an async function with exponential backoff retries.
 */
async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const backoffMs = options.backoffMs ?? 300;
  const operationName = options.operationName || 'Operation';

  let lastError;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt <= maxRetries) {
        const delay = backoffMs * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  lastError.operation = operationName;
  lastError.totalAttempts = maxRetries + 1;
  throw lastError;
}

/**
 * Fault Isolation Wrapper.
 * Executes a module operation safely. If the operation throws, records the failure,
 * isolates it, and returns the fallbackValue without crashing parent processes.
 */
async function isolateModule(moduleName, operationFn, fallbackValue = null) {
  try {
    const data = await operationFn();
    return {
      success: true,
      module: moduleName,
      data,
      error: null
    };
  } catch (err) {
    const errorDetail = {
      message: err.message || 'Module execution failed.',
      code: err.code || 'MODULE_ERROR',
      module: moduleName,
      timestamp: new Date().toISOString()
    };
    return {
      success: false,
      module: moduleName,
      data: fallbackValue,
      error: errorDetail
    };
  }
}

/**
 * Safe Calculation Guard.
 * Refuses to calculate if pricing model is missing, evidence is empty, or confidence is invalid.
 */
function validateCalculationInputs(pricingModel, evidence, confidence) {
  if (!pricingModel || typeof pricingModel !== 'object') {
    return {
      isValid: false,
      status: 'Calculation Unavailable',
      reason: 'Pricing model not specified or unavailable.'
    };
  }

  if (!evidence || (Array.isArray(evidence) && evidence.length === 0)) {
    return {
      isValid: false,
      status: 'Calculation Unavailable',
      reason: 'Verified evidence is insufficient or missing.'
    };
  }

  if (typeof confidence !== 'number' || confidence < 50 || confidence > 100) {
    return {
      isValid: false,
      status: 'Calculation Unavailable',
      reason: 'Confidence score is below minimum reliability threshold (50%).'
    };
  }

  return {
    isValid: true,
    status: 'Ready',
    reason: null
  };
}

/**
 * Resilient CRM Sync Queue.
 * Keeps track of pending sync requests when external CRMs (HubSpot, Salesforce) are unavailable.
 */
class CRMQueueManager {
  constructor() {
    this.queue = [];
  }

  enqueue(syncItem) {
    const item = {
      id: syncItem.id || `sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      prospectId: syncItem.prospectId,
      crmType: syncItem.crmType || 'HubSpot',
      payload: syncItem.payload || {},
      status: 'Sync Pending',
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date().toISOString(),
      lastAttemptAt: null,
      lastError: null
    };
    this.queue.push(item);
    return item;
  }

  getPending() {
    return this.queue.filter(i => i.status === 'Sync Pending' && i.attempts < i.maxAttempts);
  }

  markSuccess(id) {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.status = 'Synced';
      item.syncedAt = new Date().toISOString();
    }
    return item;
  }

  markFailed(id, error) {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.attempts += 1;
      item.lastAttemptAt = new Date().toISOString();
      item.lastError = error?.message || 'CRM sync error';
      if (item.attempts >= item.maxAttempts) {
        item.status = 'Sync Failed (Max Retries)';
      } else {
        item.status = 'Sync Pending';
      }
    }
    return item;
  }
}

const crmQueue = new CRMQueueManager();

module.exports = {
  TIMEOUT_LIMITS,
  RETRY_CONFIGS,
  withTimeout,
  withRetry,
  isolateModule,
  validateCalculationInputs,
  crmQueue,
  CRMQueueManager
};
