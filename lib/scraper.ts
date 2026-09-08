import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  CrawlClassification,
  CrawlDiagnosticsReport,
  SkippedPageRecord,
  classifyCrawlFailure,
  generateCrawlDiagnosticsReport
} from './crawlDiagnostics';

export interface ScrapeResult {
  url: string;
  title: string;
  text: string;
  html: string;
  status: number;
}

export interface ScrapeAttemptResult {
  success: boolean;
  url: string;
  title: string;
  text: string;
  html: string;
  status: number | null;
  failureReason?: string;
  classification?: CrawlClassification;
}

export interface DiscoveredPage {
  url: string;
  title: string;
  category: string;
  depth: number;
  status: 'Crawled' | 'Skipped (Capped)' | 'Failed';
  textLength: number;
  snippet?: string;
  discoveredFrom?: string;
  statusCode?: number | null;
  failureReason?: string;
  classification?: string;
}

export interface CrawlDiagnostics extends CrawlDiagnosticsReport {
  warningMessage?: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  category: string;
  depth: number;
  text: string;
}

export interface CrawlData {
  companyName: string;
  websiteUrl: string;
  pages: CrawledPage[];
  discoveredPages: DiscoveredPage[];
  diagnostics: CrawlDiagnostics;
  combinedContent: string;
}

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 4500,
  maxRedirects: 5,
  validateStatus: () => true
};

const PRIORITY_CATEGORIES: { category: string; weight: number; keywords: string[] }[] = [
  { category: 'Homepage', weight: 100, keywords: ['/'] },
  { category: 'Pricing', weight: 95, keywords: ['pricing', 'price', 'plans', 'plan', 'tier', 'cost', 'subscription', 'rates'] },
  { category: 'Products', weight: 92, keywords: ['product', 'products', 'app', 'apps', 'tool', 'tools', 'platform', 'software'] },
  { category: 'Services', weight: 90, keywords: ['service', 'services', 'offering', 'offerings', 'solution', 'solutions', 'consulting'] },
  { category: 'Features', weight: 88, keywords: ['feature', 'features', 'capability', 'capabilities', 'tech', 'technology', 'how-it-works'] },
  { category: 'About', weight: 82, keywords: ['about', 'about-us', 'company', 'story', 'mission', 'team', 'who-we-are', 'leadership'] },
  { category: 'Careers', weight: 78, keywords: ['career', 'careers', 'job', 'jobs', 'hiring', 'join-us', 'work-with-us', 'openings'] },
  { category: 'FAQ', weight: 75, keywords: ['faq', 'faqs', 'frequently-asked-questions', 'help', 'support', 'q-and-a'] },
  { category: 'Blog', weight: 70, keywords: ['blog', 'article', 'articles', 'post', 'posts', 'news', 'press', 'insights'] },
  { category: 'Resources', weight: 68, keywords: ['resource', 'resources', 'guide', 'guides', 'case-study', 'case-studies', 'whitepaper', 'docs', 'documentation'] },
  { category: 'Contact', weight: 65, keywords: ['contact', 'contact-us', 'reach-us', 'book', 'demo', 'get-in-touch', 'talk-to-us'] },
  { category: 'Terms', weight: 55, keywords: ['terms', 'terms-of-service', 'tos', 'terms-and-conditions', 'legal'] },
  { category: 'Privacy', weight: 50, keywords: ['privacy', 'privacy-policy', 'privacy-notice', 'gdpr'] }
];

const DISALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv',
  '.css', '.js', '.json', '.xml', '.rss',
  '.woff', '.woff2', '.ttf', '.eot',
  '.exe', '.dmg', '.pkg'
];

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, head, nav, footer, iframe, noscript, svg, img, header, aside, .cookie-banner, .banner').remove();
  
  $('br, hr, p, div, li, h1, h2, h3, h4, h5, h6').each(function() {
    $(this).append(' ');
  });

  return $.text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000); // 3000 chars per page provides high density without blowing token budget
}

export function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    // Strip trailing slash for consistency (unless root)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

