import { GoogleGenerativeAI } from '@google/generative-ai';

export interface SuggestedService {
  name: string;
  issue: string;
  estimatedFee: string; // e.g. "$3,500 setup" or "$750/mo retainer"
  confidence: number; // 0 to 100 percentage
}

export interface ClientAcquisitionResponse {
  companyName: string;
  problem: string;
  opportunity: string;
  proposedSolution: string;
  servicesSuggested: SuggestedService[];
  potentialRevenue: number; // Opportunity Total (integer e.g. 4700)
  closingProbability: number; // 0-100 percentage
  problemSeverity: 'High' | 'Medium' | 'Low';
  leadQuality: 'Hot' | 'Warm' | 'Cold';
  
  // Proposal Builder Content
  executiveSummary: string;
  expectedResults: string;
  estimatedRoi: string;
  thirtyDayPlan: string;  // Detailed roadmap plan
  ninetyDayPlan: string;  // Detailed roadmap plan
  pricingRecommendation: string;

  // Outreach Center
  coldEmail: string;
  linkedInMessage: string;
  discoveryScript: string;
  followUpSequence: string; // Follow-up emails
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

  const prompt = `
You are an expert client acquisition AI agent. Your task is to analyze the crawled website content of the company "${companyName}" and compile a high-value client acquisition report, service recommendations, and an outreach proposal.

Analyze the crawled text for issues and opportunities in:
1. Marketing (e.g. Weak SEO, missing content strategy, poor conversion funnels, weak CTAs).
2. Web Design (e.g. Outdated design, poor mobile experience, slow performance, UX issues).
3. AI Automation (e.g. Lack of chatbot, repetitive customer service processes, manual operations).
4. Recruiting (e.g. Open hiring roles, growth indicators, training gaps).
5. Operations (e.g. Missing online scheduling, poor lead capture).

Based on this analysis, generate a JSON object matching the schema below:

### Output JSON Schema:
{
  "companyName": "Verified Company Name",
  "problem": "Clear, detailed breakdown of the main business problems and inefficiencies identified on their website.",
  "opportunity": "Details on the potential business growth, customer retention, or cost savings they can achieve by fixing these issues.",
  "proposedSolution": "A high-level summary of the recommended strategies to solve their problems.",
  
  "servicesSuggested": [
    {
      "name": "Service Name (e.g. Local SEO Growth Package, AI Chatbot Setup, Website Redesign)",
      "issue": "Specific issue this service solves",
      "estimatedFee": "Estimated billing rate (e.g. $1,200 setup, $750/month retainer)",
      "confidence": 92 (integer percentage representing confidence level of fit)
    }
  ],
  
  "potentialRevenue": 4700, // Total value of recommended services combined (Sum of setup and monthly fees as an integer)
  "closingProbability": 65, // Probability of closing this deal (0 to 100 integer based on severity and signal strength)
  "problemSeverity": "High" | "Medium" | "Low",
  "leadQuality": "Hot" | "Warm" | "Cold",

  "executiveSummary": "A compelling executive summary pitch explaining why they need to act now.",
  "expectedResults": "Quantifiable outcomes (e.g., 40% increase in website speed, 2x lead conversion, 15 hours saved weekly).",
  "estimatedRoi": "Calculated expected return on investment (e.g., $3,000 monthly value from 4 new clients, paying back setup in 30 days).",
  
  "thirtyDayPlan": "A list of action items to complete in the first 30 days (e.g. technical SEO audit, mockups creation, initial script triggers).",
  "ninetyDayPlan": "A list of expansion plans, dashboard analytics, and performance reviews to conduct within 90 days.",
  "pricingRecommendation": "Pricing tier recommendation (e.g., Standard Package: $1,500/mo, Enterprise: $3,500/mo).",
  
  "coldEmail": "A short, highly personalized cold outreach email presenting the findings, referencing the scraped data, and ending with a clear CTA.",
  "linkedInMessage": "A short, friendly LinkedIn connection request pitch under 300 characters.",
  "discoveryScript": "A structured discovery call script for a 15-minute meeting, including questions to ask and responses.",
  "followUpSequence": "A sequence of two short follow-up emails to send if they do not reply to the first email.",
  "meetingAgenda": "A bulleted meeting agenda for the initial discovery call."
}

Crawled Website Content:
\"\"\"
${combinedText}
\"\"\"
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsedData = JSON.parse(textResponse) as ClientAcquisitionResponse;

    // Return parsed data with fallbacks
    return {
      companyName: parsedData.companyName || companyName,
      problem: parsedData.problem || 'Outdated online presence.',
      opportunity: parsedData.opportunity || 'Capture high-value local search traffic.',
      proposedSolution: parsedData.proposedSolution || 'Deploy SEO and automated chat hooks.',
      servicesSuggested: Array.isArray(parsedData.servicesSuggested) ? parsedData.servicesSuggested : [],
      potentialRevenue: typeof parsedData.potentialRevenue === 'number' ? parsedData.potentialRevenue : 1500,
      closingProbability: typeof parsedData.closingProbability === 'number' ? parsedData.closingProbability : 50,
      problemSeverity: parsedData.problemSeverity || 'Medium',
      leadQuality: parsedData.leadQuality || 'Warm',
      executiveSummary: parsedData.executiveSummary || 'Upgrade digital infrastructure to scale leads.',
      expectedResults: parsedData.expectedResults || '2x lead pipeline growth.',
      estimatedRoi: parsedData.estimatedRoi || 'Positive return in 45 days.',
      thirtyDayPlan: parsedData.thirtyDayPlan || 'Launch optimization campaign.',
      ninetyDayPlan: parsedData.ninetyDayPlan || 'Optimize retention metrics.',
      pricingRecommendation: parsedData.pricingRecommendation || '$1,000 retainer.',
      coldEmail: parsedData.coldEmail || 'Hello, I saw your site...',
      linkedInMessage: parsedData.linkedInMessage || 'Would love to connect.',
      discoveryScript: parsedData.discoveryScript || '1. Ask about scaling issues.',
      followUpSequence: parsedData.followUpSequence || 'Hi, just following up...',
      meetingAgenda: parsedData.meetingAgenda || '1. Quick intros\n2. Findings\n3. Solutions.'
    };
  } catch (error: any) {
    console.error('Gemini Client Acquisition Generation Error:', error);
    throw new Error(`AI Analysis Pivot Failed: ${error.message}`);
  }
}
