import { SEO_KEYWORDS as coreKeywords } from './seoKeywordsCore';

export interface SeoKeywordData {
  slug: string;
  keyword: string;
  title: string;
  metaDescription: string;
  headline: string;
  subtitle: string;
  targetAudience: string;
  badgeText: string;
  keyBenefits: { title: string; description: string; icon: string }[];
  problemStatement: string;
  solutionBreakdown: { step: string; title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

export const SEO_KEYWORDS: Record<string, SeoKeywordData> = coreKeywords;
