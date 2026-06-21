import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-Memory Database State
let userProfile = {
  registered: false,
  email: '',
  name: '',
  startupName: '',
  description: '',
  industry: 'AI & SaaS',
  country: 'India',
  stage: 'Idea', // Idea, Validation, MVP, Revenue, Fundraising
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

// Initial Mock Databases
let fundingSchemes = [
  {
    id: 'f-1',
    name: 'Startup India Seed Fund Scheme (SISFS)',
    provider: 'Department for Promotion of Industry and Internal Trade (DPIIT)',
    type: 'Grant / Debt',
    description: 'Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.',
    amount: 'Up to ₹50 Lakhs',
    equity: '0% (Non-dilutive grant / convertible debt)',
    deadline: '2026-09-30',
    applyLink: 'https://www.startupindia.gov.in',
    stages: ['Idea', 'Validation', 'MVP'],
    countries: ['India'],
    industries: ['Any'],
    lastVerified: '2026-06-15',
    criteria: {
      minStage: 'Idea',
      maxStage: 'MVP',
      mustBeIncorporated: true,
      dpiitRecognized: true,
    }
  },
  {
    id: 'f-2',
    name: 'Y Combinator (W26 Batch)',
    provider: 'Y Combinator',
    type: 'Accelerator',
    description: 'Twice a year, YC invests $500k in a large number of startups. We work intensively with the startups for three months to get them into the best shape possible.',
    amount: '$500,000',
    equity: '7% standard + $375k uncapped SAFE',
    deadline: '2026-08-15',
    applyLink: 'https://www.ycombinator.com',
    stages: ['Idea', 'Validation', 'MVP', 'Revenue'],
    countries: ['Any'],
    industries: ['AI', 'SaaS', 'Fintech', 'Marketplace', 'Hardware', 'BioTech'],
    lastVerified: '2026-06-20',
    criteria: {
      minStage: 'Idea',
      maxStage: 'Revenue',
      mustBeIncorporated: false,
      dpiitRecognized: false,
    }
  },
  {
    id: 'f-3',
    name: 'MeitY SAMRIDH Scheme',
    provider: 'Ministry of Electronics and Information Technology (MeitY)',
    type: 'Accelerator / Grant',
    description: 'Supports software product startups with funding, mentorship, and market access to scale their businesses globally.',
    amount: 'Up to ₹40 Lakhs matching funding',
    equity: 'Requires matching VC investment',
    deadline: '2026-10-15',
    applyLink: 'https://meitystartuphub.in',
    stages: ['MVP', 'Revenue'],
    countries: ['India'],
    industries: ['Software', 'SaaS', 'DeepTech'],
    lastVerified: '2026-06-10',
    criteria: {
      minStage: 'MVP',
      maxStage: 'Fundraising',
      mustBeIncorporated: true,
      dpiitRecognized: true,
    }
  },
  {
    id: 'f-4',
    name: 'AWS Activate Portfolio',
    provider: 'Amazon Web Services',
    type: 'Credits',
    description: 'Provides startups with free AWS cloud credits, technical support, and training resources to help scale their businesses.',
    amount: 'Up to $100,000 in Credits',
    equity: '0% (Non-dilutive)',
    deadline: 'Rolling',
    applyLink: 'https://aws.amazon.com/activate/',
    stages: ['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'],
    countries: ['Any'],
    industries: ['Any'],
    lastVerified: '2026-05-01',
    criteria: {
      minStage: 'Idea',
      maxStage: 'Fundraising',
      mustBeIncorporated: false,
      dpiitRecognized: false,
    }
  }
];

let applications = [
  { id: 'app-1', schemeId: 'f-1', status: 'Under Review', appliedDate: '2026-06-10', notes: 'DPIIT certificate uploaded. Waiting for pitch call.' },
  { id: 'app-2', schemeId: 'f-4', status: 'Accepted', appliedDate: '2026-06-12', notes: 'Credits credited to AWS account.' }
];

let investors = [
  {
    id: 'inv-1',
    name: 'Peak XV Partners',
    type: 'Venture Capital',
    ticketSize: '$1M - $10M',
    stages: ['MVP', 'Revenue', 'Fundraising'],
    sectors: ['SaaS', 'AI', 'Fintech', 'Consumer'],
    geography: 'India & SEA',
    readinessScore: 85,
    matchReason: 'Active investor in Indian AI & SaaS space. Fits MVP/Revenue stages.',
    contactEmail: 'contact@peakxv.com'
  },
  {
    id: 'inv-2',
    name: 'Blume Ventures',
    type: 'Venture Capital',
    ticketSize: '$500K - $2M',
    stages: ['Validation', 'MVP', 'Revenue'],
    sectors: ['SaaS', 'DeepTech', 'EdTech'],
    geography: 'India',
    readinessScore: 78,
    matchReason: 'Pre-seed/Seed specialist focused on technical founders and software.',
    contactEmail: 'pitch@blume.vc'
  },
  {
    id: 'inv-3',
    name: 'Kunal Bahl',
    type: 'Angel Investor',
    ticketSize: '$25K - $100K',
    stages: ['Idea', 'Validation', 'MVP'],
    sectors: ['Any', 'Consumer', 'E-commerce', 'AI'],
    geography: 'India',
    readinessScore: 92,
    matchReason: 'Highly active angel support for early stage startups. Fast decisions.',
    contactEmail: 'kunal@angel.in'
  },
  {
    id: 'inv-4',
    name: 'Soma Capital',
    type: 'Venture Capital (Global)',
    ticketSize: '$100K - $500K',
    stages: ['Idea', 'Validation', 'MVP'],
    sectors: ['AI', 'SaaS', 'Web3', 'B2B'],
    geography: 'Global',
    readinessScore: 70,
    matchReason: 'US-based VC investing in outstanding software projects globally.',
    contactEmail: 'pitch@somacap.com'
  }
];

let mentors = [
  {
    id: 'm-1',
    name: 'Amit Verma',
    role: 'Ex-VP Product at Gojek',
    expertise: ['Product Management', 'Growth', 'Scaling'],
    availability: '1 hour/week',
    experience: 'Scaled Gojek product teams from 20 to 300. Mentored 15+ startups.',
    geography: 'India / Remote',
    stages: ['MVP', 'Revenue'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'm-2',
    name: 'Priyanka Sen',
    role: 'SaaS GTM Consultant',
    expertise: ['Sales', 'GTM Strategy', 'US Expansion'],
    availability: '2 hours/month',
    experience: 'First sales hire at BrowserStack. Built $10M ARR outbound pipeline.',
    geography: 'US / India',
    stages: ['Validation', 'MVP', 'Revenue'],
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'm-3',
    name: 'Dr. Srinivas Iyer',
    role: 'Chief AI Scientist, DeepTech Labs',
    expertise: ['Artificial Intelligence', 'LLMs', 'IP Strategy'],
    availability: '30 mins/week',
    experience: 'Published 40+ papers. Ex-Google Research Scientist. Mentoring deeptech teams.',
    geography: 'India',
    stages: ['Idea', 'Validation'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  }
];

let resources = [
  { id: 'r-1', title: 'Shareholders Agreement (SHA) Template', category: 'Legal', desc: 'Standard SHA template for seed-stage startups, covering founder vesting, board seat representation, and drag-along rights.', fileType: 'DOCX', size: '42 KB', downloads: 215 },
  { id: 'r-2', title: 'Pitch Deck Template (12-Slide Outline)', category: 'Pitch Deck', desc: 'Premium Figma & PPT outline for pitching early stage VCs, structured according to Sequoia guidelines.', fileType: 'PDF/PPTX', size: '12 MB', downloads: 540 },
  { id: 'r-3', title: 'Financial Projection Model (3-Year Projection)', category: 'Financial Models', desc: 'Pre-built Excel model with forecasting sheets for SaaS, hiring pipelines, and server costing variables.', fileType: 'XLSX', size: '1.2 MB', downloads: 382 },
  { id: 'r-4', title: 'DPIIT Recognition Guide Checklist', category: 'Guides', desc: 'Detailed, step-by-step handbook on documents needed and errors to avoid to ensure fast DPIIT approval.', fileType: 'PDF', size: '820 KB', downloads: 189 }
];

let opportunityRadar = [
  { id: 'rad-1', title: 'Deep Tech & AI Sector Trending Upwards', type: 'Sector Trend', desc: 'Indian government announces a ₹10,000 Crore AI Mission. Startups working on localized models see funding interest climb 40% QoQ.', date: '2026-06-18', tag: 'AI & ML' },
  { id: 'rad-2', title: 'SISFS Applications Close in 9 Weeks', type: 'Grant Deadline', desc: 'Ensure your DPIIT registration is active. The upcoming batch review starts September 30.', date: '2026-06-20', tag: 'SISFS' },
  { id: 'rad-3', title: 'SaaS Startups Valuation Multiple Stablizing', type: 'Market Report', desc: 'Private market multiples for seed/Series A software companies steadying at 8-12x ARR, signaling a healthy environment for fundraising.', date: '2026-06-15', tag: 'SaaS' }
];

let validationReports = [
  {
    id: 'rep-1',
    startupIdea: 'Automated legal contract analyzer using fine-tuned Llama models',
    problemStatement: 'SMEs spend thousands on legal review of simple service agreements',
    customerSegment: 'SMEs and solo freelancers',
    geography: 'India and US',
    date: '2026-06-19',
    scores: {
      overall: 78,
      demand: 85,
      competition: 65,
      scalability: 82,
      revenuePotential: 80
    },
    marketResearch: {
      marketSize: 'TAM: $5.2B globally. SAM (SME legal tech): $1.4B.',
      growthTrends: 'Legal tech space growing at 14.2% CAGR. Llama models reduce computational cost by 60%, making SME pricing viable.',
      industryOverview: 'Transitioning from legacy legal databases (LexisNexis) to active AI draft analysis.'
    },
    competitors: [
      { name: 'Robin AI', funding: '$26M', pricing: '$150/mo starter', type: 'Direct' },
      { name: 'Spellbook', funding: '$20M', pricing: '$120/mo user', type: 'Direct' },
      { name: 'Fiverr / Local lawyers', funding: 'N/A', pricing: '$50-$200/contract', type: 'Indirect' }
    ],
    customerPersona: {
      name: 'Sarah, Founder of a 15-person Agency',
      painPoints: 'Spends 4 hours per week checking NDAs. Feels anxious signing vendor contracts. Cannot afford a lawyer on retainer.',
      behavior: 'Tech-savvy, uses ChatGPT for draft emails. Prefers self-serve SaaS.'
    }
  }
];

let roadmapTasks = {
  'Idea': [
    { id: 't-1', text: 'Document 3 critical customer pain points', completed: true, category: 'Validation', guideId: 'r-4' },
    { id: 't-2', text: 'Perform 10 user discovery interviews', completed: true, category: 'Validation', guideId: 'r-4' },
    { id: 't-3', text: 'Define startup one-liner and core value proposition', completed: false, category: 'Pitching', guideId: 'r-2' },
    { id: 't-4', text: 'Perform AI validation scan', completed: false, category: 'Validation', guideId: 'r-4' }
  ],
  'Validation': [
    { id: 't-5', text: 'Design landing page mockup', completed: false, category: 'MVP', guideId: 'r-2' },
    { id: 't-6', text: 'Collect 100 email signups on waitlist', completed: false, category: 'Growth', guideId: 'r-4' },
    { id: 't-7', text: 'Conduct competitive pricing analysis', completed: false, category: 'Finance', guideId: 'r-3' },
    { id: 't-8', text: 'Create draft pitch outline', completed: false, category: 'Pitching', guideId: 'r-2' }
  ],
  'MVP': [
    { id: 't-9', text: 'Build functional core features (MVP)', completed: false, category: 'MVP', guideId: 'r-1' },
    { id: 't-10', text: 'Deploy to cloud hosting (AWS / Vercel)', completed: false, category: 'Infrastructure', guideId: 'r-4' },
    { id: 't-11', text: 'Obtain feedback from 5 active beta testers', completed: false, category: 'Validation', guideId: 'r-4' }
  ],
  'Revenue': [
    { id: 't-12', text: 'Set up Stripe payment flows', completed: false, category: 'Finance', guideId: 'r-3' },
    { id: 't-13', text: 'Close first 5 paid customers', completed: false, category: 'Growth', guideId: 'r-4' },
    { id: 't-14', text: 'Launch on Product Hunt', completed: false, category: 'Growth', guideId: 'r-2' }
  ],
  'Fundraising': [
    { id: 't-15', text: 'Incorporate company and sign SHA', completed: false, category: 'Legal', guideId: 'r-1' },
    { id: 't-16', text: 'Construct complete pitch room and financial model', completed: false, category: 'Pitching', guideId: 'r-3' },
    { id: 't-17', text: 'Begin cold reachout to matching VCs', completed: false, category: 'Funding', guideId: 'r-2' }
  ]
};

// API Endpoints

// 1. Auth & Profile
app.get('/api/profile', (req, res) => {
  res.json(userProfile);
});

app.post('/api/profile', (req, res) => {
  userProfile = { ...userProfile, ...req.body };
  res.json({ success: true, profile: userProfile });
});

app.post('/api/onboarding', (req, res) => {
  const { email, name, startupName, description, industry, country, stage } = req.body;
  userProfile = {
    registered: true,
    email: email || 'founder@startup.io',
    name: name || 'Founder',
    startupName: startupName || 'My Startup',
    description: description || '',
    industry: industry || 'AI & SaaS',
    country: country || 'India',
    stage: stage || 'Idea',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };
  res.json({ success: true, profile: userProfile });
});

// Mock LinkedIn/Resume Parser
app.post('/api/auth/parse-resume', (req, res) => {
  // Simulate quick analysis
  setTimeout(() => {
    res.json({
      success: true,
      data: {
        name: 'Sarah Connor',
        email: 'sarah@t800.io',
        startupName: 'Skynet Defender',
        description: 'Predictive security and AI agent monitoring software for modern enterprise infrastructure.',
        industry: 'AI & Security',
        country: 'India',
        stage: 'Validation'
      }
    });
  }, 1000);
});

// 2. AI Startup Validation (Feature 1)
app.get('/api/validation/reports', (req, res) => {
  res.json(validationReports);
});

app.post('/api/validate', (req, res) => {
  const { startupIdea, problemStatement, customerSegment, geography } = req.body;

  // Smart validation scores based on input content length/quality
  const scoreBase = startupIdea ? Math.min(95, 60 + (startupIdea.length % 25)) : 50;
  
  // Calculate dynamic sub-scores
  const demand = Math.min(100, scoreBase + 8);
  const competition = Math.max(20, Math.min(95, scoreBase - 12 + (problemStatement ? problemStatement.length % 15 : 0)));
  const scalability = Math.min(100, scoreBase + 5);
  const revenuePotential = Math.min(100, scoreBase + 2);
  const overall = Math.round((demand + competition + scalability + revenuePotential) / 4);

  // Generate realistic-looking report data
  const keyword = (startupIdea || 'AI').toLowerCase();
  
  let matchCompetitors = [];
  if (keyword.includes('legal') || keyword.includes('law')) {
    matchCompetitors = [
      { name: 'Robin AI', funding: '$26M', pricing: '$150/mo', type: 'Direct' },
      { name: 'Spellbook', funding: '$20M', pricing: '$120/mo', type: 'Direct' }
    ];
  } else if (keyword.includes('health') || keyword.includes('medical') || keyword.includes('doc')) {
    matchCompetitors = [
      { name: 'Forward Health', funding: '$225M', pricing: '$99/mo', type: 'Direct' },
      { name: 'Ada Health', funding: '$90M', pricing: 'Enterprise B2B', type: 'Indirect' }
    ];
  } else {
    matchCompetitors = [
      { name: 'ChatGPT Enterprise', funding: 'Multi-Billion', pricing: '$30/user', type: 'Indirect' },
      { name: 'Retool AI', funding: '$135M', pricing: 'Usage-based', type: 'Indirect' }
    ];
  }

  const newReport = {
    id: `rep-${Date.now()}`,
    startupIdea: startupIdea || 'General AI SaaS Idea',
    problemStatement: problemStatement || 'No clear problem stated',
    customerSegment: customerSegment || 'General Public',
    geography: geography || 'Global',
    date: new Date().toISOString().split('T')[0],
    scores: {
      overall,
      demand,
      competition,
      scalability,
      revenuePotential
    },
    marketResearch: {
      marketSize: `TAM: $8.4B globally. SAM (Focused Segment): $850M. Growth trend is highly positive.`,
      growthTrends: `The sector is expanding at a ${overall > 75 ? '16.5%' : '8.9%'} CAGR, driven by modern technological adaptations.`,
      industryOverview: `Customers in ${geography} are rapidly moving away from legacy systems to flexible self-service SaaS models.`
    },
    competitors: [
      ...matchCompetitors,
      { name: 'Manual Workarounds', funding: 'N/A', pricing: 'Staff overhead cost', type: 'Indirect' }
    ],
    customerPersona: {
      name: `Ideal Client Profile in ${geography}`,
      painPoints: `Lacks automation, experiences high cost overheads, and needs faster processing.`,
      behavior: `Prefers transparent pricing, cloud dashboards, and integrations with their current tech stack.`
    }
  };

  validationReports.unshift(newReport);
  res.json({ success: true, report: newReport });
});

// 3. Founder Roadmap (Feature 2)
app.get('/api/roadmap', (req, res) => {
  const stage = userProfile.stage;
  const tasks = roadmapTasks[stage] || roadmapTasks['Idea'];
  res.json({ stage, tasks });
});

app.post('/api/roadmap/toggle', (req, res) => {
  const { id } = req.body;
  let updated = false;

  Object.keys(roadmapTasks).forEach(stage => {
    roadmapTasks[stage] = roadmapTasks[stage].map(task => {
      if (task.id === id) {
        task.completed = !task.completed;
        updated = true;
      }
      return task;
    });
  });

  res.json({ success: updated });
});

// 4. AI Build Advisor (Feature 3)
app.post('/api/build-advisor', (req, res) => {
  const { startupType } = req.body;

  let stack = {
    frontend: 'React.js (Vite) + CSS Variables',
    backend: 'Node.js Express API',
    database: 'PostgreSQL or Supabase',
    hosting: 'Vercel (Frontend) + Render (Backend)',
    ai: 'Gemini API (3.5 Flash) via Vercel AI SDK'
  };

  let phases = [
    { phase: 'MVP Phase', duration: '4-6 weeks', objectives: 'Core functional flow, authentication, user data forms.' },
    { phase: 'Growth Phase', duration: '4 weeks', objectives: 'Email triggers, stripe subscriptions, custom dashboards.' },
    { phase: 'Scale Phase', duration: 'Ongoing', objectives: 'Multi-region db cluster, query caching, analytics hooks.' }
  ];

  let costEstimates = [
    { item: 'Hosting (Vercel + Supabase)', mvp: '$0 / mo', growth: '$35 / mo', scale: '$120 / mo' },
    { item: 'AI Token usage (Gemini)', mvp: '$0 (Free tier)', growth: '$40 / mo', scale: '$300 / mo' },
    { item: 'Stripe, Email (Resend) & Logs', mvp: '$0 / mo', growth: '$19 / mo', scale: '$80 / mo' },
    { item: 'Domain & SSL', mvp: '$12 / yr', growth: '$12 / yr', scale: '$100 / yr' }
  ];

  if (startupType === 'Mobile App') {
    stack = {
      frontend: 'React Native / Expo',
      backend: 'Node.js / Firebase Auth & Functions',
      database: 'Firestore / MongoDB',
      hosting: 'Apple App Store / Google Play Store',
      ai: 'Local Device ML + Gemini API proxy'
    };
    costEstimates = [
      { item: 'App Store Fees (Apple & Google)', mvp: '$125 (One-time/Year)', growth: '$125 / yr', scale: '$125 / yr' },
      { item: 'Backend Hosting (Firebase)', mvp: '$0 / mo', growth: '$25 / mo', scale: '$150 / mo' },
      { item: 'AI Tokens & Services', mvp: '$0 / mo', growth: '$30 / mo', scale: '$250 / mo' },
      { item: 'Crashlytics / Push (OneSignal)', mvp: '$0 / mo', growth: '$9 / mo', scale: '$49 / mo' }
    ];
  } else if (startupType === 'Marketplace') {
    stack = {
      frontend: 'Next.js for Server-side Rendering (SEO)',
      backend: 'NestJS / Stripe API Connect',
      database: 'PostgreSQL (Prisma)',
      hosting: 'AWS Amplify / ECS Fargate',
      ai: 'Semantic Search Embeddings via pgvector'
    };
    costEstimates = [
      { item: 'Infrastructure (AWS Fargate + RDS)', mvp: '$15 / mo', growth: '$80 / mo', scale: '$450 / mo' },
      { item: 'Payment Gateways (Stripe Connect)', mvp: 'Pay-as-you-go', growth: '2.9% + $0.30 per tx', scale: 'Negotiated volume rate' },
      { item: 'Search engine (Algolia / pgvector)', mvp: '$0 / mo', growth: '$29 / mo', scale: '$150 / mo' }
    ];
  }

  res.json({ success: true, stack, phases, costEstimates });
});

// 5. Funding Navigator (Feature 4) & Opportunity Radar (Feature 8)
app.get('/api/funding/schemes', (req, res) => {
  res.json(fundingSchemes);
});

app.get('/api/funding/applications', (req, res) => {
  const result = applications.map(app => {
    const scheme = fundingSchemes.find(s => s.id === app.schemeId);
    return { ...app, scheme };
  });
  res.json(result);
});

app.post('/api/funding/apply', (req, res) => {
  const { schemeId, notes } = req.body;
  const newApp = {
    id: `app-${Date.now()}`,
    schemeId,
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: notes || 'Submitted profile via STUDLYF auto-fill.'
  };
  applications.push(newApp);
  res.json({ success: true, application: newApp });
});

app.post('/api/funding/update-status', (req, res) => {
  const { id, status, notes } = req.body;
  let updated = false;
  applications = applications.map(app => {
    if (app.id === id) {
      app.status = status;
      if (notes) app.notes = notes;
      updated = true;
    }
    return app;
  });
  res.json({ success: updated });
});

app.get('/api/radar', (req, res) => {
  res.json(opportunityRadar);
});

// 6. Network (Investors & Mentors & Relationship Graph)
app.get('/api/network/investors', (req, res) => {
  res.json(investors);
});

app.get('/api/network/mentors', (req, res) => {
  res.json(mentors);
});

app.post('/api/network/relationship-path', (req, res) => {
  const { contactName, targetEntity } = req.body;
  
  // Create a visualized introduction path: Founder -> Mutual Contact -> Target
  const path = [
    { name: userProfile.name || 'You (Founder)', type: 'founder' },
    { name: contactName || 'Vikram Malhotra (Partner, Dev Advisory)', type: 'contact' },
    { name: targetEntity || 'Peak XV Partners (Karan Mohla)', type: 'target' }
  ];

  res.json({
    success: true,
    path,
    strength: 'Strong (Frequent emails detected in metadata upload)',
    advice: `Vikram has co-invested with ${targetEntity} twice in the last 12 months. Request a 15-minute sync with Vikram first to ask for a warm double-opt-in intro.`
  });
});

// 7. AI Founder Copilot (Feature 9)
app.post('/api/copilot/chat', (req, res) => {
  const { message, chatHistory } = req.body;
  const lowerMessage = message.toLowerCase();

  let answer = '';
  let sources = [];

  // Grounded search logic
  if (lowerMessage.includes('grant') || lowerMessage.includes('sisfs') || lowerMessage.includes('startup india')) {
    const sisfs = fundingSchemes[0];
    answer = `Based on your query, the most relevant program in our database is the ${sisfs.name}. It is a non-dilutive grant of up to ${sisfs.amount} provided by ${sisfs.provider}. The current deadline is ${sisfs.deadline}. Under SISFS, eligibility requires DPIIT recognition, incorporation, and stage between Idea and MVP.`;
    sources.push({ title: sisfs.name, type: 'Grant', link: sisfs.applyLink });
  } else if (lowerMessage.includes('accelerator') || lowerMessage.includes('yc') || lowerMessage.includes('y combinator')) {
    const yc = fundingSchemes[1];
    answer = `You can apply for ${yc.name}. They invest $500,000 for 7% equity. The application deadline for the upcoming batch is ${yc.deadline}. It fits startups in stages from Idea up to Revenue.`;
    sources.push({ title: yc.name, type: 'Accelerator', link: yc.applyLink });
  } else if (lowerMessage.includes('pitch') || lowerMessage.includes('deck') || lowerMessage.includes('template')) {
    const pitch = resources[1];
    answer = `I found a useful resource: "${pitch.title}" (${pitch.desc}). This is a 12-slide layout mapped to Sequoia standards and is available in the Resources Library.`;
    sources.push({ title: pitch.title, type: 'Resource Template', id: pitch.id });
  } else if (lowerMessage.includes('investor') || lowerMessage.includes('funding') || lowerMessage.includes('raise')) {
    answer = `To raise capital, you have matching investors in your network: Kunal Bahl (Angel, ticket size $25K-$100K) and Peak XV Partners ($1M-$10M). Ensure your startup stage matches their profile (Kunal fits Idea/Validation, Peak XV fits MVP/Revenue).`;
    sources.push({ title: 'Investor Directory database', type: 'Directory' });
  } else {
    // Generative fallback
    answer = `Starting a startup in the ${userProfile.industry} space in ${userProfile.country} requires a structured GTM. Since you are in the ${userProfile.stage} stage, your immediate priorities should be validation interviews, defining your core value proposition, and building a lightweight landing page before investing heavily in software development. Let me know if you would like me to pull resources on GTM strategy or recommend a tech stack.`;
  }

  res.json({
    success: true,
    message: {
      role: 'assistant',
      content: answer,
      sources: sources
    }
  });
});

// 8. Resources Library
app.get('/api/resources', (req, res) => {
  res.json(resources);
});

// 9. Admin APIs (Manage Listings)
app.post('/api/admin/grants', (req, res) => {
  const newGrant = {
    id: `f-${Date.now()}`,
    ...req.body,
    lastVerified: new Date().toISOString().split('T')[0]
  };
  fundingSchemes.push(newGrant);
  res.json({ success: true, scheme: newGrant });
});

app.delete('/api/admin/grants/:id', (req, res) => {
  const { id } = req.params;
  fundingSchemes = fundingSchemes.filter(s => s.id !== id);
  res.json({ success: true });
});

app.post('/api/admin/investors', (req, res) => {
  const newInv = {
    id: `inv-${Date.now()}`,
    ...req.body
  };
  investors.push(newInv);
  res.json({ success: true, investor: newInv });
});

app.delete('/api/admin/investors/:id', (req, res) => {
  const { id } = req.params;
  investors = investors.filter(i => i.id !== id);
  res.json({ success: true });
});

app.post('/api/admin/mentors', (req, res) => {
  const newMen = {
    id: `m-${Date.now()}`,
    ...req.body
  };
  mentors.push(newMen);
  res.json({ success: true, mentor: newMen });
});

app.delete('/api/admin/mentors/:id', (req, res) => {
  const { id } = req.params;
  mentors = mentors.filter(m => m.id !== id);
  res.json({ success: true });
});

// 10. Logout & Session Reset
app.post('/api/logout', (req, res) => {
  userProfile = {
    registered: false,
    email: '',
    name: '',
    startupName: '',
    description: '',
    industry: 'AI & SaaS',
    country: 'India',
    stage: 'Idea',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  };
  // Reset roadmap task completion states
  Object.keys(roadmapTasks).forEach(stage => {
    roadmapTasks[stage] = roadmapTasks[stage].map(t => ({ ...t, completed: false }));
  });
  // Clear user applications
  applications = [];
  res.json({ success: true });
});

// 11. Dashboard Analytics / Stats Summary
app.get('/api/stats', (req, res) => {
  const totalTasks = Object.values(roadmapTasks).flat();
  const completedTasks = totalTasks.filter(t => t.completed).length;
  const currentStageTasks = roadmapTasks[userProfile.stage] || [];
  const currentCompleted = currentStageTasks.filter(t => t.completed).length;
  
  // Calculate a comprehensive health score
  const validationScore = validationReports.length > 0 ? validationReports[0].scores.overall : 0;
  const roadmapScore = currentStageTasks.length > 0 
    ? Math.round((currentCompleted / currentStageTasks.length) * 100) 
    : 0;
  const networkScore = Math.min(100, investors.length * 10 + mentors.length * 15);
  const fundingScore = Math.min(100, applications.filter(a => a.status === 'Accepted').length * 30 + applications.length * 10);
  
  const overallHealth = Math.round(
    (validationScore * 0.3) + (roadmapScore * 0.3) + (networkScore * 0.2) + (fundingScore * 0.2)
  );

  res.json({
    overallHealth,
    validationScore,
    roadmapScore,
    networkScore,
    fundingScore,
    totalReports: validationReports.length,
    totalApplications: applications.length,
    acceptedApplications: applications.filter(a => a.status === 'Accepted').length,
    totalTasksCompleted: completedTasks,
    totalTasksCount: totalTasks.length,
    investorsMatched: investors.length,
    mentorsAvailable: mentors.length,
    resourcesCount: resources.length,
    currentStage: userProfile.stage,
    startupName: userProfile.startupName
  });
});

// 12. Export Validation Report as structured JSON (downloadable)
app.get('/api/validation/export/:id', (req, res) => {
  const { id } = req.params;
  const report = validationReports.find(r => r.id === id);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }

  // Build a structured export document
  const exportDoc = {
    title: `STUDLYF Validation Report — ${report.startupIdea}`,
    generatedAt: new Date().toISOString(),
    founderProfile: {
      name: userProfile.name,
      startup: userProfile.startupName,
      stage: userProfile.stage
    },
    concept: {
      idea: report.startupIdea,
      problem: report.problemStatement,
      segment: report.customerSegment,
      geography: report.geography
    },
    scores: report.scores,
    marketResearch: report.marketResearch,
    competitorAnalysis: report.competitors,
    customerPersona: report.customerPersona,
    recommendation: report.scores.overall >= 75 
      ? 'Strong signal. Proceed with MVP development and begin pre-seed outreach.'
      : report.scores.overall >= 55
      ? 'Moderate signal. Refine value proposition and gather more user discovery data before building.'
      : 'Weak signal. Pivot or significantly narrow the target segment before investing resources.'
  };

  res.json({ success: true, export: exportDoc });
});

// 13. Activity Log
let activityLog = [];

app.get('/api/activity', (req, res) => {
  res.json(activityLog.slice(-20)); // Return last 20 activities
});

app.post('/api/activity', (req, res) => {
  const { action, detail } = req.body;
  activityLog.push({
    id: `act-${Date.now()}`,
    action,
    detail,
    timestamp: new Date().toISOString()
  });
  res.json({ success: true });
});


// 14. Unique Feature: AI Pitch Practice Room Questions
const stageQuestions = {
  'Idea': [
    { id: 'q-1', text: "What is the specific pain point that you have personally witnessed?", tips: "Discuss a concrete scenario or a friction point you have experienced or watched other people struggle with." },
    { id: 'q-2', text: "Who is the customer that needs this product the most, and how do you know?", tips: "Narrow your persona. Don't say 'everyone'. Identify the precise title, role, or user type who is actively seeking a solution." },
    { id: 'q-3', text: "What are the manual alternatives or workarounds customers use today?", tips: "Acknowledge Excel sheets, emails, or slow manual tasks. Explain why these workarounds are failing or are too expensive." },
    { id: 'q-4', text: "Why will this customer pay for your solution rather than standard tools?", tips: "Focus on workflow integration, speed, or specialized accuracy. Be direct about the return on investment (ROI) for them." },
    { id: 'q-5', text: "How do you plan to acquire your first 5 customers without spending money?", tips: "Suggest cold emails, direct networking, or community postings. VCs love to see scrappy founders who can hustle." }
  ],
  'Validation': [
    { id: 'q-1', text: "What is your landing page or waitlist conversion rate so far?", tips: "Share specific conversion rates (e.g., 15% click-to-signup). Explain what channels drove this traffic." },
    { id: 'q-2', text: "What feedback from your customer discovery interviews surprised you the most?", tips: "Shows that you are listening. Discuss how a user pivot or a feature request changed your original assumptions." },
    { id: 'q-3', text: "What is the biggest risk that could kill this startup in the next 3 months?", tips: "Acknowledge developer issues, regulatory hurdles, or customer resistance honestly, and show how you plan to mitigate it." },
    { id: 'q-4', text: "How will you build a lean prototype (MVP) within 4 weeks?", tips: "Discuss your plan to use Bubble, Webflow, or a simplified React code framework. Keep the scope strictly focused." },
    { id: 'q-5', text: "What trigger event will make a customer start looking for your solution?", tips: "Explain the moment of friction that forces them to act (e.g., 'when their server crashes' or 'when their tax deadline is 3 days away')." }
  ],
  'MVP': [
    { id: 'q-1', text: "Why are your early users using your product, and what are they complaining about?", tips: "Honest customer feedback is gold. Focus on the core value they like and the UI complaints they have." },
    { id: 'q-2', text: "What feature in your MVP is the most used, and why?", tips: "Focus on the data. Mention user logs or clicks that verify which module solved the pain best." },
    { id: 'q-3', text: "How did you find your active beta testers?", tips: "Share your distribution channels (Slack groups, Reddit, LinkedIn DMs, or warm founder intros)." },
    { id: 'q-4', text: "What is your main metric of user engagement (daily active users, weekly sessions, etc.)?", tips: "Explain what metric proves your product is sticky. Highlight how often a user returns to solve their problem." },
    { id: 'q-5', text: "What are you doing manually behind the scenes that looks like AI or automation?", tips: "Wizard-of-Oz setups are normal. Explain how you manually check outputs to assure quality before writing code." }
  ],
  'Revenue': [
    { id: 'q-1', text: "What is your current monthly recurring revenue (MRR) or user growth rate?", tips: "State your metrics clearly. Show month-over-month growth trends, even if early (e.g., '$1k MRR growing 20% MoM')." },
    { id: 'q-2', text: "What is your customer acquisition cost (CAC) and how do you intend to lower it?", tips: "Outline paid ads, organic content, or referral loops. Show that you understand the unit economics." },
    { id: 'q-3', text: "What is your monthly churn rate and what are the main reasons users leave?", tips: "Define your retention. If churn is high, identify the feature gap or onboarding friction causing it." },
    { id: 'q-4', text: "How do you price your product, and how did you test pricing tiers?", tips: "Explain your value metric (per seat, per run, or package tiers). Discuss if users complained about price or paid instantly." },
    { id: 'q-5', text: "What is your repeatable marketing or sales loop?", tips: "Focus on a growth engine. Is it SEO, cold outbound email, programmatic integrations, or partnership channels?" }
  ],
  'Fundraising': [
    { id: 'q-1', text: "How much are you raising and what is the exact runway it provides?", tips: "Be precise (e.g., 'Raising $500k for 18 months of runway'). Outline hiring, product, and marketing spend allocations." },
    { id: 'q-2', text: "What is your valuation justification based on market metrics?", tips: "Reference comparable early stage deals or multiple metrics. Keep it grounded in market averages for your sector." },
    { id: 'q-3', text: "What is your unfair advantage that prevents a competitor with more funding from copying you?", tips: "Focus on proprietary integrations, data loops, network effects, or your speed of execution." },
    { id: 'q-4', text: "What is the long term vision for this company in 5 years (market size, ARR)?", tips: "Show massive ambition. Explain how you expand from a single product to a platform dominating the industry." },
    { id: 'q-5', text: "Who is the key hire you will make with this new funding round?", tips: "Identify your team gaps (e.g., Head of Engineering, GTM Growth Lead) and why this hire accelerates your milestones." }
  ]
};

app.post('/api/copilot/pitch-simulator/questions', (req, res) => {
  const stage = userProfile.stage || 'Idea';
  const questions = stageQuestions[stage] || stageQuestions['Idea'];
  res.json({ success: true, stage, questions });
});

app.post('/api/copilot/pitch-simulator/evaluate', (req, res) => {
  const { question, answer } = req.body;
  if (!answer || answer.trim().length < 15) {
    return res.json({
      success: true,
      score: 2,
      critique: "Your response is too brief. Venture Capitalists (VCs) expect structured, detailed explanations that show deep domain understanding, customer insights, and metrics. Avoid one-sentence answers.",
      tips: "Use the STAR method: explain the Situation, Task, Action, and the measurable Result. Aim for at least 3-4 descriptive sentences."
    });
  }

  const lowerAns = answer.toLowerCase();
  let score = 5;
  let critiqueParts = [];
  
  // Keyword scoring checks
  const keywords = [
    { word: 'customer', pts: 1, comment: "Good focus on customer-centricity." },
    { word: 'data', pts: 1, comment: "Excellent use of quantitative tracking." },
    { word: 'metrics', pts: 1, comment: "Mentions business tracking metrics." },
    { word: 'validate', pts: 1, comment: "Mentions concept validation loops." },
    { word: 'pain', pts: 1, comment: "Addresses the core user friction point." },
    { word: 'growth', pts: 1, comment: "Reflects growth-oriented thinking." },
    { word: 'scale', pts: 1, comment: "Mentions scalability goals." },
    { word: 'competitor', pts: 1, comment: "Acknowledges market alternatives." },
    { word: 'roi', pts: 1, comment: "Addresses commercial return value." },
    { word: 'conversion', pts: 1, comment: "Reflects conversion funnel metrics." }
  ];

  keywords.forEach(kw => {
    if (lowerAns.includes(kw.word)) {
      score += kw.pts;
      critiqueParts.push(kw.comment);
    }
  });

  // Cap score at 10
  score = Math.min(10, score);
  if (answer.length > 250) score = Math.min(10, score + 1);

  let critiqueText = "";
  if (score >= 8) {
    critiqueText = "Excellent pitch response! " + critiqueParts.join(" ") + " You demonstrate a strong grasp of startup economics, specific metrics, and tactical strategy. A VC would find this answer credible.";
  } else if (score >= 6) {
    critiqueText = "Solid answer. " + critiqueParts.join(" ") + " However, you could make it stronger by adding more specific metrics (conversion rates, CAC, exact numbers) and a clear, repeatable distribution loop. Make sure your unique differentiator stands out.";
  } else {
    critiqueText = "This response is a bit generic. You need to focus more on unique customer insights, raw data, or direct validation metrics. Avoid empty buzzwords like 'synergy' or 'disruption' and focus on how you solve the pain point.";
  }

  res.json({
    success: true,
    score,
    critique: critiqueText,
    tips: "Tip: Next time, try to insert a specific metric or number (e.g., '15% waitlist signup rate' or '₹4500 CAC') to ground your answer in absolute reality. VCs love quantitative proof."
  });
});

// 15. Unique Feature: Sequoia Pitch Storyboard Slides
let savedStoryboards = {};

app.get('/api/roadmap/storyboard', (req, res) => {
  const startupName = userProfile.startupName || "My Startup";
  const industry = userProfile.industry || "AI & SaaS";
  
  const defaultSlides = [
    { 
      id: 1, 
      title: "1. Company Purpose", 
      guidance: `Define ${startupName} in a single, clear declarative sentence. Avoid technical jargon or marketing hype (e.g., 'An AI assistant that summarizes vendor contracts for SMEs in 30 seconds').`,
      placeholder: "Draft your company one-liner purpose here..."
    },
    { 
      id: 2, 
      title: "2. Problem", 
      guidance: `Describe the specific pain point your customers face today. How are they solving it now? Why is the current workaround (like Excel or manual labor) expensive or painful?`,
      placeholder: "Describe the core customer pain point..."
    },
    { 
      id: 3, 
      title: "3. Solution", 
      guidance: `How does ${startupName} solve this? Show the 'aha!' moment. Detail how your software makes their life 10x easier, faster, or cheaper.`,
      placeholder: "Draft your unique solution value proposition..."
    },
    { 
      id: 4, 
      title: "4. Why Now?", 
      guidance: `Why hasn't this been built before? What recent technological shift (like large language models), market shift, or regulatory change makes today the perfect window?`,
      placeholder: "Explain why this is the perfect time to build..."
    },
    { 
      id: 5, 
      title: "5. Market Size", 
      guidance: `Provide realistic estimations for TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market) within the ${industry} sector.`,
      placeholder: "e.g., TAM: $5.2B. SAM: $1.2B. SOM: $40M."
    },
    { 
      id: 6, 
      title: "6. Competition", 
      guidance: "List your direct and indirect competitors. What is your unique unfair advantage? Why is your product sticky enough to prevent churn?",
      placeholder: "Detail your competitors and your competitive moat..."
    },
    { 
      id: 7, 
      title: "7. Product", 
      guidance: "Describe your MVP or core features. What is the key customer workflow? Keep it simple, visual, and focused on usability.",
      placeholder: "List your product features and user workflows..."
    },
    { 
      id: 8, 
      title: "8. Business Model", 
      guidance: `How will ${startupName} make money? Detail your pricing strategy (e.g. B2B SaaS subscription tiers, transaction fees, usage metrics).`,
      placeholder: "Draft your monetization and pricing models..."
    },
    { 
      id: 9, 
      title: "9. Team", 
      guidance: "Who is building this? Explain why your team has the technical or sector expertise to win this market.",
      placeholder: "Briefly list team members and domain credentials..."
    },
    { 
      id: 10, 
      title: "10. The Ask", 
      guidance: "How much funding are you raising? How long does it extend your runway (e.g., 18 months), and what milestones will you achieve?",
      placeholder: "State your funding ask and runway milestones..."
    }
  ];

  const storyboard = savedStoryboards[userProfile.startupName] || defaultSlides;
  res.json({ success: true, storyboard });
});

app.post('/api/roadmap/storyboard/save', (req, res) => {
  const { storyboard } = req.body;
  savedStoryboards[userProfile.startupName] = storyboard;
  res.json({ success: true, message: 'Storyboard progression saved successfully.' });
});


// Start Server locally if not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`STUDLYF backend running on http://localhost:${PORT}`);
  });
}

export default app;
