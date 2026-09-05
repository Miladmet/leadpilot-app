import { MetadataRoute } from 'next';
import { CASE_STUDIES } from '@/lib/caseStudies';
import { BLOG_ARTICLES } from '@/lib/blogArticles';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://leadpilotsoftware.com';
  const now = new Date();

  // Core Pages
  const coreRoutes = [
    '',
    '/about',
    '/methodology',
    '/what-is-leadpilot-software',
    '/case-studies',
    '/blog',
    '/tools',
    '/free-tools',
    '/login',
    '/register'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8
  }));

  // Programmatic Root Landing Pages
  const programmaticLandingPages = [
    '/agency-prospecting-software',
    '/website-audit-tool',
    '/proposal-generator',
    '/competitor-gap-analysis',
    '/client-acquisition-software',
    '/marketing-agency-software'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9
  }));

  // Case Studies
  const caseStudyRoutes = Object.keys(CASE_STUDIES).map((slug) => ({
    url: `${baseUrl}/case-studies/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85
  }));

  // Blog Articles
  const blogRoutes = Object.keys(BLOG_ARTICLES).map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }));

  // Solutions Directory Tool Pages
  const toolRoutes = Object.keys(SEO_KEYWORDS).map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75
  }));

  return [
    ...coreRoutes,
    ...programmaticLandingPages,
    ...caseStudyRoutes,
    ...blogRoutes,
    ...toolRoutes
  ];
}
