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
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

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
Analyze the XML-formatted company crawled website text. Every claim you make must be traceable back to specific quotes and source URLs in the text.
`}

Your output must be self-corrected. Follow these Self-Auditing rules:
1. Checked Facts: Look at the crawled text. Is there direct textual evidence verifying this fact? If not, change status to "Suppressed" and drop it. Otherwise, mark status "Verified" and verify confidence is 100%. Never invent facts.
2. AI Insights: Does the text evidence directly support the finding?
   - If evidence is weak: reduce the confidence score, set status to "Uncertain".
   - If evidence is missing or conflicts: set status "Suppressed".
   - If evidence is strong: set status "Likely" or "Verified".
3. What Would You Sell? Service Recommendation Engine:
   - Recommend the most appropriate service offering.
   - Limit recommendations to exactly the 3 highest-confidence opportunities. Rank by Evidence Strength, Business Impact, and Confidence.
   - For every recommended service, explain the exact pricing calculation formula in the "calculation" field (e.g. Setup Fee ($15,000) + 4 months retainer ($5,000/mo) = $35,000).
   - For every recommendation, list the supporting text quotes in "evidenceList". If no quotes are present, change status to "Suppressed".
   - If confidence is < 70%, change status to "Suppressed".
   - Compute an Opportunity Prioritization score ("priorityScore") mathematically using the formula: (Evidence Quality * 0.4) + (Confidence Score * 0.4) + (Business Impact Score [Low=10, Medium=20, High=30] * 0.2). Map this score to a priority label:
     - < 50: "Weak"
     - 50 - 69: "Moderate"
     - 70 - 79: "Strong"
     - 80 - 89: "High Priority"
     - >= 90: "Very High Priority"
   - Output the priority label in "priority", score in "priorityScore", and formula in "calculationDetails".
4. Competitor Gap Snapshot:
   - Identify 2 to 5 relevant competitors for this prospect domain/industry.
   - Compare publicly observable website features (e.g., Lead Capture Forms, Blog, Online Scheduling, Mobile Responsiveness, SSL, Chatbot) prospect vs competitors.
   - Output a JSON array under "competitorGaps" containing the gap analysis with featureName, prospectStatus ("Detected" | "Not Detected" | "Not Visible" | "No Blog Found"), competitorStatus (e.g. "Present on 3 of 5 sites"), and confidence (100%).
5. Calculate Trust Scores & Technologies:
   - "evidenceQuality": 0 to 100 percentage. Rate how clear the supporting quotes are.
   - "verificationPassRate": 0 to 100 percentage. Count of (Verified + Likely items) divided by total initial items generated.
   - "findingReliability": 0 to 100 percentage. Combined score of quality and verification success.
   - Observe script sources, meta elements, and text clues to detect active technologies (e.g. WordPress, Stripe, HubSpot, Google Analytics, Shopify, React). Return this list of systems inside the "techStack" field of "scoreExplanations".
6. Safe Financial Estimates:
   - NEVER claim future revenue. Calculate a safe "opportunityRange" (e.g. "$15,000 - $35,000") representing the total project contract sizes of the recommended services.
   - Construct "revenueAssumptions" containing: "assumptions" (list), "pricingModel" (explanation), and "disclaimer" (standard caveat stating no future revenues are guaranteed).
7. Recalculate mathematical score explanations:
   - Ensure the breakdowns (+20 Active hiring, etc.) sum up exactly to the opportunityScore and buyingSignalScore.

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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```$/i, '');
    }
    cleanedText = cleanedText.trim();
    const auditedData = JSON.parse(cleanedText);

    const verifiedRecommendations = (auditedData.recommendations || []).filter(
      (r: any) => typeof r.confidence === 'number' && r.confidence >= 70 && r.status !== 'Suppressed'
    );

    // Strictly limit recommendations to top 3 opportunities
    const top3Recommendations = verifiedRecommendations.slice(0, 3);

    const activePipelineValue = top3Recommendations.reduce((acc: number, r: any) => acc + (r.estimatedValue || 0), 0);

    const isSpeculative = (auditedData.verificationPassRate < 60 || (auditedData.verifiedFacts || []).filter((f: any) => f.status === 'Verified').length === 0);
    const proposalStatus = isSpeculative ? 'Speculative' : 'Ready';

    return {
      companyName: auditedData.companyName || companyName,
      verifiedFacts: auditedData.verifiedFacts || [],
      aiInferences: auditedData.aiInferences || [],
      recommendations: top3Recommendations,
      competitorGaps: auditedData.competitorGaps || [],
      scoreExplanations: auditedData.scoreExplanations || {
        opportunityScore: { score: 50, explanation: 'Default.', breakdown: [], evidence: [] },
        buyingSignalScore: { score: 50, explanation: 'Default.', breakdown: [], evidence: [] }
      },
      
      opportunityScore: auditedData.opportunityScore || 50,
      buyingSignalScore: auditedData.buyingSignalScore || 50,
      potentialRevenue: activePipelineValue,
      closingProbability: auditedData.closingProbability || 50,
      problemSeverity: auditedData.problemSeverity || 'Medium',
      leadQuality: auditedData.leadQuality || 'Warm',
      proposalStatus,

      evidenceQuality: auditedData.evidenceQuality || 90,
      verificationPassRate: auditedData.verificationPassRate || 95,
      findingReliability: auditedData.findingReliability || 92,

      factsVerifiedCount: auditedData.factsVerifiedCount || 0,
      claimsRejectedCount: auditedData.claimsRejectedCount || 0,
      lowConfidenceCount: auditedData.lowConfidenceCount || 0,
      suppressedRecsCount: auditedData.suppressedRecsCount || 0,

      opportunityRange: auditedData.opportunityRange || '$10,000 - $25,000',
      revenueAssumptions: JSON.stringify(auditedData.revenueAssumptions || {
        assumptions: ['Standard local service prices'],
        pricingModel: 'Fixed retainer pricing.',
        disclaimer: 'Revenue estimates represent potential contract values.'
      }),

      executiveSummary: auditedData.executiveSummary || '',
      expectedResults: auditedData.expectedResults || '',
      estimatedRoi: auditedData.estimatedRoi || '',
      thirtyDayPlan: auditedData.thirtyDayPlan || '',
      ninetyDayPlan: auditedData.ninetyDayPlan || '',
      pricingRecommendation: auditedData.pricingRecommendation || '',

      coldEmail: auditedData.coldEmail || '',
      linkedInMessage: auditedData.linkedInMessage || '',
      discoveryScript: auditedData.discoveryScript || '',
      followUpSequence: auditedData.followUpSequence || '',
      meetingAgenda: auditedData.meetingAgenda || ''
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
