import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VerifiedFact {
  fact: string;
  sourceUrl: string;
  confidence: number; // Always 100% for verified facts
}

export interface AIInsight {
  finding: string;
  evidence: string;
  reasoning: string;
  confidence: number;
}

export interface RecommendedService {
  serviceName: string;
  issue: string;
  impact: string;
  estimatedFee: string; // e.g. "$1,500 monthly"
  estimatedValue: number; // e.g. 1500 (integer)
  confidence: number;
  expectedOutcome: string;
  estimatedRoi: string;
}

export interface ScorePoint {
  label: string;
  points: number;
}

export interface ScoreDetail {
  score: number;
  explanation: string;
  breakdown: ScorePoint[];
  evidence: string[]; // Quotes from pages supporting score
}

export interface ScoreExplanations {
  opportunityScore: ScoreDetail;
  buyingSignalScore: ScoreDetail;
}

export interface ClientAcquisitionResponse {
  companyName: string;
  verifiedFacts: VerifiedFact[];
  aiInferences: AIInsight[]; // Mapped to AI Insights
  recommendations: RecommendedService[]; // Mapped to Service Matches
  scoreExplanations: ScoreExplanations;
  
  opportunityScore: number;
  buyingSignalScore: number;
  potentialRevenue: number;
  closingProbability: number;
  problemSeverity: 'High' | 'Medium' | 'Low';
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  
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
  discoveryScript: string; // Discovery Call Questions
  followUpSequence: string; // Follow-up Email
  meetingAgenda: string; // Sales Angle
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

  const prompt = `
You are an expert sales intelligence auditor that builds Evidence-Based Proposals.
Analyze the XML-formatted company crawled website text. Every claim you make must be traceable back to specific quotes and source URLs in the text.

Rules:
1. NEVER present assumptions as facts. Keep facts, insights, and recommendations strictly separated.
2. Verified Facts: Display only objective observations explicitly present in the crawled text (e.g. Website has no blog, Careers page detected). Never infer. Confidence must be 100%.
3. AI Insights: Logical deductions based on evidence (e.g. Potential Growth Phase based on active job openings, explanation, confidence).
4. Business Opportunities & Solution Builder: Translate issues into recommended services. Output the specific issue, business impact, recommended service, estimated fee, estimated project value (integer), expected outcome, estimated ROI, and confidence.
5. Proposal Generator: Create a complete, client-ready proposal with executive summary, verified findings, business opportunities, recommended services, cost estimate, outcomes, and 30-day and 90-day action plans.
6. Outreach Center: Generate a cold email, LinkedIn message, follow-up email, discovery call questions, and a sales angle. EVERY outreach asset must explicitly reference evidence quotes.
7. Show Me Why: Break down the Opportunity Score (0-100) and Buying Signal Score (0-100) mathematically using score points (e.g. +20 Active hiring, +15 funnel defects, etc. totaling the final score).

Return a JSON object conforming exactly to this schema:
{
  "companyName": "string",
  
  "verifiedFacts": [
    {
      "fact": "Objective fact description (e.g. Website has no blog)",
      "sourceUrl": "URL where this fact is observed",
      "confidence": 100
    }
  ],
  
  "aiInferences": [
    {
      "finding": "Inference description (e.g. Potential Growth Phase)",
      "evidence": "Website quote or fact showing this",
      "reasoning": "Reasoning for the inference",
      "confidence": number // 0-100 percentage
    }
  ],
  
  "recommendations": [
    {
      "serviceName": "Recommended Service (e.g. Local SEO Growth Package)",
      "issue": "Identified issue (e.g. No SEO metadata detected)",
      "impact": "Reduced organic visibility",
      "estimatedFee": "e.g. $1,000 monthly",
      "estimatedValue": number, // integer (e.g. 1000)
      "confidence": number, // 0-100 percentage
      "expectedOutcome": "e.g. More organic inquiries",
      "estimatedRoi": "e.g. 300% ROI in 90 days"
    }
  ],
  
  "opportunityScore": number, // integer (0 to 100)
  "buyingSignalScore": number, // integer (0 to 100)
  "scoreExplanations": {
    "opportunityScore": {
      "score": number,
      "explanation": "Reasoning for opportunity score",
      "breakdown": [
        { "label": "+20 Active hiring detected", "points": 20 }
      ],
      "evidence": ["Exact text quotes showing issues"]
    },
    "buyingSignalScore": {
      "score": number,
      "explanation": "Reasoning for buying signal score",
      "breakdown": [
        { "label": "+15 Growth indicators found", "points": 15 }
      ],
      "evidence": ["Exact text quotes showing signals"]
    }
  },
  
  "potentialRevenue": number, // sum of estimated values
  "closingProbability": number,
  "problemSeverity": "High" | "Medium" | "Low",
  "leadQuality": "Hot" | "Warm" | "Cold",

  "executiveSummary": "string",
  "expectedResults": "string",
  "estimatedRoi": "string",
  "thirtyDayPlan": "string",
  "ninetyDayPlan": "string",
  "pricingRecommendation": "string",
  
  "coldEmail": "string", // Reference evidence explicitly
  "linkedInMessage": "string", // Under 300 characters, referencing evidence
  "discoveryScript": "Discovery Call Questions listing 3-5 high-value questions",
  "followUpSequence": "Follow-Up Email pitch with evidence",
  "meetingAgenda": "Sales Angle hook"
}

Crawled Website Content:
"""
${combinedText}
"""
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsedData = JSON.parse(textResponse) as ClientAcquisitionResponse;

    // RULE: Suppress recommendations with confidence below 70%
    const filteredRecommendations = (parsedData.recommendations || []).filter(
      r => typeof r.confidence === 'number' && r.confidence >= 70
    );

    // Sum estimated project values of filtered recommendations to calculate revenue pipeline
    let adjustedRevenue = filteredRecommendations.reduce((acc, r) => acc + (r.estimatedValue || 0), 0);
    if (adjustedRevenue === 0 && parsedData.potentialRevenue) {
      adjustedRevenue = parsedData.potentialRevenue;
    }

    return {
      companyName: parsedData.companyName || companyName,
      verifiedFacts: parsedData.verifiedFacts || [],
      aiInferences: parsedData.aiInferences || [],
      recommendations: filteredRecommendations,
      scoreExplanations: parsedData.scoreExplanations || {
        opportunityScore: { score: 50, explanation: 'Default.', breakdown: [], evidence: [] },
        buyingSignalScore: { score: 50, explanation: 'Default.', breakdown: [], evidence: [] }
      },
      
      opportunityScore: parsedData.opportunityScore || 50,
      buyingSignalScore: parsedData.buyingSignalScore || 50,
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
    console.error('Gemini Client Acquisition Generator Error:', error);
    throw new Error(`Gemini generation failed: ${error.message}`);
  }
}