export function classifyUrl(url: string, anchorText?: string): { category: string; weight: number } {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase() + ' ' + (anchorText || '').toLowerCase();
    
    if (parsed.pathname === '/' || parsed.pathname === '') {
      return { category: 'Homepage', weight: 100 };
    }

    for (const item of PRIORITY_CATEGORIES) {
      if (item.category === 'Homepage') continue;
      for (const kw of item.keywords) {
        if (path.includes(kw)) {
          return { category: item.category, weight: item.weight };
        }
      }
    }
    return { category: 'General', weight: 20 };
  } catch (e) {
    return { category: 'General', weight: 10 };
  }
}

function isDisallowedExtension(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return DISALLOWED_EXTENSIONS.some(ext => pathname.endsWith(ext));
  } catch (e) {
    return false;
  }
}

async function fetchRobotsDisallowedPaths(baseUrl: string): Promise<string[]> {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    const res = await axios.get(robotsUrl, { ...AXIOS_CONFIG, timeout: 2500 });
    if (res.status === 200 && typeof res.data === 'string') {
      const lines = res.data.split('\n');
      const disallowed: string[] = [];
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (/^disallow:\s*/i.test(line)) {
          const pathPart = line.replace(/^disallow:\s*/i, '').trim();
          if (pathPart && pathPart !== '/' && !pathPart.includes('*')) {
            disallowed.push(pathPart.toLowerCase());
          }
        }
      }
      return disallowed;
    }
  } catch {
    // Non-blocking fallback if robots.txt unreachable
  }
  return [];
}

function isPathRobotsDisallowed(url: string, disallowedPaths: string[]): boolean {
  if (!disallowedPaths.length) return false;
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return disallowedPaths.some(dis => pathname.startsWith(dis));
  } catch {
    return false;
  }
}

export async function scrapeUrlWithDiagnostics(
  url: string,
  isRobotsBlocked: boolean = false
): Promise<ScrapeAttemptResult> {
  const normalized = normalizeUrl(url);

  if (isDisallowedExtension(normalized)) {
    return {
      success: false,
      url: normalized,
      title: normalized,
      text: '',
      html: '',
      status: null,
      classification: 'Unknown',
      failureReason: 'Omitted disallowed binary/media file extension.'
    };
  }

  if (isRobotsBlocked) {
    const failure = classifyCrawlFailure({ isRobotsBlocked: true });
    return {
      success: false,
      url: normalized,
      title: normalized,
      text: '',
      html: '',
      status: null,
      classification: failure.classification as CrawlClassification,
      failureReason: failure.failureReason
    };
  }

  try {
    let finalUrl = normalized;
    let config = { ...AXIOS_CONFIG };

    const proxyApiKey = process.env.SCRAPING_PROXY_API_KEY;
    const proxyService = (process.env.SCRAPING_PROXY_SERVICE || 'scrapingbee').toLowerCase();

    if (proxyApiKey) {
      if (proxyService === 'scrapingbee') {
        finalUrl = `https://app.scrapingbee.com/api/v1/?api_key=${proxyApiKey}&url=${encodeURIComponent(normalized)}&render_js=false`;
        config.timeout = 15000;
      } else if (proxyService === 'zenrows') {
        finalUrl = `https://api.zenrows.com/v1/?apikey=${proxyApiKey}&url=${encodeURIComponent(normalized)}`;
        config.timeout = 15000;
      }
    }

    const response = await axios.get(finalUrl, config);
    const html = typeof response.data === 'string' ? response.data : '';

    if (response.status >= 400) {
      const failure = classifyCrawlFailure({ statusCode: response.status, html });
      return {
        success: false,
        url: normalized,
        title: normalized,
        text: '',
        html,
        status: response.status,
        classification: failure.classification as CrawlClassification,
        failureReason: failure.failureReason
      };
    }

    const text = cleanText(html);
    const $ = cheerio.load(html || '');
    const title = $('title').text().trim() || new URL(normalized).pathname || normalized;

    // Check for SPA shells needing JavaScript
    if (text.length < 50) {
      const failure = classifyCrawlFailure({
        statusCode: response.status,
        html,
        textLength: text.length
      });

      return {
        success: false,
        url: normalized,
        title,
        text,
        html,
        status: response.status,
        classification: failure.classification as CrawlClassification,
        failureReason: failure.failureReason
      };
    }

    return {
      success: true,
      url: normalized,
      title,
      text,
      html,
      status: response.status
    };
  } catch (error: any) {
    const statusCode = error.response?.status || null;
    const responseHtml = typeof error.response?.data === 'string' ? error.response.data : '';
    const failure = classifyCrawlFailure({
      statusCode,
      errorMessage: error.message || String(error),
      html: responseHtml
    });

    return {
      success: false,
      url: normalized,
      title: normalized,
      text: '',
      html: responseHtml,
      status: statusCode,
      classification: failure.classification as CrawlClassification,
      failureReason: failure.failureReason
    };
  }
}

