const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// ========================================================
// DEMO BACKEND DATA & MOCK DATABASE
// ========================================================
const DEMO_CREATORS = [
  {
    id: 'creator-1',
    name: 'Tamim Hasan',
    handle: '@tamim_techbd',
    category: 'Tech Reviewer',
    subscribers: '620K',
    engagementRate: '5.8%',
    verified: true,
    avatar: 'assets/images/imgCreator1Webp.png',
    badge: 'Verified Creator',
    tags: ['Smartphones', 'Hardware', 'Productivity'],
    rating: 4.9,
    completedDeals: 42
  },
  {
    id: 'creator-2',
    name: 'Aisha Rahman',
    handle: '@aishalifestyle',
    category: 'Lifestyle & Design',
    subscribers: '410K',
    engagementRate: '7.2%',
    verified: true,
    avatar: 'assets/images/imgCreator2Webp.png',
    badge: 'Top Engagement',
    tags: ['Vlogs', 'Fashion', 'Eco-friendly'],
    rating: 5.0,
    completedDeals: 36
  },
  {
    id: 'creator-3',
    name: 'Rafi Al-Mamun',
    handle: '@rafi_streams',
    category: 'Gaming & Esports',
    subscribers: '890K',
    engagementRate: '8.4%',
    verified: true,
    avatar: 'assets/images/imgCreator3Webp.png',
    badge: 'Premier Streamer',
    tags: ['Livestream', 'Esports', 'Gaming Gear'],
    rating: 4.9,
    completedDeals: 58
  }
];

const DEMO_PAYOUTS = [
  {
    id: 'bkash',
    name: 'bKash',
    type: 'Mobile Financial Service',
    logo: 'assets/images/payment_bkash.png',
    supportedCurrencies: ['BDT'],
    minWithdrawal: '৳500',
    fee: '0% on creator withdrawals',
    processingTime: 'Instant to 30 mins',
    status: 'Available in Bangladesh'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    type: 'Mobile Financial Service',
    logo: 'assets/images/payment_nagad.png',
    supportedCurrencies: ['BDT'],
    minWithdrawal: '৳500',
    fee: '0% on creator withdrawals',
    processingTime: 'Instant to 30 mins',
    status: 'Available in Bangladesh'
  },
  {
    id: 'payoneer',
    name: 'Payoneer',
    type: 'Global Cross-Border Wallet',
    logo: 'assets/images/payment_payoneer.png',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    minWithdrawal: '$50',
    fee: 'Standard bank-rate conversion',
    processingTime: '1-2 business days',
    status: 'Global (150+ countries)'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    type: 'Direct Local Electronic Transfer',
    logo: 'assets/icons/payment_bank.svg',
    supportedCurrencies: ['BDT', 'USD Wire', 'EUR SEPA'],
    minWithdrawal: '$100 or ৳5,000',
    fee: 'Direct EFTN / BEFTN (Free)',
    processingTime: '2-3 business days',
    status: 'Direct to Local Bank Account'
  }
];

