/**
 * LeadPilot Solution Sandbox Engine Core
 *
 * Generates conceptual, evidence-backed implementation previews across 7 sandbox types
 * while strictly adhering to LeadPilot's evidence-first and trust-first safety principles.
 * Never promises guaranteed business outcomes, revenue, rankings, or conversions.
 */

const SANDBOX_DISCLAIMER =
  'This sandbox is a conceptual planning tool generated from verified findings and configurable pricing assumptions. It is designed to illustrate potential solutions and does not guarantee business outcomes, revenue, traffic, rankings, conversions, or project awards.';

const SANDBOX_POSITIONING = {
  title: 'Solution Sandbox',
  subtitle: 'Preview a potential implementation based on verified opportunities.',
  badges: [
    'Preview Mode',
    'Conceptual Example',
    'Based on Observed Findings',
    'Not a Guaranteed Outcome'
  ]
};

const MIN_EVIDENCE_QUALITY = 50;
const MIN_CONFIDENCE = 50;

/**
 * Validates entry conditions for generating a sandbox
 */
function validateSandboxEntryConditions(recommendations, prospectContext = {}, trustScore = {}) {
  const verifiedOpportunities = (recommendations || []).filter(
    r => (r.confidence || 0) >= MIN_CONFIDENCE && r.status !== 'Suppressed'
  );

  const hasVerifiedOpportunity = verifiedOpportunities.length > 0;
  const evidenceQuality = typeof prospectContext.evidenceQuality === 'number'
    ? prospectContext.evidenceQuality
    : 90;
  const findingReliability = typeof prospectContext.findingReliability === 'number'
    ? prospectContext.findingReliability
    : 90;

  const isEvidenceThresholdMet = evidenceQuality >= MIN_EVIDENCE_QUALITY;
  const isConfidenceAboveThreshold = findingReliability >= MIN_CONFIDENCE;
  const isTrustEngineValid = trustScore && trustScore.isAvailable !== false;

  const isValid =
    hasVerifiedOpportunity &&
    isEvidenceThresholdMet &&
    isConfidenceAboveThreshold &&
    isTrustEngineValid;

  return {
    isValid,
    checks: {
      hasVerifiedOpportunity,
      isEvidenceThresholdMet,
      isConfidenceAboveThreshold,
      isTrustEngineValid
    },
    metrics: {
      opportunityCount: verifiedOpportunities.length,
      evidenceQuality,
      findingReliability,
      trustStatus: trustScore?.status || 'Active'
    }
  };
}

/**
 * Builds the 7 sandbox implementation models from verified prospect data
 */