export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  const result = await scrapeUrlWithDiagnostics(url);
  if (!result.success || result.text.length < 50) {
    return null;
  }
  return {
    url: result.url,
    title: result.title,
    text: result.text,
    html: result.html,
    status: result.status || 200
  };
}

function extractLinksFromHtml(html: string, currentUrl: string, baseDomain: string): { url: string; anchorText: string }[] {
  const links: { url: string; anchorText: string }[] = [];
  if (!html) return links;

  try {
    const $ = cheerio.load(html);
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const anchorText = $(element).text().trim();
      if (!href) return;

      const lowerHref = href.toLowerCase().trim();
      if (lowerHref.startsWith('mailto:') || lowerHref.startsWith('tel:') || lowerHref.startsWith('javascript:') || lowerHref.startsWith('#')) {
        return;
      }

      try {
        let abs = new URL(href, currentUrl).toString();
        abs = abs.split('#')[0]; // Strip fragment
        const urlObj = new URL(abs);
        const linkDomain = urlObj.hostname.replace(/^www\./i, '');

        if (linkDomain === baseDomain && !isDisallowedExtension(abs)) {
          // Normalize trailing slash
          if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
            urlObj.pathname = urlObj.pathname.slice(0, -1);
          }
          links.push({ url: urlObj.toString(), anchorText });
        }
      } catch (err) {
        // Skip invalid URL
      }
    });
  } catch (err) {
    // Cheerio parse error
  }

  return links;
}

