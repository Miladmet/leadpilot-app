const https = require('https');
const { SEO_KEYWORDS } = require('../lib/seoKeywordsCore');
const { CASE_STUDIES } = require('../lib/caseStudiesCore');
const { BLOG_ARTICLES } = require('../lib/blogArticlesCore');

const HOST = 'www.leadpilotsoftware.com';
const BASE_URL = `https://${HOST}`;
const KEY = 'f739e7196b504df88f4d058547bc2c75';
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`;

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
  '/register',
  '/agency-prospecting-software',
  '/website-audit-tool',
  '/proposal-generator',
  '/competitor-gap-analysis',
  '/client-acquisition-software',
  '/marketing-agency-software'
];

const caseStudyRoutes = Object.keys(CASE_STUDIES).map(k => `/case-studies/${k}`);
const blogRoutes = Object.keys(BLOG_ARTICLES).map(k => `/blog/${k}`);
const toolRoutes = Object.keys(SEO_KEYWORDS).map(k => `/tools/${k}`);

const urlList = [
  ...coreRoutes,
  ...caseStudyRoutes,
  ...blogRoutes,
  ...toolRoutes
].map(r => `${BASE_URL}${r}`);

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList
});

function submitToIndexNow(apiHost, apiPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: apiHost,
      port: 443,
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, statusMessage: res.statusMessage, body: data });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log(`Submitting ${urlList.length} URLs to IndexNow protocol for ${HOST}...`);
  console.log(`Key verification file: ${KEY_LOCATION}\n`);

  try {
    console.log('Sending to api.indexnow.org...');
    const res1 = await submitToIndexNow('api.indexnow.org', '/indexnow');
    console.log(`[api.indexnow.org] Status: ${res1.statusCode} (${res1.statusMessage})`);

    console.log('Sending to www.bing.com/indexnow...');
    const res2 = await submitToIndexNow('www.bing.com', '/indexnow');
    console.log(`[bing.com] Status: ${res2.statusCode} (${res2.statusMessage})`);

    console.log('\n✓ IndexNow submission successfully dispatched to Microsoft Bing & partners!');
  } catch (err) {
    console.error('Submission error:', err);
  }
}

run();
