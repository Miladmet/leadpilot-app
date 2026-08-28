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
  confidence: number;
  expectedOutcome: string;
  estimatedRoi: string;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
  explanation: string;
  evidenceList: string[];
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
  scoreExplanations: ScoreExplanations;
  
  opportunityScore: number;
  buyingSignalScore: number;
  potentialRevenue: number;
  closingProbability: number;
  problemSeverity: 'High' | 'Medium' | 'Low';
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  proposalStatus: 'Ready' | 'Blocked';

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
  opportunityRange: string; // e.g. "$25,000 - $75,000"
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
    model: 'gemini-3.5-flash',
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

  // ----------------------------------------------------
  // PHASE 2: AGENT 1 (INITIAL ACQUISITION ANALYST)
  // ----------------------------------------------------
  const agent1Prompt = `
You are Agent 1 (Initial Acquisition Analyst) for LeadPilot AI.
Analyze the crawled XML web content of the company homepage/subpages.

${isFallback ? `
NOTE: Crawler was blocked. Use your public knowledge archive of company "${fallbackCompany}" (Domain: ${fallbackDomain}) to build these initial recommendations.
For source URLs, use: "https://${fallbackDomain}" and "Source: Public Archives".
` : `
Every claim you make must be traceable back to specific quotes and source URLs in the text.
`}

Generate the initial findings. Return JSON conforming exactly to this structure:
{
  "companyName": "string",
  "verifiedFacts": [
    { "fact": "Objective fact text", "sourceUrl": "URL reference", "confidence": 100 }
  ],
  "aiInferences": [
    { "finding": "Deduction", "evidence": "supporting text quote", "reasoning": "Reasoning", "confidence": number }
  ],
  "recommendations": [
    {
      "serviceName": "Service Package",
      "issue": "Identified issue",
      "impact": "Business impact",
      "estimatedFee": "Pricing e.g. $1,500 monthly",
      "estimatedValue": number,
      "confidence": number,
      "expectedOutcome": "Outcome description",
      "estimatedRoi": "ROI description",
      "explanation": "Why recommend",
      "evidenceList": ["Exact text quotes supporting this"]
    }
  ],
  "opportunityScore": number,
  "buyingSignalScore": number,
  "closingProbability": number,
  "problemSeverity": "High" | "Medium" | "Low",
  "leadQuality": "Hot" | "Warm" | "Cold",
  
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

  let initialAnalysisText = '';
  try {
    const result1 = await model.generateContent(agent1Prompt);
    initialAnalysisText = result1.response.text();
  } catch (err: any) {
    console.error('Agent 1 Analysis Failure:', err);
    throw new Error(`Initial Analysis failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // PHASE 3 & 4: AGENT 2 (INDEPENDENT VERIFICATION AUDITOR)
  // ----------------------------------------------------
  const agent2Prompt = `
You are Agent 2 (Independent Verification Auditor) for LeadPilot AI.
Your task is to audit, verify, correct, and self-correct the raw output generated by Agent 1 against the actual crawled content.

Verification Rules:
1. Checked Facts: Cross-reference every fact with the Crawled Content. If no direct text verification exists, mark it "Suppressed" and drop it. Otherwise, mark it "Verified" (confidence 100%). Never invent facts.
2. AI Insights: Verify if the quote in "evidence" directly supports the "finding".
   - If evidence is weak or absent: change status to "Uncertain" or "Suppressed", and DECREASE the confidence score. Never increase confidence.
   - If evidence is strong: set status to "Likely" or "Verified".
3. Recommendations & Solutions:
   - If confidence < 70%, change status to "Suppressed".
   - If the recommendation exceeds the verified evidence, mark it "Uncertain" and flag the explanation as "Speculative".
   - Otherwise, set status to "Verified" or "Likely".
4. Calculate Trust Metrics:
   - "evidenceQuality": 0 to 100 percentage. Rate how clear the supporting quotes are.
   - "verificationPassRate": 0 to 100 percentage. Count of (Verified + Likely items) divided by total initial items.
   - "findingReliability": 0 to 100 percentage. Combined score of quality and verification success.
5. Safe Financial Estimates:
   - NEVER claim future revenue. Calculate a safe "opportunityRange" (e.g., "$15,000 - $35,000") representing the total project contract sizes.
   - Construct "revenueAssumptions" containing: "assumptions" (list), "pricingModel" (explanation), and "disclaimer" (standard caveat stating no future revenues are guaranteed).
6. Recalculate mathematical score explanations:
   - Ensure the breakdowns (+20 Active hiring, etc.) sum up exactly to the opportunityScore and buyingSignalScore.

Input Raw crawled text:
"""
${combinedText}
"""

Input Agent 1 Initial JSON:
"""
${initialAnalysisText}
"""

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
      "confidence": number,
      "expectedOutcome": "string",
      "estimatedRoi": "string",
      "status": "Verified" | "Likely" | "Uncertain" | "Suppressed",
      "explanation": "string",
      "evidenceList": ["string"]
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
    }
  },
  
  "potentialRevenue": number,
  "closingProbability": number,
  "problemSeverity": "High" | "Medium" | "Low",
  "leadQuality": "Hot" | "Warm" | "Cold",
  
  "evidenceQuality": number, // 0 to 100
  "verificationPassRate": number, // 0 to 100
  "findingReliability": number, // 0 to 100
  
  "factsVerifiedCount": number,
  "claimsRejectedCount": number,
  "lowConfidenceCount": number,
  "suppressedRecsCount": number,
  
  "opportunityRange": "string", // e.g. "$25,000 - $75,000"
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
`;

  try {
    const result2 = await model.generateContent(agent2Prompt);
    const text2 = result2.response.text();
    const auditedData = JSON.parse(text2);

    // Suppress recommendations under 70% confidence or with 'Suppressed' status
    const verifiedRecommendations = (auditedData.recommendations || []).filter(
      (r: any) => typeof r.confidence === 'number' && r.confidence >= 70 && r.status !== 'Suppressed'
    );

    // Recompute safe pipeline revenue based on verified solutions
    const activePipelineValue = verifiedRecommendations.reduce((acc: number, r: any) => acc + (r.estimatedValue || 0), 0);

    // Apply strict block rules: If pass rate < 50% or verified facts is 0, proposal is blocked
    const blockCheck = (auditedData.verificationPassRate < 50 || (auditedData.verifiedFacts || []).filter((f: any) => f.status === 'Verified').length === 0);
    const proposalStatus = blockCheck ? 'Blocked' : 'Ready';

    return {
      companyName: auditedData.companyName || companyName,
      verifiedFacts: auditedData.verifiedFacts || [],
      aiInferences: auditedData.aiInferences || [],
      recommendations: verifiedRecommendations,
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

      // Trust scores
      evidenceQuality: auditedData.evidenceQuality || 90,
      verificationPassRate: auditedData.verificationPassRate || 95,
      findingReliability: auditedData.findingReliability || 92,

      // Counters
      factsVerifiedCount: auditedData.factsVerifiedCount || 0,
      claimsRejectedCount: auditedData.claimsRejectedCount || 0,
      lowConfidenceCount: auditedData.lowConfidenceCount || 0,
      suppressedRecsCount: auditedData.suppressedRecsCount || 0,

      // Safe financial estimates
      opportunityRange: auditedData.opportunityRange || '$10,000 - $25,000',
      revenueAssumptions: JSON.stringify(auditedData.revenueAssumptions || {
        assumptions: ['Standard local service prices'],
        pricingModel: 'Fixed agency retainer pricing model.',
        disclaimer: 'Revenue estimates represent potential contract valuations and do not guarantee future sales.'
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
    console.error('Independent Auditor Verification Crash:', error);
    // Return a safe fallback if Auditor agent fails parsing
    return {
      companyName,
      verifiedFacts: [],
      aiInferences: [],
      recommendations: [],
      scoreExplanations: {
        opportunityScore: { score: 40, explanation: 'Scoring locked due to verification limits.', breakdown: [], evidence: [] },
        buyingSignalScore: { score: 40, explanation: 'Scoring locked due to verification limits.', breakdown: [], evidence: [] }
      },
      opportunityScore: 40,
      buyingSignalScore: 40,
      potentialRevenue: 0,
      closingProbability: 30,
      problemSeverity: 'Low',
      leadQuality: 'Cold',
      proposalStatus: 'Blocked',
      evidenceQuality: 0,
      verificationPassRate: 0,
      findingReliability: 0,
      factsVerifiedCount: 0,
      claimsRejectedCount: 1,
      lowConfidenceCount: 0,
      suppressedRecsCount: 1,
      opportunityRange: '$0',
      revenueAssumptions: JSON.stringify({
        assumptions: ['Auditing failed.'],
        pricingModel: 'Unavailable.',
        disclaimer: 'Scraping blocked. Insufficient evidence.'
      }),
      executiveSummary: 'Verification check failed. Content could not be validated.',
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