export async function crawlWebsite(targetUrl: string, maxPages: number = 20, maxDepth: number = 2): Promise<CrawlData> {
  const startTime = Date.now();
  const normalizedBase = normalizeUrl(targetUrl);
  const baseDomain = new URL(normalizedBase).hostname.replace(/^www\./i, '');
  const fallbackName = baseDomain.split('.')[0].toUpperCase() || 'Target Company';

  // 0. Pre-fetch robots.txt rules
  const disallowedPaths = await fetchRobotsDisallowedPaths(normalizedBase);

  // Tracking containers
  const discoveredMap = new Map<string, {
    url: string;
    title: string;
    category: string;
    weight: number;
    depth: number;
    discoveredFrom?: string;
  }>();

  const crawledPages: CrawledPage[] = [];
  const crawledUrls = new Set<string>();
  const failedScrapes = new Map<string, {
    title: string;
    statusCode: number | null;
    failureReason: string;
    classification: CrawlClassification;
  }>();

  // 1. Initialize with Homepage (Depth 0)
  const homeCategory = classifyUrl(normalizedBase);
  discoveredMap.set(normalizedBase, {
    url: normalizedBase,
    title: 'Homepage',
    category: 'Homepage',
    weight: homeCategory.weight,
    depth: 0,
  });

  // 2. Scrape Homepage
  const isHomeBlocked = isPathRobotsDisallowed(normalizedBase, disallowedPaths);
  const homepageAttempt = await scrapeUrlWithDiagnostics(normalizedBase, isHomeBlocked);

  if (!homepageAttempt.success || homepageAttempt.text.length < 50) {
    const elapsed = Date.now() - startTime;
    failedScrapes.set(normalizedBase, {
      title: homepageAttempt.title || fallbackName,
      statusCode: homepageAttempt.status,
      failureReason: homepageAttempt.failureReason || 'Homepage request blocked or returned insufficient text.',
      classification: homepageAttempt.classification || 'Unknown'
    });

    const failedPageRecord: DiscoveredPage = {
      url: normalizedBase,
      title: fallbackName,
      category: 'Homepage',
      depth: 0,
      status: 'Failed',
      textLength: homepageAttempt.text?.length || 0,
      statusCode: homepageAttempt.status,
      failureReason: homepageAttempt.failureReason || 'Homepage request blocked or returned insufficient text.',
      classification: homepageAttempt.classification || 'Unknown',
      snippet: homepageAttempt.failureReason
    };

    const initialReport = generateCrawlDiagnosticsReport({
      pagesDiscovered: 1,
      pagesCrawled: 0,
      pagesSkipped: 1,
      crawlDurationMs: elapsed,
      totalTextExtracted: 0,
      skippedPages: [
        {
          url: normalizedBase,
          title: fallbackName,
          category: 'Homepage',
          depth: 0,
          statusCode: homepageAttempt.status,
          failureReason: homepageAttempt.failureReason || 'Homepage request blocked or returned insufficient text.',
          classification: homepageAttempt.classification || 'Unknown'
        }
      ]
    });

    return {
      companyName: fallbackName,
      websiteUrl: normalizedBase,
      pages: [],
      discoveredPages: [failedPageRecord],
      diagnostics: {
        ...initialReport,
        warningMessage: 'Direct website crawler was blocked or returned no textual content.'
      },
      combinedContent: `<crawling_failed domain="${baseDomain}" companyName="${fallbackName}" url="${normalizedBase}" />`
    };
  }

  // Record successful homepage
  crawledPages.push({
    url: homepageAttempt.url,
    title: homepageAttempt.title,
    category: 'Homepage',
    depth: 0,
    text: homepageAttempt.text
  });
  crawledUrls.add(homepageAttempt.url);

  // Discover Level 1 internal links from Homepage
  const level1Links = extractLinksFromHtml(homepageAttempt.html, homepageAttempt.url, baseDomain);
  for (const link of level1Links) {
    if (!discoveredMap.has(link.url)) {
      const cls = classifyUrl(link.url, link.anchorText);
      discoveredMap.set(link.url, {
        url: link.url,
        title: link.anchorText || link.url,
        category: cls.category,
        weight: cls.weight,
        depth: 1,
        discoveredFrom: homepageAttempt.url
      });
    }
  }

  // Helper to get remaining un-crawled candidates sorted by priority
  const getSortedQueue = () => {
    return Array.from(discoveredMap.values())
      .filter(item => !crawledUrls.has(item.url) && !failedScrapes.has(item.url) && item.depth <= maxDepth)
      .sort((a, b) => {
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        return a.depth - b.depth;
      });
  };

  // 3. Multi-Page BFS Crawler Loop (Batches of 5, up to maxPages)
  const BATCH_SIZE = 5;
  while (crawledPages.length < maxPages) {
    const queue = getSortedQueue();
    if (queue.length === 0) break;

    const currentBatch = queue.slice(0, Math.min(BATCH_SIZE, maxPages - crawledPages.length));
    
    // Concurrently fetch the batch
    const scrapeTasks = currentBatch.map(async item => {
      const isBlocked = isPathRobotsDisallowed(item.url, disallowedPaths);
      const res = await scrapeUrlWithDiagnostics(item.url, isBlocked);
      return { item, res };
    });

    const batchResults = await Promise.allSettled(scrapeTasks);

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        const { item, res } = result.value;
        crawledUrls.add(item.url);

        if (res.success && res.text.length > 50) {
          crawledPages.push({
            url: res.url,
            title: res.title || item.title,
            category: item.category,
            depth: item.depth,
            text: res.text
          });

          // If this was a depth 1 page and depth limit allows, discover depth 2 links
          if (item.depth === 1 && maxDepth >= 2) {
            const level2Links = extractLinksFromHtml(res.html, res.url, baseDomain);
            for (const l2 of level2Links) {
              if (!discoveredMap.has(l2.url)) {
                const cls = classifyUrl(l2.url, l2.anchorText);
                discoveredMap.set(l2.url, {
                  url: l2.url,
                  title: l2.anchorText || l2.url,
                  category: cls.category,
                  weight: cls.weight,
                  depth: 2,
                  discoveredFrom: res.url
                });
              }
            }
          }
        } else {
          // Record failed scrape attempt
          failedScrapes.set(item.url, {
            title: res.title || item.title,
            statusCode: res.status,
            failureReason: res.failureReason || 'Failed to extract textual content.',
            classification: res.classification || 'Unknown'
          });
        }
      }
    }
  }

  const elapsed = Date.now() - startTime;
  const totalDiscovered = discoveredMap.size;
  const totalCrawled = crawledPages.length;
  const totalSkipped = Math.max(0, totalDiscovered - totalCrawled);
  const totalTextExtracted = crawledPages.reduce((acc, p) => acc + p.text.length, 0);
  const coveragePercentage = totalDiscovered > 0
    ? Math.min(100, Math.round((totalCrawled / totalDiscovered) * 100))
    : 100;

  // Build Discovered Pages Inventory for Evidence Vault & Diagnostics
  const discoveredPages: DiscoveredPage[] = Array.from(discoveredMap.values()).map(item => {
    const isCrawled = crawledPages.some(p => p.url === item.url);
    const failedMatch = failedScrapes.get(item.url);
    const crawledMatch = crawledPages.find(p => p.url === item.url);

    if (isCrawled && crawledMatch) {
      return {
        url: item.url,
        title: crawledMatch.title || item.title,
        category: item.category,
        depth: item.depth,
        status: 'Crawled',
        textLength: crawledMatch.text.length,
        statusCode: 200,
        snippet: crawledMatch.text.slice(0, 160) + '...',
        discoveredFrom: item.discoveredFrom
      };
    }

    if (failedMatch) {
      return {
        url: item.url,
        title: failedMatch.title || item.title,
        category: item.category,
        depth: item.depth,
        status: 'Failed',
        textLength: 0,
        statusCode: failedMatch.statusCode,
        failureReason: failedMatch.failureReason,
        classification: failedMatch.classification,
        snippet: failedMatch.failureReason,
        discoveredFrom: item.discoveredFrom
      };
    }

    // Skipped due to budget cap or robots
    const isDisallowed = isPathRobotsDisallowed(item.url, disallowedPaths);
    const cappedClassification: CrawlClassification = isDisallowed ? 'Robots Blocked' : 'Capped';
    const cappedReason = isDisallowed
      ? 'Disallowed by website robots.txt rules.'
      : 'Discovered link omitted due to max crawl budget of 20 prioritized pages.';

    return {
      url: item.url,
      title: item.title,
      category: item.category,
      depth: item.depth,
      status: 'Skipped (Capped)',
      textLength: 0,
      statusCode: null,
      failureReason: cappedReason,
      classification: cappedClassification,
      snippet: cappedReason,
      discoveredFrom: item.discoveredFrom
    };
  });

  // Extract skipped pages array for diagnostic report
  const skippedPagesList: SkippedPageRecord[] = discoveredPages
    .filter(p => p.status !== 'Crawled')
    .map(p => ({
      url: p.url,
      title: p.title,
      category: p.category,
      depth: p.depth,
      statusCode: p.statusCode ?? null,
      failureReason: p.failureReason || 'Not crawled',
      classification: (p.classification as any) || 'Unknown',
      discoveredFrom: p.discoveredFrom
    }));

  // Generate full diagnostics report
  const diagnosticsReport = generateCrawlDiagnosticsReport({
    pagesDiscovered: totalDiscovered,
    pagesCrawled: totalCrawled,
    pagesSkipped: totalSkipped,
    crawlDurationMs: elapsed,
    totalTextExtracted,
    skippedPages: skippedPagesList
  });

  const warningMessage = diagnosticsReport.coverageWarning || (totalCrawled <= 1
    ? 'Limited website coverage may reduce analysis quality.'
    : undefined);

  // 4. Build Structured Multi-Page XML Context for Gemini
  let combinedContent = `<website url="${normalizedBase}" pagesDiscovered="${totalDiscovered}" pagesCrawled="${totalCrawled}" coverage="${coveragePercentage}%">\n\n`;
  crawledPages.forEach(p => {
    combinedContent += `<page url="${p.url}" title="${p.title}" category="${p.category}" depth="${p.depth}">\n`;
    combinedContent += `${p.text}\n`;
    combinedContent += `</page>\n\n`;
  });
  combinedContent += `</website>`;

  const companyNameCandidate = homepageAttempt.title.split('|')[0].split('-')[0].trim() || fallbackName;

  return {
    companyName: companyNameCandidate,
    websiteUrl: normalizedBase,
    pages: crawledPages,
    discoveredPages,
    diagnostics: {
      ...diagnosticsReport,
      warningMessage
    },
    combinedContent
  };
}
