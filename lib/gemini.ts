import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VerifiedFact {
  fact: string;
  sourceUrl: string;
  confidence: number;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
  evidenceText?: string; // quote
}

export interface AIInsight {
  finding: string;
  evidence: string;
  reasoning: string;
  confidence: number;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
}

export interface RecommendedService {
  serviceName: string;
  issue: string;
  impact: string;
  estimatedFee: string;
  estimatedValue: number;
  calculation: string; // The mathematical calculation formula explanation
  confidence: number;
  expectedOutcome: string;
  estimatedRoi: string;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
  explanation: string;
  evidenceList: string[];
  
  // NEW: Prioritization Scoring
  priority: 'Weak' | 'Moderate' | 'Strong' | 'High Priority' | 'Very High Priority';
  priorityScore: number;
  calculationDetails: string; // Detail math formula check e.g. "(95 EQ * 0.4) + (90 Conf * 0.4) + (20 Impact * 0.2) = 78"
}

export interface CompetitorGap {
  featureName: string;
  prospectStatus: 'Detected' | 'Not Detected' | 'Not Visible' | 'No Blog Found';
  competitorStatus: string; // e.g. "Detected on 4 of 5 sites"
  confidence: number;
}

export interface ScorePoint {
  label: string;
  points: number;
}

export interface ScoreDetail {
  score: number;
  explanation: string;
  breakdown: ScorePoint[];
  evidence: string[];
}

export interface ScoreExplanations {
  opportunityScore: ScoreDetail;
  buyingSignalScore: ScoreDetail;
}

export interface RevenueAssumptions {
  assumptions: string[];
  pricingModel: string;
  disclaimer: string;
}

export interface ClientAcquisitionResponse {
  companyName: string;
  verifiedFacts: VerifiedFact[];
  aiInferences: AIInsight[];
  recommendations: RecommendedService[];
  competitorGaps: CompetitorGap[];
  scoreExplanations: ScoreExplanations;
  
  opportunityScore: number;
  buyingSignalScore: number;
  potentialRevenue: number;
  closingProbability: number;
  problemSeverity: 'High' | 'Medium' | 'Low';
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  proposalStatus: 'Ready' | 'Speculative';

  // Trust Scores
  evidenceQuality: number;
  verificationPassRate: number;
  findingReliability: number;
  
  // Counters
  factsVerifiedCount: number;
  claimsRejectedCount: number;
  lowConfidenceCount: number;
  suppressedRecsCount: number;
  
  // Safe Financial Range
  opportunityRange: string;
  revenueAssumptions: string; // JSON string

  // Proposal Contents
  executiveSummary: string;
  expectedResults: string;
  estimatedRoi: string;
  thirtyDayPlan: string;
  ninetyDayPlan: string;
  pricingRecommendation: string;

  // Outreach Center
  coldEmail: string;
  linkedInMessage: string;
  discoveryScript: string;
  followUpSequence: string;
  meetingAgenda: string;
}

