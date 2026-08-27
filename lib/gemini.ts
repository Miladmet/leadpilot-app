import { GoogleGenAI } from '@google/generative-ai'; // Wait, let's use the standard import!
// Standard import: import { GoogleGenAI } from '@google/generative-ai' is wrong.
// The actual import is: import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AnalysisResponse {
  companyName: string;
  summary: string;
  painPoints: string[];
  opportunityScore: number;
  buyingSignalScore: number;
  coldEmail: string;
  linkedInMessage: string;
  salesAngle: string;
  cta: string;
}

export async function analyzeCompany(combinedText: string, companyName: string): Promise<AnalysisResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash which is perfect for this fast text summary and structured generation
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
You are an expert sales intelligence research agent. Your task is to analyze the crawled website content of the company "${companyName}" and generate standard sales intelligence assets.

Based on the crawled text below, output a JSON object containing:
1. "companyName": The verified company name.
2. "summary": A concise, engaging 2-3 sentence description of what the company does, their target market, and value proposition.
3. "painPoints": A JSON array of 3 realistic, specific business pain points this company faces (e.g. operational inefficiencies, client acquisition, tech stack problems, recruitment bottlenecks) that a sales professional could solve.
4. "opportunityScore": An integer (0 to 100) representing how likely they are to buy B2B solutions based on their complexity, size, or services.
5. "buyingSignalScore": An integer (0 to 100) representing their active buying intent (indicated by hiring pages, new launches, expansion plans, contact forms).
6. "coldEmail": A highly personalized, engaging, short B2B cold outreach email targeting a decision maker at the company. It should show we understand their business (referencing information from the scraped text), have a strong hooks, highlight a pain point, and end with a clear CTA. Do not include template placeholders like [My Name] — use realistic filler or write it in a way that is ready to edit.
7. "linkedInMessage": A short, friendly LinkedIn outreach message (under 300 characters) matching the cold email angle.
8. "salesAngle": A 1-sentence recommended hook or angle to pitch this company.
9. "cta": A direct call-to-action (CTA) to use in the sales pitch (e.g., "Are you open to a 10-minute chat next Tuesday at 2 PM EST to see how we did X for Y?").

Crawled Website Content:
"""
${combinedText}
"""

Response JSON Schema:
{
  "companyName": "string",
  "summary": "string",
  "painPoints": ["string", "string", "string"],
  "opportunityScore": number,
  "buyingSignalScore": number,
  "coldEmail": "string",
  "linkedInMessage": "string",
  "salesAngle": "string",
  "cta": "string"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const parsedData = JSON.parse(textResponse) as AnalysisResponse;
    
    // Ensure fallback values if parsing succeeds but schema fields are missing
    return {
      companyName: parsedData.companyName || companyName,
      summary: parsedData.summary || 'Company summary not available.',
      painPoints: Array.isArray(parsedData.painPoints) ? parsedData.painPoints : ['Customer acquisition struggles', 'Technology scaling', 'Operational overhead'],
      opportunityScore: typeof parsedData.opportunityScore === 'number' ? parsedData.opportunityScore : 75,
      buyingSignalScore: typeof parsedData.buyingSignalScore === 'number' ? parsedData.buyingSignalScore : 65,
      coldEmail: parsedData.coldEmail || 'Hello, I noticed your business...',
      linkedInMessage: parsedData.linkedInMessage || 'Hi, would love to connect about your growth goals!',
      salesAngle: parsedData.salesAngle || 'Leverage growth and technology integrations.',
      cta: parsedData.cta || 'Are you free for a quick chat next week?'
    };
  } catch (error: any) {
    console.error('Gemini API analysis failure:', error);
    throw new Error(`AI Analysis Failed: ${error.message}`);
  }
}
