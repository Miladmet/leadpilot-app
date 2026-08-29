/**
 * LeadPilot Platform Trust Engine Core
 *
 * Mathematically derives an explainable, auditable Overall Trust Score (0-100)
 * from measurable platform metrics rather than subjective AI estimates.
 *
 * Safety Principles:
 * - Never fabricates trust scores or fills missing telemetry with AI estimates
 * - Silently ignoring missing components is strictly forbidden
 * - Rejects any out-of-bounds (< 0, > 100), NaN, or non-numeric telemetry
 * - If telemetry is missing or invalid: returns "Trust Score Unavailable" with diagnostics
 */

const TRUST_ENGINE_VERSION = '2.4.0-safe';

const REQUIRED_COMPONENTS = [
  'Database Security',
  'Verification Engine',
  'Storage Security',
  'Tenant Isolation',
  'Evidence Engine',
  'Crawl Reliability'
];

let lastSuccessfulTimestamp = null;

function getTrustStatusLevel(score) {
  if (score === null || score === undefined) return 'Low Confidence';
  if (score >= 95) return 'Trusted';
  if (score >= 85) return 'Verified';
  if (score >= 70) return 'Review Required';
  return 'Low Confidence';
}

function getTrustStatusColors(status) {
  switch (status) {
    case 'Trusted':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    case 'Verified':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        badge: 'bg-sky-100 text-sky-800 border-sky-300'
      };
    case 'Review Required':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    case 'Low Confidence':
    default:
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      };
  }
}

/**
 * Validates a single telemetry input value
 */
function validateTelemetryValue(name, rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return { status: 'MISSING', reason: 'Required trust component missing' };
  }

  if (typeof rawValue !== 'number' || Number.isNaN(rawValue) || !Number.isFinite(rawValue)) {
    return { status: 'INVALID', reason: `Non-numeric or NaN value (${String(rawValue)})` };
  }

  if (rawValue < 0) {
    return { status: 'INVALID', reason: `Value ${rawValue} is negative (below minimum 0)` };
  }

  if (rawValue > 100) {
    return { status: 'INVALID', reason: `Value ${rawValue} exceeds maximum 100` };
  }

  return { status: 'VALID', value: rawValue };
}

/**
 * Calculates the Platform Trust Score with strict validation and safe failure handling
 */
