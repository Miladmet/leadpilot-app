import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapeResult {
  url: string;
  title: string;
  text: string;
  html: string; // Keep original HTML to extract links without re-fetching
}

export interface CrawlData {
  companyName: string;
  websiteUrl: string;
  pages: Omit<ScrapeResult, 'html'>[];
  combinedContent: string;
}

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 10000,
  validateStatus: () => true
};

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, head, nav, footer, iframe, noscript, svg, img, header').remove();
  
  $('br, hr, p, div, li, h1, h2, h3, h4, h5, h6').each(function() {
    $(this).append(' ');
  });

  return $.text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3500); // Limit to keep token size in check
}

function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  const normalized = normalizeUrl(url);
  try {
    let finalUrl = normalized;
    let config = { ...AXIOS_CONFIG };

    const proxyApiKey = process.env.SCRAPING_PROXY_API_KEY;
    const proxyService = (process.env.SCRAPING_PROXY_SERVICE || 'scrapingbee').toLowerCase();
    const customProxyUrl = process.env.SCRAPING_PROXY_URL;

    if (proxyApiKey) {
      if (proxyService === 'scrapingbee') {
        finalUrl = `https://app.scrapingbee.com/api/v1/?api_key=${proxyApiKey}&url=${encodeURIComponent(normalized)}&render_js=false`;
        config.timeout = 20000;
      } else if (proxyService === 'zenrows') {
        finalUrl = `https://api.zenrows.com/v1/?apikey=${proxyApiKey}&url=${encodeURIComponent(normalized)}`;
        config.timeout = 20000;
      } else if (proxyService === 'scraperapi') {
        finalUrl = `http://api.scraperapi.com/?api_key=${proxyApiKey}&url=${encodeURIComponent(normalized)}`;
        config.timeout = 20000;
      }
    } else if (customProxyUrl) {
      const proxyUrlObj = new URL(customProxyUrl);
      config = {
        ...config,
        proxy: {
          protocol: proxyUrlObj.protocol.replace(':', ''),
          host: proxyUrlObj.hostname,
          port: parseInt(proxyUrlObj.port || '80'),
          auth: proxyUrlObj.username ? {
            username: proxyUrlObj.username,
            password: proxyUrlObj.password
          } : undefined
        }
      };
    }

    const response = await axios.get(finalUrl, config);
    if (response.status >= 400) {
      console.warn(`Scrape failed for ${normalized} (routed through proxy: ${!!proxyApiKey}) with status ${response.status}`);
      return null;
    }
    const html = response.data;
    if (typeof html !== 'string') {
      return null;
    }
    const $ = cheerio.load(html);
    const title = $('title').text().trim() || new URL(normalized).hostname;
    const text = cleanText(html);
    return { url: normalized, title, text, html };
  } catch (error: any) {
    console.error(`Error scraping URL ${normalized} (proxy active: ${!!process.env.SCRAPING_PROXY_API_KEY}):`, error.message);
    return null;
  }
}

export async function crawlWebsite(targetUrl: string): Promise<CrawlData> {
  const normalizedBase = normalizeUrl(targetUrl);
  const baseDomain = new URL(normalizedBase).hostname.replace('www.', '');
  const fallbackName = baseDomain.split('.')[0].toUpperCase() || 'Target Company';

  // 1. Scrape Homepage
  const homepageResult = await scrapeUrl(normalizedBase);
  if (!homepageResult || homepageResult.text.length < 150) {
    // If homepage fails or gets blocked (returning empty or error page), trigger AI public archive fallback
    return {
      companyName: fallbackName,
      websiteUrl: normalizedBase,
      pages: [],
      combinedContent: `<crawling_failed domain="${baseDomain}" companyName="${fallbackName}" url="${normalizedBase}" />`
    };
  }

  const pages: Omit<ScrapeResult, 'html'>[] = [
    { url: homepageResult.url, title: homepageResult.title, text: homepageResult.text }
  ];
  
  // 2. Discover Internal Links using the already-fetched homepage HTML
  const internalLinks = new Set<string>();
  if (homepageResult.html) {
    const $html = cheerio.load(homepageResult.html);
    $html('a').each((_, element) => {
      const href = $html(element).attr('href');
      if (!href) return;

      try {
        let absoluteUrl = new URL(href, normalizedBase).toString();
        absoluteUrl = absoluteUrl.split('#')[0]; // strip hash
        
        const urlObj = new URL(absoluteUrl);
        const linkDomain = urlObj.hostname.replace('www.', '');

        if (linkDomain === baseDomain) {
          const path = urlObj.pathname.toLowerCase();
          const matchKeywords = ['about', 'service', 'career', 'hiring', 'jobs', 'contact', 'solution', 'product', 'team'];
          if (matchKeywords.some(keyword => path.includes(keyword))) {
            internalLinks.add(absoluteUrl);
          }
        }
      } catch (err) {
        // Invalid URL
      }
    });
  }

  // 3. Select top 3 internal pages to reduce scrap hits
  const urlsToScrape = Array.from(internalLinks).slice(0, 3);
  
  // 4. Scrape concurrently
  const scrapePromises = urlsToScrape.map(url => scrapeUrl(url));
  const results = await Promise.all(scrapePromises);
  
  for (const res of results) {
    if (res && res.text.length > 50) {
      pages.push({ url: res.url, title: res.title, text: res.text });
    }
  }

  // 5. Build Combined Context inside XML tags
  let combinedContent = `<website url="${normalizedBase}">\n\n`;
  pages.forEach(p => {
    combinedContent += `<page url="${p.url}" title="${p.title}">\n`;
    combinedContent += `${p.text}\n`;
    combinedContent += `</page>\n\n`;
  });
  combinedContent += `</website>`;

  const companyNameCandidate = homepageResult.title.split('|')[0].split('-')[0].trim() || fallbackName;

  return {
    companyName: companyNameCandidate,
    websiteUrl: normalizedBase,
    pages,
    combinedContent
  };
}