const DEMO_FAQS = {
  general: [
    {
      q: 'What is Sponso?',
      a: 'SWIFT SPONSORS HUB brings an advertising network, creator sponsorship marketplace, and website and app monetization into a single connected growth ecosystem.'
    },
    {
      q: 'Who is the platform for?',
      a: 'Sponso is built for ambitious advertisers seeking real performance, content creators looking for transparent brand deals, and publishers looking to maximize their ad revenue.'
    },
    {
      q: 'Can I advertise locally and internationally?',
      a: 'Yes! With our hyper-local geo-targeting, you can reach audiences within specific zip codes or expand across global markets with localized campaign parameters.'
    },
    {
      q: 'How do creator sponsorships work?',
      a: 'Brands propose campaigns with clear deliverables, and creators accept offers that align with their audience. Funds are held securely in escrow until campaign milestones are verified.'
    },
    {
      q: 'How can I monetize my website or app?',
      a: 'Integrate our lightweight SDK or ad tags in minutes. Our AI header bidding engine connects your ad inventory with premier global and local ad demand partners for maximum CPMs.'
    },
    {
      q: 'Is the platform available to join now?',
      a: 'We are currently onboarding partners in rolling early-access cohorts. Submit your application today to secure your priority access spot.'
    }
  ],
  creator: [
    {
      q: 'How do creators get paid on Sponso?',
      a: 'When you accept and complete a brand sponsorship campaign or meet affiliate milestones, approved earnings are held in escrow and transferred into your available balance, withdrawable via bKash, Nagad, Payoneer, or direct bank transfer.'
    },
    {
      q: 'Do I need a minimum subscriber count to join?',
      a: 'No minimum threshold! We welcome nano, micro, and macro creators across YouTube, Twitch, Instagram, TikTok, blogs, and podcasts. Brands value high engagement and authenticity.'
    },
    {
      q: 'Are sponsorship agreements legally secured?',
      a: 'Yes. Every sponsorship on Sponso has clear automated deliverables, delivery schedules, and escrow protection, guaranteeing you are paid as agreed without chasing invoices.'
    },
    {
      q: 'Can I retain full creative control over my content?',
      a: 'Always. You only accept brand offers whose creative brief aligns with your editorial standards and audience voice. You set your own rates and terms.'
    }
  ]
};

const DEMO_SUBMISSIONS = [];

// ========================================================
// HTTP REQUEST HANDLER
// ========================================================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers for easy development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- API ROUTE: GET /api/creators ---
  if (pathname === '/api/creators' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      total: DEMO_CREATORS.length,
      creators: DEMO_CREATORS
    }));
    return;
  }

  // --- API ROUTE: GET /api/payout-methods ---
  if (pathname === '/api/payout-methods' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      methods: DEMO_PAYOUTS
    }));
    return;
  }

  // --- API ROUTE: GET /api/faqs ---
  if (pathname === '/api/faqs' && method === 'GET') {
    const type = parsedUrl.query.type || 'general';
    const faqs = DEMO_FAQS[type] || DEMO_FAQS.general;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      type,
      faqs
    }));
    return;
  }

  // --- API ROUTE: POST /api/join (Creator Cohort Registration) ---
  if (pathname === '/api/join' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        let data = {};
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
          data = JSON.parse(body || '{}');
        } else {
          // Parse URL encoded
          const qs = new URLSearchParams(body);
          data = Object.fromEntries(qs.entries());
        }

        const name = (data.name || '').trim();
        const email = (data.email || '').trim();
        const platform = (data.platform || 'General Creator').trim();
        const handle = (data.handle || '').trim();

        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            success: false,
            error: 'Valid email address is required.'
          }));
          return;
        }

        const submission = {
          id: 'sub_' + Date.now(),
          name: name || 'Creator Partner',
          email,
          platform,
          handle: handle || '@creator',
          timestamp: new Date().toISOString(),
          status: 'Priority Cohort Verified',
          cohort: 'Alpha Cohort #1'
        };

        DEMO_SUBMISSIONS.push(submission);
        console.log(`[API] New creator registration: ${submission.name} (${submission.email}) - Platform: ${submission.platform}`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Priority creator cohort registration confirmed! Welcome to Swift Sponsors Hub.',
          submission
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON request payload.'
        }));
      }
    });
    return;
  }

  // --- API ROUTE: GET /api/submissions (Admin/Demo Check) ---
  if (pathname === '/api/submissions' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: true,
      count: DEMO_SUBMISSIONS.length,
      submissions: DEMO_SUBMISSIONS
    }));
    return;
  }

  // --- STATIC FILE SERVING ---
  let safeUrl = decodeURI(pathname);
  let filePath = path.join(__dirname, safeUrl === '/' ? 'index.html' : safeUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Sponso dev server running at http://localhost:${PORT}/ with REST API enabled`);
});