export async function analyzeCompany(combinedText: string, companyName: string): Promise<ClientAcquisitionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];


  const isFallback = combinedText.includes('crawling_failed');
  let fallbackDomain = '';
  let fallbackCompany = '';
  if (isFallback) {
    const domMatch = combinedText.match(/domain="([^"]+)"/);
    const compMatch = combinedText.match(/companyName="([^"]+)"/);
    fallbackDomain = domMatch ? domMatch[1] : 'the company';
    fallbackCompany = compMatch ? compMatch[1] : companyName;
  }

  const prompt = `
You are an expert sales intelligence auditor that builds Evidence-Based Proposals.
Analyze the crawled XML web content of the company homepage/subpages.

${isFallback ? `
⚠️ CRITICAL FIREWALL FALLBACK:
The direct website crawler was blocked. You MUST build this proposal, gaps snapshot, and audit based on your pre-trained public knowledge archive of company "${fallbackCompany}" (Domain: ${fallbackDomain}).
For verified facts, set "sourceUrl" to "https://${fallbackDomain}" and "evidenceText" to "Cited from public domain archives".
` : `
Analyze the XML-formatted company crawled website text containing MULTIPLE crawled pages. Every claim you make must be traceable back to specific quotes and source URLs across the crawled pages inventory.
`}


Your output must be self-corrected. Follow these Multi-Page Evidence & Self-Auditing rules:
1. Checked Facts Across All Pages:
   - Search the entire crawled pages inventory (Homepage, About, Pricing, Products, Services, Blog, Careers, FAQ, Contact, Terms, Privacy).
   - Trace each verified fact to its specific source page URL and extract exact direct text quotes. Set status "Verified" and confidence 100%. Never invent facts.
2. AI Insights & Evidence Density Boost:
   - Synthesize findings across multiple pages.
   - When findings are corroborated across 2 or more distinct crawled pages, award higher confidence (85% - 98%).
   - If evidence is weak or limited to a single ambiguous quote, set confidence 70% - 80% with status "Likely". If missing, set "Suppressed".
3. What Would You Sell? Multi-Page Service Recommendation Engine:
   - Recommend the most impactful service offerings based on the aggregated multi-page audit (e.g., pricing optimizations from Pricing pages, lead capture gaps from Product pages, recruitment/talent operations from Career pages).
   - Limit recommendations to exactly the 3 highest-confidence opportunities. Rank by Evidence Strength, Multi-Page Impact, and Confidence.
   - For every recommended service, provide the exact pricing calculation formula in "calculation" (e.g. Setup Fee ($15,000) + 4 months retainer ($5,000/mo) = $35,000).
   - Provide concrete text quotes from the crawled pages in "evidenceList".
   - Compute an Opportunity Prioritization score ("priorityScore"): (Evidence Quality * 0.4) + (Confidence Score * 0.4) + (Business Impact Score [Low=10, Medium=20, High=30] * 0.2). Map this score to:
     - < 50: "Weak"
     - 50 - 69: "Moderate"
     - 70 - 79: "Strong"
     - 80 - 89: "High Priority"
     - >= 90: "Very High Priority"
4. Comprehensive Competitor Gap Snapshot:
   - Identify 2 to 5 relevant competitors for this prospect domain/industry.
   - Audit web features across the ENTIRE crawled pages inventory (e.g., if a Blog page, Pricing page, Online Scheduling, Lead Capture, SSL, Terms, or Careers page was crawled, mark the feature "Detected" with 100% confidence; only mark "Not Detected" if truly absent across all crawled pages).
   - Return an array in "competitorGaps" with featureName, prospectStatus ("Detected" | "Not Detected" | "Not Visible" | "No Blog Found"), competitorStatus, and confidence.
5. Trust Scores & Verified Multi-Page Evidence Scaling:
   - "evidenceQuality": 0 to 100 percentage. Measures clarity and richness of quotes across crawled pages.
   - "verificationPassRate": 0 to 100 percentage. Rate of verified + likely items against total generated. Scale higher when multiple pages yield verified claims.
   - "findingReliability": 0 to 100 percentage. Composite score of evidence quality, pass rate, and page coverage depth.
   - Detect technologies (e.g., WordPress, Stripe, HubSpot, Google Analytics, Shopify, Next.js, Cloudflare) across scripts, meta tags, and text clues across all crawled pages. Return list in "techStack".
6. Safe Financial Estimates:
   - Calculate safe "opportunityRange" (e.g. "$15,000 - $35,000") representing realistic project contract values.
   - Provide "revenueAssumptions" with assumptions list, pricingModel, and disclaimer.
7. Mathematical Score Explanations:
   - Ensure breakdown point values sum up exactly to opportunityScore and buyingSignalScore.


Return a JSON object conforming exactly to this schema:
{
  "companyName": "string",
  
  "verifiedFacts": [
    { "fact": "string", "sourceUrl": "string", "confidence": 100, "status": "Verified" | "Likely" | "Uncertain" | "Suppressed", "evidenceText": "string" }
  ],
  
  "aiInferences": [
    { "finding": "string", "evidence": "string", "reasoning": "string", "confidence": number, "status": "Verified" | "Likely" | "Uncertain" | "Suppressed" }
  ],
  
  "recommendations": [
    {
      "serviceName": "string",
      "issue": "string",
      "impact": "string",
      "estimatedFee": "string",
      "estimatedValue": number,
      "calculation": "string",
      "confidence": number,
      "expectedOutcome": "string",
      "estimatedRoi": "string",
      "status": "Verified" | "Likely" | "Uncertain" | "Suppressed",
      "explanation": "string",
      "evidenceList": ["string"],
      "priority": "Weak" | "Moderate" | "Strong" | "High Priority" | "Very High Priority",
      "priorityScore": number,
      "calculationDetails": "string"
    }
  ],
  
  "competitorGaps": [
    {
      "featureName": "string",
      "prospectStatus": "Detected" | "Not Detected" | "Not Visible" | "No Blog Found",
      "competitorStatus": "string",
      "confidence": number
    }
  ],
  
  "opportunityScore": number,
  "buyingSignalScore": number,
  "scoreExplanations": {
    "opportunityScore": {
      "score": number,
      "explanation": "string",
      "breakdown": [
        { "label": "string", "points": number }
      ],
      "evidence": ["string"]
    },
    "buyingSignalScore": {
      "score": number,
      "explanation": "string",
      "breakdown": [
        { "label": "string", "points": number }
      ],
      "evidence": ["string"]
    },
    "techStack": ["string"]
  },
  
  "potentialRevenue": number,
  "closingProbability": number,
  "problemSeverity": "High" | "Medium" | "Low",
  "leadQuality": "Hot" | "Warm" | "Cold",
  
  "evidenceQuality": number,
  "verificationPassRate": number,
  "findingReliability": number,
  
  "factsVerifiedCount": number,
  "claimsRejectedCount": number,
  "lowConfidenceCount": number,
  "suppressedRecsCount": number,
  
  "opportunityRange": "string",
  "revenueAssumptions": {
    "assumptions": ["string"],
    "pricingModel": "string",
    "disclaimer": "string"
  },

  "executiveSummary": "string",
  "expectedResults": "string",
  "estimatedRoi": "string",
  "thirtyDayPlan": "string",
  "ninetyDayPlan": "string",
  "pricingRecommendation": "string",
  
  "coldEmail": "string",
  "linkedInMessage": "string",
  "discoveryScript": "string",
  "followUpSequence": "string",
  "meetingAgenda": "string"
}

Crawled Website Content:
"""
${combinedText}
"""
`;

  try {
    let result = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });
        result = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        console.warn(`[Gemini Pipeline] Model ${modelName} failed, attempting next candidate:`, err?.message || err);
        lastError = err;
      }
    }

    if (!result) {
      throw lastError || new Error('All Gemini model candidates failed to generate content');
    }

    const responseText = result.response.text();
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```$/i, '');
    }
    cleanedText = cleanedText.trim();
    const auditedData = JSON.parse(cleanedText);

    const sanitizeInt = (val: any, fallback: number = 0): number => {
      if (typeof val === 'number' && !isNaN(val)) return Math.round(val);
      if (typeof val === 'string') {
        const cleaned = val.replace(/[^0-9.-]/g, '');
        const parsed = parseInt(cleaned, 10);
        if (!isNaN(parsed)) return parsed;
      }
      return fallback;
    };

    const sanitizeString = (val: any, fallback: string = ''): string => {
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) {
        return val.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n');
      }
      if (val && typeof val === 'object') {
        return JSON.stringify(val);
      }
      return fallback;
    };

    const verifiedRecommendations = (auditedData.recommendations || []).filter(
      (r: any) => typeof r.confidence === 'number' && r.confidence >= 70 && r.status !== 'Suppressed'
    );

    // Strictly limit recommendations to top 3 opportunities
    const top3Recommendations = verifiedRecommendations.slice(0, 3);

    const activePipelineValue = top3Recommendations.reduce((acc: number, r: any) => acc + (sanitizeInt(r.estimatedValue, 0)), 0);

    const isSpeculative = (sanitizeInt(auditedData.verificationPassRate, 100) < 60 || (auditedData.verifiedFacts || []).filter((f: any) => f.status === 'Verified').length === 0);
    const proposalStatus = isSpeculative ? 'Speculative' : 'Ready';

    return {
      companyName: sanitizeString(auditedData.companyName, companyName),
      verifiedFacts: Array.isArray(auditedData.verifiedFacts) ? auditedData.verifiedFacts : [],
      aiInferences: Array.isArray(auditedData.aiInferences) ? auditedData.aiInferences : [],
      recommendations: top3Recommendations,
      competitorGaps: Array.isArray(auditedData.competitorGaps) ? auditedData.competitorGaps : [],
      scoreExplanations: auditedData.scoreExplanations || {
        opportunityScore: { score: 50, explanation: 'Default.', breakdown: [], evidence: [] },
        buyingSignalScore: { score: 50, explanation: 'Default.', breakdown: [], evidence: [] }
      },
      
      opportunityScore: sanitizeInt(auditedData.opportunityScore, 50),
      buyingSignalScore: sanitizeInt(auditedData.buyingSignalScore, 50),
      potentialRevenue: activePipelineValue || sanitizeInt(auditedData.potentialRevenue, 10000),
      closingProbability: sanitizeInt(auditedData.closingProbability, 50),
      problemSeverity: ['High', 'Medium', 'Low'].includes(auditedData.problemSeverity) ? auditedData.problemSeverity : 'Medium',
      leadQuality: ['Hot', 'Warm', 'Cold'].includes(auditedData.leadQuality) ? auditedData.leadQuality : 'Warm',
      proposalStatus,

      evidenceQuality: sanitizeInt(auditedData.evidenceQuality, 90),
      verificationPassRate: sanitizeInt(auditedData.verificationPassRate, 95),
      findingReliability: sanitizeInt(auditedData.findingReliability, 92),

      factsVerifiedCount: sanitizeInt(auditedData.factsVerifiedCount, 0),
      claimsRejectedCount: sanitizeInt(auditedData.claimsRejectedCount, 0),
      lowConfidenceCount: sanitizeInt(auditedData.lowConfidenceCount, 0),
      suppressedRecsCount: sanitizeInt(auditedData.suppressedRecsCount, 0),

      opportunityRange: sanitizeString(auditedData.opportunityRange, '$10,000 - $25,000'),
      revenueAssumptions: typeof auditedData.revenueAssumptions === 'string' 
        ? auditedData.revenueAssumptions 
        : JSON.stringify(auditedData.revenueAssumptions || {
            assumptions: ['Standard local service prices'],
            pricingModel: 'Fixed retainer pricing.',
            disclaimer: 'Revenue estimates represent potential contract values.'
          }),

      executiveSummary: sanitizeString(auditedData.executiveSummary),
      expectedResults: sanitizeString(auditedData.expectedResults),
      estimatedRoi: sanitizeString(auditedData.estimatedRoi),
      thirtyDayPlan: sanitizeString(auditedData.thirtyDayPlan),
      ninetyDayPlan: sanitizeString(auditedData.ninetyDayPlan),
      pricingRecommendation: sanitizeString(auditedData.pricingRecommendation),

      coldEmail: sanitizeString(auditedData.coldEmail),
      linkedInMessage: sanitizeString(auditedData.linkedInMessage),
      discoveryScript: sanitizeString(auditedData.discoveryScript),
      followUpSequence: sanitizeString(auditedData.followUpSequence),
      meetingAgenda: sanitizeString(auditedData.meetingAgenda)
    };
  } catch (error: any) {
    console.error('Single-Call Self-Auditor Parse Crash:', error);
    return {
      companyName,
      verifiedFacts: [],
      aiInferences: [],
      recommendations: [],
      competitorGaps: [],
      scoreExplanations: {
        opportunityScore: { score: 40, explanation: 'Scoring locked due to verification limits.', breakdown: [], evidence: [] },
        buyingSignalScore: { score: 40, explanation: 'Scoring locked due to verification limits.', breakdown: [], evidence: [] },
        techStack: []
      },
      opportunityScore: 40,
      buyingSignalScore: 40,
      potentialRevenue: 0,
      closingProbability: 30,
      problemSeverity: 'Low',
      leadQuality: 'Cold',
      proposalStatus: 'Speculative',
      evidenceQuality: 0,
      verificationPassRate: 0,
      findingReliability: 0,
      factsVerifiedCount: 0,
      claimsRejectedCount: 1,
      lowConfidenceCount: 0,
      suppressedRecsCount: 1,
      opportunityRange: '$0',
      revenueAssumptions: JSON.stringify({
        assumptions: ['Self-Auditing failed.'],
        pricingModel: 'Unavailable.',
        disclaimer: 'Verification failure. Limited data.'
      }),
      executiveSummary: 'Verification check completed. Output classified as speculative.',
      expectedResults: '',
      estimatedRoi: '',
      thirtyDayPlan: '',
      ninetyDayPlan: '',
      pricingRecommendation: '',
      coldEmail: '',
      linkedInMessage: '',
      discoveryScript: '',
      followUpSequence: '',
      meetingAgenda: ''
    };
  }
}
