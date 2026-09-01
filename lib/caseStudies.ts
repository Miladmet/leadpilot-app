import { CASE_STUDIES as coreCaseStudies } from './caseStudiesCore';

export interface CaseStudyData {
  slug: string;
  title: string;
  companyName: string;
  industry: string;
  opportunityValue: string;
  potentialValueRange?: string;
  auditDuration: string;
  agencyType: string;
  summary: string;
  problem?: string;
  evidence?: string;
  opportunity?: string;
  solution?: string;
  problemsFound: string[];
  opportunitiesFound: string[];
  suggestedSolutions: string[];
  beforeAfter: {
    beforeMetric: string;
    beforeState: string;
    afterMetric: string;
    afterState: string;
    revenueLift: string;
  };
  agencyRoi: {
    closedRetainer: string;
    pitchTimeSaved: string;
    winRate: string;
  };
}

export const CASE_STUDIES: Record<string, CaseStudyData> = coreCaseStudies;