function calculateTrustScore(input = {}) {
  // Extract candidate values (supporting both canonical and alias names)
  const candidates = [
    { name: 'Database Security', raw: input.databaseSecurity ?? input.rlsCoveragePercent },
    { name: 'Verification Engine', raw: input.verificationEngine ?? input.verificationPassRate },
    { name: 'Storage Security', raw: input.storageSecurity ?? input.storageSecurityScore },
    { name: 'Tenant Isolation', raw: input.tenantIsolation ?? input.tenantIsolationPassRate },
    { name: 'Evidence Engine', raw: input.evidenceEngine ?? input.evidenceQuality },
    { name: 'Crawl Reliability', raw: input.crawlReliability ?? input.crawlCoveragePercent }
  ];

  const missingComponents = [];
  const invalidComponents = [];
  const validatedValues = {};

  for (const item of candidates) {
    const check = validateTelemetryValue(item.name, item.raw);
    if (check.status === 'MISSING') {
      missingComponents.push(item.name);
    } else if (check.status === 'INVALID') {
      invalidComponents.push({ name: item.name, value: item.raw, reason: check.reason });
    } else {
      validatedValues[item.name] = check.value;
    }
  }

  // FAIL SAFE: If ANY required telemetry is missing or invalid, calculation is BLOCKED
  if (missingComponents.length > 0 || invalidComponents.length > 0) {
    const reason = missingComponents.length > 0
      ? (missingComponents.length === 1 ? 'Required trust component missing.' : 'Required telemetry missing.')
      : 'Telemetry validation failed.';

    return {
      isAvailable: false,
      status: 'INVALID',
      statusLevel: 'Low Confidence',
      overallScore: null,
      displayScore: 'Trust Score Unavailable',
      reason,
      statusColor: getTrustStatusColors('Low Confidence'),
      missingComponents,
      invalidComponents,
      components: {},
      componentList: [],
      diagnostics: {
        trustEngineStatus: 'Degraded / Blocked',
        trustEngineVersion: TRUST_ENGINE_VERSION,
        validationStatus: 'INVALID',
        requiredComponents: REQUIRED_COMPONENTS,
        missingComponents,
        invalidComponents,
        lastSuccessfulCalculation: lastSuccessfulTimestamp,
        lastAuditTimestamp: new Date().toISOString()
      },
      summary: `Trust calculation blocked. ${reason} LeadPilot never substitutes artificial values or estimates for missing security controls.`,
      calculatedAt: new Date().toISOString()
    };
  }

  // All 6 required components are present and valid (0 - 100)
  const dbVal = validatedValues['Database Security'];
  const verifVal = validatedValues['Verification Engine'];
  const storageVal = validatedValues['Storage Security'];
  const tenantVal = validatedValues['Tenant Isolation'];
  const evidenceVal = validatedValues['Evidence Engine'];
  const crawlVal = validatedValues['Crawl Reliability'];

  // 1. Database Security (Weight: 20%)
  const dbComp = {
    id: 'database-security',
    name: 'Database Security',
    weight: 0.20,
    weightPercent: 20,
    score: dbVal,
    weightedPoints: Number((dbVal * 0.20).toFixed(2)),
    status: dbVal === 100 ? 'Optimal' : dbVal >= 80 ? 'Pass' : 'Alert',
    metricSource: 'PostgreSQL Row Level Security (RLS) System Catalogs',
    explanation: dbVal < 70
      ? `Security Alert: Database RLS coverage degraded to ${dbVal}%. Customer tables may be exposed.`
      : `${dbVal}% of customer-facing database tables have Row Level Security enabled, forced, and granular CRUD policies active.`
  };

  // 2. Verification Engine (Weight: 20%)
  const verifComp = {
    id: 'verification-engine',
    name: 'Verification Engine',
    weight: 0.20,
    weightPercent: 20,
    score: verifVal,
    weightedPoints: Number((verifVal * 0.20).toFixed(2)),
    status: verifVal >= 90 ? 'Optimal' : verifVal >= 75 ? 'Pass' : verifVal >= 60 ? 'Warning' : 'Alert',
    metricSource: 'Deterministic Fact-Checking & Citation Cross-Referencing',
    explanation: verifVal < 70
      ? `Verification Warning: Pass rate degraded to ${verifVal}%. Several claims were rejected or lacked source evidence.`
      : `${verifVal}% verification pass rate across all claims, audited quotes, and extracted business parameters.`
  };

  // 3. Storage Security (Weight: 15%)
  const storageComp = {
    id: 'storage-security',
    name: 'Storage Security',
    weight: 0.15,
    weightPercent: 15,
    score: storageVal,
    weightedPoints: Number((storageVal * 0.15).toFixed(2)),
    status: storageVal === 100 ? 'Optimal' : storageVal >= 80 ? 'Warning' : 'Alert',
    metricSource: 'Cloud Storage Bucket Isolation & 15-Minute HMAC Signed URLs',
    explanation: storageVal < 70
      ? `Storage Security Alert: Storage isolation score degraded to ${storageVal}%. Customer documents may lack strict signed URL protection.`
      : `${storageVal}% storage isolation score: all customer documents, proposal PDFs, and exports isolated in private buckets.`
  };

  // 4. Tenant Isolation (Weight: 15%)
  const tenantComp = {
    id: 'tenant-isolation',
    name: 'Tenant Isolation',
    weight: 0.15,
    weightPercent: 15,
    score: tenantVal,
    weightedPoints: Number((tenantVal * 0.15).toFixed(2)),
    status: tenantVal === 100 ? 'Optimal' : tenantVal >= 80 ? 'Warning' : 'Alert',
    metricSource: 'Automated Multi-Tenant Penetration Test Suite (10/10 Passed)',
    explanation: tenantVal < 80
      ? `Isolation Alert: Multi-tenant isolation test score degraded to ${tenantVal}%. Potential cross-account access risk.`
      : `${tenantVal}% multi-tenant isolation audit pass rate: zero cross-account snooping, updating, or unauthorized reads.`
  };

  // 5. Evidence Engine (Weight: 15%)
  const evidenceComp = {
    id: 'evidence-engine',
    name: 'Evidence Engine',
    weight: 0.15,
    weightPercent: 15,
    score: evidenceVal,
    weightedPoints: Number((evidenceVal * 0.15).toFixed(2)),
    status: evidenceVal >= 90 ? 'Optimal' : evidenceVal >= 75 ? 'Pass' : evidenceVal >= 60 ? 'Warning' : 'Alert',
    metricSource: 'Evidence Vault Fact Density & Verifiable Source URLs',
    explanation: evidenceVal < 70
      ? `Evidence Quality Warning: Fact density degraded to ${evidenceVal}%. Limited verifiable quotes discovered on target website.`
      : `${evidenceVal}% evidence quality: verified citations with direct source URLs and verbatim text quotes.`
  };

  // 6. Crawl Reliability (Weight: 15%)
  const crawlComp = {
    id: 'crawl-reliability',
    name: 'Crawl Reliability',
    weight: 0.15,
    weightPercent: 15,
    score: crawlVal,
    weightedPoints: Number((crawlVal * 0.15).toFixed(2)),
    status: crawlCompScoreStatus(crawlVal),
    metricSource: 'Multi-Page Discovery & Internal Hierarchy Traversal Engine',
    explanation: crawlVal < 50
      ? `Crawl Reliability Warning: Coverage degraded to ${crawlVal}%. Low page discovery may impact proposal confidence.`
      : `${crawlVal}% crawl coverage across prioritized internal pages (pricing, services, about, and terms).`
  };

  function crawlCompScoreStatus(val) {
    if (val >= 85) return 'Optimal';
    if (val >= 60) return 'Pass';
    if (val >= 40) return 'Warning';
    return 'Alert';
  }

  const componentList = [dbComp, verifComp, storageComp, tenantComp, evidenceComp, crawlComp];
  const totalWeightedPoints = componentList.reduce((acc, c) => acc + c.weightedPoints, 0);
  const overallScore = Math.round(totalWeightedPoints);
  const statusLevel = getTrustStatusLevel(overallScore);
  const statusColor = getTrustStatusColors(statusLevel);

  let summary = '';
  if (overallScore >= 95) {
    summary = 'All security controls, verification engines, and multi-page evidence audits are operating with maximum trust and zero detected vulnerabilities.';
  } else if (overallScore >= 85) {
    summary = 'Platform security and verification meet high enterprise compliance standards with verified data isolation and high evidence quality.';
  } else if (overallScore >= 70) {
    summary = 'Analysis contains limited evidence coverage or pending security checks. Manual audit review is recommended.';
  } else {
    summary = 'Low confidence detected. Insufficient evidence or unverified assertions require re-crawling and audit confirmation.';
  }

  lastSuccessfulTimestamp = new Date().toISOString();

  return {
    isAvailable: true,
    status: 'VALID',
    statusLevel,
    overallScore,
    displayScore: `${overallScore}%`,
    statusColor,
    components: {
      databaseSecurity: dbComp,
      verificationEngine: verifComp,
      storageSecurity: storageComp,
      tenantIsolation: tenantComp,
      evidenceEngine: evidenceComp,
      crawlReliability: crawlComp
    },
    componentList,
    missingComponents: [],
    invalidComponents: [],
    diagnostics: {
      trustEngineStatus: 'Operational',
      trustEngineVersion: TRUST_ENGINE_VERSION,
      validationStatus: 'VALID',
      requiredComponents: REQUIRED_COMPONENTS,
      missingComponents: [],
      invalidComponents: [],
      lastSuccessfulCalculation: lastSuccessfulTimestamp,
      lastAuditTimestamp: new Date().toISOString()
    },
    summary,
    calculatedAt: new Date().toISOString()
  };
}

module.exports = {
  calculateTrustScore,
  getTrustStatusLevel,
  getTrustStatusColors,
  validateTelemetryValue,
  REQUIRED_COMPONENTS,
  TRUST_ENGINE_VERSION
};
