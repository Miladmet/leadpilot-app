import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VerifiedFact {
  fact: string;
  sourceUrl: string;
  evidenceText: string; // The exact quote or text snippet verifying the fact
}

export interface AIInference {
  inference: string;
  supportedByFacts: string[]; // Reference facts by description/index
  confidence: number; // 0 to 100 percentage
}

export interface BuyingSignal {
  signal: string;
  sourceUrl: string;
  sourceText: string; // Exact text quote representing the signal
  dateDiscovered: string; // ISO or date string
}

export interface EvidenceRecommendation {
  serviceName: string;
  issue: string;
  estimatedFee: string;
  confidence: number; // 0 to 100 percentage
  explanation: string; // Why it was generated
  evidenceList: string[]; // Quotes/facts from the text supporting it
}

export interface ScoreDetails {
  score: number;
  explanation: string;
  evidence: string[]; // Citing specific facts/urls
}

export interface ScoreExplanations {
  opportunityScore: ScoreDetails;
  buyingSignalScore: ScoreDetails;
}

export interface EvidenceAcquisitionResponse {
  companyName: string;
  verifiedFacts: VerifiedFact[];
  aiInferences: AIInference[];
  buyingSignals: BuyingSignal[];
  recommendations: EvidenceRecommendation[];
  
  opportunityScore: number;
  buyingSignalScore: number;
  scoreExplanations: ScoreExplanations;
  
  potentialRevenue: number;
  closingProbability: number;
  problemSeverity: 'High' | 'Medium' | 'Low';
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  
  // Proposal Contents (Traceable to facts)
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

export async function analyzeCompany(combinedText: string, companyName: string): Promise<EvidenceAcquisitionResponse> {
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

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
You are an expert sales intelligence auditor that builds Evidence-Based Proposals.
Analyze the XML-formatted company crawled website text. Every claim you make must be traceable back to specific quotes and source URLs in the text.

Rules:
1. NEVER present assumptions as facts. Keep facts, inferences, and recommendations strictly separated.
2. Verified Facts: These must represent statements explicitly written on the crawled pages. Include the exact quote and source URL.
3. AI Inferences: These are logical deductions about company needs, pain points, or issues. They must reference the supporting verified facts and have a confidence score (0-100%).
4. Buying Signals: Extract indicators of intent (e.g. open jobs, new releases, contact widgets, expansion notes). Quote the exact text, source page, and use "${currentDate}" for dateDiscovered.
5. Recommendations: Suggest services. Explain *why* it was generated and list the exact supporting evidence. Provide a confidence score (0-100%).
6. Score Explanations: Explain why you gave the opportunity and buying signal scores, citing facts.

Return a JSON object conforming exactly to this schema:
{
  "companyName": "string",
  
  "verifiedFacts": [
    {
      "fact": "Verified fact description (e.g. They have a team of 5 developers)",
      "sourceUrl": "The exact URL of the <page> this came from",
      "evidenceText": "Exact quote from page text supporting this"
    }
  ],
  
  "aiInferences": [
    {
      "inference": "Deduction description (e.g. They are likely facing client onboarding backlogs)",
      "supportedByFacts": ["Fact 1", "Fact 2"], // Reference text of facts
      "confidence": number
    }
  ],
  
  "buyingSignals": [
    {
      "signal": "Description of signal (e.g. Hiring Senior SEO Specialist)",
      "sourceUrl": "The page URL where signal is found",
      "sourceText": "Exact quote text of signal",
      "dateDiscovered": "string"
    }
  ],
  
  "recommendations": [
    {
      "serviceName": "e.g. Local SEO Expansion Package",
      "issue": "Specific issue addressed",
      "estimatedFee": "e.g. $750/month",
      "confidence": number, // 0 to 100 percentage
      "explanation": "Why this recommendation was generated",
      "evidenceList": ["Exact quote or fact supporting this"]
    }
  ],
  
  "opportunityScore": number,
  "buyingSignalScore": number,
  "scoreExplanations": {
    "opportunityScore": {
      "score": number,
      "explanation": "Reasoning citing facts",
      "evidence": ["Evidence 1", "Evidence 2"]
    },
    "buyingSignalScore": {
      "score": number,
      "explanation": "Reasoning citing jobs/signals",
      "evidence": ["Evidence 1"]
    }
  },
  
  "potentialRevenue": number,
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

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsedData = JSON.parse(textResponse) as EvidenceAcquisitionResponse;

    // RULE 9: Suppress recommendations with confidence below 70%
    const filteredRecommendations = (parsedData.recommendations || []).filter(
      r => typeof r.confidence === 'number' && r.confidence >= 70
    );

    // Re-calculate potential revenue based ONLY on suppressed/filtered recommendations
    let adjustedRevenue = 0;
    filteredRecommendations.forEach(r => {
      // Try to parse fee number (e.g. $1,200 setup -> 1200, $750/mo -> 750)
      const numMatch = r.estimatedFee.replace(/,/g, '').match(/\d+/);
      if (numMatch) {
        adjustedRevenue += parseInt(numMatch[0]);
      }
    });

    if (adjustedRevenue === 0) {
      adjustedRevenue = parsedData.potentialRevenue;
    }

    return {
      companyName: parsedData.companyName || companyName,
      verifiedFacts: parsedData.verifiedFacts || [],
      aiInferences: parsedData.aiInferences || [],
      buyingSignals: parsedData.buyingSignals || [],
      recommendations: filteredRecommendations, // Strictly filtered (>= 70%)
      
      opportunityScore: parsedData.opportunityScore || 50,
      buyingSignalScore: parsedData.buyingSignalScore || 50,
      scoreExplanations: parsedData.scoreExplanations || {
        opportunityScore: { score: 50, explanation: 'Default score.', evidence: [] },
        buyingSignalScore: { score: 50, explanation: 'Default score.', evidence: [] }
      },
      
      potentialRevenue: adjustedRevenue,
      closingProbability: parsedData.closingProbability || 50,
      problemSeverity: parsedData.problemSeverity || 'Medium',
      leadQuality: parsedData.leadQuality || 'Warm',
      
      executiveSummary: parsedData.executiveSummary || '',
      expectedResults: parsedData.expectedResults || '',
      estimatedRoi: parsedData.estimatedRoi || '',
      thirtyDayPlan: parsedData.thirtyDayPlan || '',
      ninetyDayPlan: parsedData.ninetyDayPlan || '',
      pricingRecommendation: parsedData.pricingRecommendation || '',
      
      coldEmail: parsedData.coldEmail || '',
      linkedInMessage: parsedData.linkedInMessage || '',
      discoveryScript: parsedData.discoveryScript || '',
      followUpSequence: parsedData.followUpSequence || '',
      meetingAgenda: parsedData.meetingAgenda || ''
    };
  } catch (error: any) {
    console.error('Gemini Evidence Analysis Failure:', error);
    throw new Error(`Evidence AI generation failed: ${error.message}`);
  }
}