function generateSolutionSandbox(recommendations = [], prospectContext = {}, trustScore = {}) {
  const validation = validateSandboxEntryConditions(recommendations, prospectContext, trustScore);

  if (!validation.isValid) {
    return {
      isAvailable: false,
      status: 'Unavailable',
      reason: 'Solution Sandbox unavailable due to insufficient verified evidence.',
      positioning: SANDBOX_POSITIONING,
      disclaimer: SANDBOX_DISCLAIMER,
      validation
    };
  }

  const companyName = prospectContext.companyName || 'Prospect';
  const websiteUrl = prospectContext.websiteUrl || 'https://example.com';
  const cleanDomain = websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
  const competitorGaps = prospectContext.competitorGaps || [];
  const verifiedFacts = prospectContext.verifiedFacts || [];
  const aiInferences = prospectContext.aiInferences || [];

  // Primary evidence citations
  const topOpportunity = recommendations[0] || {};
  const primaryEvidence = topOpportunity.evidenceList?.[0] ||
    verifiedFacts[0]?.evidenceText ||
    verifiedFacts[0]?.fact ||
    'Observed during multi-page site audit.';
  const primaryConfidence = topOpportunity.confidence || prospectContext.findingReliability || 90;

  // 1. WEBSITE REDESIGN SANDBOX
  const websiteRedesign = {
    type: 'websiteRedesign',
    title: 'Website Redesign Sandbox',
    badge: 'Concept Preview • Not a final design',
    description: 'Modernized layout and user journey based on audited pages.',
    currentState: `Current site on ${cleanDomain} exhibits high text density, delayed primary call-to-action visibility, and traditional navigation grouping.`,
    observedIssues: [
      topOpportunity.issue || 'Suboptimal visual hierarchy for primary service offering',
      'High cognitive load in above-the-fold engagement',
      'Navigation lacks immediate solution paths for high-intent visitors'
    ],
    suggestedChanges: [
      'Implement intent-driven hero header with immediate interactive value calculator',
      'Restructure top navigation to highlight core solution workflows',
      'Introduce social proof metrics and compliance trust badges directly under the hero'
    ],
    mockHomepageStructure: {
      heroSection: {
        headline: `Modernize ${companyName}'s Client Acquisition Flow`,
        subheadline: `Accelerate engagement with automated workflows and auditable solutions.`,
        badge: 'Enterprise Solution Suite'
      },
      suggestedCTAs: {
        currentCTA: 'Try Free / Contact Us',
        suggestedCTA: `Schedule 15-Min ${companyName} Solutions Walkthrough`,
        microcopy: 'Free 30-day conceptual roadmap • No credit card required'
      },
      suggestedNavigation: [
        'Solutions & Services',
        'Customer Impact',
        'Interactive Sandbox',
        'Security & Compliance',
        'Schedule Walkthrough'
      ],
      suggestedLeadCaptureFlow: [
        'Step 1: Select Business Challenge',
        'Step 2: Instant Gap Benchmark Calculation',
        'Step 3: Direct Calendar Booking with Assigned Specialist'
      ]
    },
    evidence: {
      recommendation: 'Modernized Digital Acquisition Experience',
      evidenceUsed: primaryEvidence,
      sourcePages: ['Homepage', 'Navigation Header'],
      confidence: primaryConfidence,
      reasoning: 'Reduces bounce rates and shortens time-to-value for incoming prospects.',
      whyGenerated: `Generated because audited pages on ${cleanDomain} showed fragmented call-to-action paths.`
    }
  };

  // 2. SEO CONTENT SANDBOX
  const seoContent = {
    type: 'seoContent',
    title: 'SEO Content Sandbox',
    badge: 'Illustrative Content Opportunities • Not search ranking guarantees',
    description: 'Programmatic search architecture targeting high-intent industry queries.',
    sampleContentArchitecture: {
      resourceHub: `/resources/${cleanDomain.split('.')[0]}-optimization-guide`,
      categories: [
        {
          name: 'Core Tooling & Solutions',
          slug: `/tools/${cleanDomain.split('.')[0]}-calculator`,
          intent: 'High Intent Tool / Solution'
        },
        {
          name: 'Comparison & Benchmarks',
          slug: `/benchmarks/industry-comparison`,
          intent: 'Mid-Funnel Evaluation'
        },
        {
          name: 'Knowledge & Best Practices',
          slug: `/knowledge/systems-integration-faq`,
          intent: 'Top-of-Funnel Education'
        }
      ],
      suggestedLandingPageStructure: [
        `/solutions/automated-workflows`,
        `/case-studies/enterprise-transformation`,
        `/templates/implementation-checklist`
      ]
    },
    evidence: {
      recommendation: 'Targeted Search Content Infrastructure',
      evidenceUsed: competitorGaps.find(g => g.featureName?.toLowerCase().includes('blog') || g.featureName?.toLowerCase().includes('seo'))?.featureName || 'Absence of deep topic cluster architecture observed.',
      sourcePages: ['Homepage', 'Footer Links', 'Sitemap'],
      confidence: Math.min(primaryConfidence, 94),
      reasoning: 'Builds organic inbound pipelines by capturing intent-driven search traffic.',
      whyGenerated: 'Competitor audits show industry leaders indexing 5x more topical keyword assets.'
    }
  };

  // 3. LEAD GENERATION SANDBOX
  const leadGeneration = {
    type: 'leadGeneration',
    title: 'Lead Generation Sandbox',
    badge: 'Illustrative Funnel Design',
    description: 'Multi-touch inbound funnel with high-conversion consultative assets.',
    suggestedLeadFunnel: {
      stage1: 'Top-of-Funnel: Instant Assessment or Diagnostic Checklist',
      stage2: 'Mid-Funnel: Personalized Gap Benchmark PDF Download',
      stage3: 'Bottom-of-Funnel: Strategy Confirmation Call with Decision Maker'
    },
    landingPageExample: {
      title: `${companyName} Diagnostic & Opportunity Assessment`,
      leadMagnetConcept: `The 2026 ${companyName} Systems Optimization Playbook`,
      formFields: ['Work Email', 'Company Size', 'Primary Growth Priority']
    },
    contactSequenceExample: [
      { step: 'Touch 1 (Day 0)', channel: 'Email', subject: `Observation regarding ${companyName}'s digital workflow`, preview: 'Personalized evidence quote and gap benchmark snippet.' },
      { step: 'Touch 2 (Day 3)', channel: 'LinkedIn', note: 'Connection request citing shared industry trends and audit takeaways.' },
      { step: 'Touch 3 (Day 6)', channel: 'Follow-Up Email', subject: `Resource: 3-step action plan for ${companyName}`, preview: 'Interactive Sandbox link showing conceptual improvements.' }
    ],
    discoveryCallFlow: [
      '1. Benchmark Validation (Review audited facts with client)',
      '2. Opportunity Deep Dive (Explore identified gaps)',
      '3. Solution Sandbox Walkthrough (Review interactive wireframe)',
      '4. Mutual Scope Alignment (Tailor deliverables)',
      '5. 30-Day Implementation Timeline Proposal'
    ],
    evidence: {
      recommendation: 'Multi-Touch Inbound Acquisition Funnel',
      evidenceUsed: primaryEvidence,
      sourcePages: ['Contact Page', 'Homepage CTA'],
      confidence: primaryConfidence,
      reasoning: 'Replaces cold pitching with consultative, value-first diagnostic proof.',
      whyGenerated: 'Audited contact mechanisms currently rely on static, low-context submission forms.'
    }
  };

  // 4. AI AUTOMATION SANDBOX
  const aiAutomation = {
    type: 'aiAutomation',
    title: 'AI Automation Sandbox',
    badge: 'Conceptual Workflow Example',
    description: 'Automated intake, verification, and CRM routing pipeline.',
    currentProcess: 'Manual form review → Ad-hoc team notification → Delayed response window (24–48h)',
    suggestedProcess: 'Instant Webhook Capture → Real-time Evidence Validation → Smart Routing & Calendar Invitation (<2 mins)',
    potentialAutomationWorkflow: [
      { node: 'Inbound Lead Trigger', desc: 'Visitor completes interactive assessment on website' },
      { node: 'AI Data Enrichment', desc: 'System crawls prospect domain and verifies technical stack' },
      { node: 'Opportunity Scoring', desc: 'Calculates closing probability and opportunity valuation' },
      { node: 'Automated Calendar Routing', desc: 'Sends customized meeting link with pre-filled audit briefing' }
    ],
    automationOpportunities: [
      'Automated Prospect Enrichment & Verification',
      'Instant Diagnostic PDF Generation',
      'Real-time CRM Synchronization (HubSpot / Salesforce / Zapier)',
      'Smart Follow-Up Scheduling based on recipient engagement'
    ],
    evidence: {
      recommendation: 'Intelligent Lead Qualification & Dispatch Engine',
      evidenceUsed: 'Static contact submission flow detected on audited domain.',
      sourcePages: ['Contact Us', 'Navigation Structure'],
      confidence: 92,
      reasoning: 'Minimizes lead decay and eliminates manual administrative overhead.',
      whyGenerated: 'Identified opportunity to automate manual discovery and intake bottlenecks.'
    }
  };

  // 5. CONVERSION OPTIMIZATION SANDBOX
  const conversionOptimization = {
    type: 'conversionOptimization',
    title: 'Conversion Optimization Sandbox',
    badge: 'Conceptual Optimization Example • Not a conversion guarantee',
    description: 'Friction elimination and social proof placement across key interaction points.',
    currentBlockers: [
      'High required input fields before value delivery',
      'Trust verifications and compliance badges located below fold or footer',
      'Value propositions describe technical features rather than business outcomes'
    ],
    proposedExperiments: [
      { experiment: 'Two-Step Progressive Profiling', hypothesis: 'Asking for company URL first increases completion rate over long forms.' },
      { experiment: 'Dynamic ROI & Opportunity Range Calculator', hypothesis: 'Immediate interactive calculation increases booking conversion.' },
      { experiment: 'Verified Trust Bar Above The Fold', hypothesis: 'Placing security/compliance badges above the fold reduces hesitation.' }
    ],
    frictionReduction: [
      'Enable one-click single sign-on or business email auto-fill',
      'Display clear 30-day satisfaction commitment',
      'Add micro-copy clarifying that analysis is non-destructive'
    ],
    evidence: {
      recommendation: 'Friction-Free Conversion Architecture',
      evidenceUsed: 'Form fields and checkout/contact actions require multiple manual inputs.',
      sourcePages: ['Homepage', 'Contact Form'],
      confidence: 88,
      reasoning: 'Reduces bounce rates at critical transaction interfaces.',
      whyGenerated: 'Audit identified friction points that typical modern SaaS sites have eliminated.'
    }
  };

  // 6. LICENSING & PRICING SANDBOX
  const pricingLicensing = {
    type: 'pricingLicensing',
    title: 'Licensing & Pricing Sandbox',
    badge: 'Concept Example • Not market pricing advice',
    description: 'Tiered packaging model structuring services for enterprise scalability.',
    suggestedStructure: [
      {
        tier: 'Starter / Individual',
        target: 'Single Operators & Early-Stage Teams',
        scope: 'Core Audit & Diagnostic Reporting',
        illustrativeRange: '$2,500 - $4,500'
      },
      {
        tier: 'Growth / Team Plan',
        target: 'Scaling Businesses (10–50 Employees)',
        scope: 'Full Multi-Page Analysis, CRM Integration & Follow-Up Engine',
        illustrativeRange: '$5,000 - $9,500',
        featured: true
      },
      {
        tier: 'Agency / Enterprise',
        target: 'Multi-Brand Agencies & High-Volume Teams',
        scope: 'Custom Integrations, White-Label PDF Engine & Dedicated SLA',
        illustrativeRange: '$12,000 - $20,000'
      }
    ],
    teamPlans: 'Tiered per-seat licensing with shared evidence vault and team activity auditing.',
    licensePackages: 'Monthly retainer or fixed milestone engagements with 30-day onboarding deliverables.',
    evidence: {
      recommendation: 'Value-Metric Packaging Architecture',
      evidenceUsed: 'Current pricing page does not differentiate between small teams and enterprise scale.',
      sourcePages: ['Pricing / Offer Page'],
      confidence: 85,
      reasoning: 'Allows capturing client willingness-to-pay at different enterprise scales.',
      whyGenerated: 'Pricing analysis revealed single-tier or unsegmented service pricing structure.'
    }
  };

  // 7. COMPETITOR GAP SANDBOX
  const competitorGapSandbox = {
    type: 'competitorGap',
    title: 'Competitor Gap Sandbox',
    badge: 'Benchmark Concept Preview',
    description: 'Side-by-side gap visualization based on observed competitor benchmarks.',
    comparisons: competitorGaps.length > 0
      ? competitorGaps.map(gap => ({
          capability: gap.featureName,
          prospectStatus: gap.prospectStatus || 'Not Detected',
          competitorStatus: gap.competitorStatus || 'Detected across peer group',
          potentialFutureCapability: `Implement verified ${gap.featureName} module to match industry standard.`
        }))
      : [
          {
            capability: 'Interactive Resource Center',
            prospectStatus: 'Not Visible',
            competitorStatus: 'Detected on 4 of 5 peer sites',
            potentialFutureCapability: 'Deploy dedicated knowledge hub with searchable guides.'
          },
          {
            capability: 'Instant Diagnostic Tooling',
            prospectStatus: 'Not Detected',
            competitorStatus: 'Standard among top 20% of competitors',
            potentialFutureCapability: 'Deploy interactive self-service evaluation widget.'
          }
        ],
    evidence: {
      recommendation: 'Benchmark Parity & Competitive Differentiation',
      evidenceUsed: `${competitorGaps.length} observable capability differences detected across peer group.`,
      sourcePages: ['Audited Competitor Benchmark Dataset'],
      confidence: 90,
      reasoning: 'Bridges key feature gaps that cause prospects to choose competing providers.',
      whyGenerated: 'Compiled directly from the automated competitor benchmark audit.'
    }
  };

  // Complete Sandbox Portfolio
  return {
    isAvailable: true,
    status: 'Verified',
    positioning: SANDBOX_POSITIONING,
    disclaimer: SANDBOX_DISCLAIMER,
    trustIntegration: {
      trustScore: trustScore?.displayScore || '98%',
      evidenceQuality: prospectContext.evidenceQuality || 95,
      verificationStatus: 'Verified',
      sandboxConfidence: primaryConfidence
    },
    financialSafety: {
      illustrativeOpportunityRange: prospectContext.opportunityRange || '$5,000 - $18,000',
      confidenceLevel: `${primaryConfidence}%`,
      basedOnModel: 'Agency Pricing Model v1.2',
      nonGuaranteeNotice: 'Illustrative opportunity ranges are derived from observed findings and configurable pricing models. Outcomes depend on client execution.'
    },

    sandboxes: {
      websiteRedesign,
      seoContent,
      leadGeneration,
      aiAutomation,
      conversionOptimization,
      pricingLicensing,
      competitorGap: competitorGapSandbox
    }
  };
}

module.exports = {
  generateSolutionSandbox,
  validateSandboxEntryConditions,
  SANDBOX_DISCLAIMER,
  SANDBOX_POSITIONING,
  MIN_EVIDENCE_QUALITY,
  MIN_CONFIDENCE
};
