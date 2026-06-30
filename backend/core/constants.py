DEFAULT_ROADMAP_TASKS = {
    'Idea': [
        {
            'text': 'Define startup one-liner and core value proposition',
            'category': 'Pitching',
            'guide_id': 'r-2',
            'week': 1,
            'description': 'Construct a clear, concise elevator pitch that outlines exactly what you are building, who your target customer is, and your unique value proposition.'
        },
        {
            'text': 'Document 3 critical customer pain points',
            'category': 'Validation',
            'guide_id': 'r-4',
            'week': 1,
            'description': 'List the top three real-world frustrations faced by your target segment. These must represent high-frequency problems that users are eager to solve.'
        },
        {
            'text': 'Draft customer discovery interview script',
            'category': 'Validation',
            'guide_id': 'r-6',
            'week': 2,
            'description': 'Formulate open-ended questions designed to uncover user behaviors, past spending, and daily workflows, rather than asking for speculative feature validation.'
        },
        {
            'text': 'Perform 10 user discovery interviews',
            'category': 'Validation',
            'guide_id': 'r-4',
            'week': 2,
            'description': 'Schedule and conduct calls or meetings with 10 real individuals who fit your buyer persona. Take detailed notes on how they currently solve the problem.'
        },
        {
            'text': 'Conduct competitive landscape mapping',
            'category': 'Research',
            'guide_id': 'r-4',
            'week': 3,
            'description': 'Identify at least 3 direct and 3 indirect competitors. Map their core offerings, market positioning, pricing tiers, and identify where your startup has a gap opportunity.'
        },
        {
            'text': 'Calculate bottom-up TAM/SAM market size',
            'category': 'Finance',
            'guide_id': 'r-3',
            'week': 3,
            'description': 'Determine your Total Addressable Market (TAM) and Serviceable Addressable Market (SAM) based on target customer volume and estimated annual transaction value.'
        },
        {
            'text': 'Run Studlyf AI Validation Scan',
            'category': 'Validation',
            'guide_id': 'r-4',
            'week': 4,
            'description': 'Submit your startup concept, customer segment, and industry parameters to the AI Validation tool. Analyze the generated report for demand feasibility.'
        },
        {
            'text': 'Compile final validation scorecard',
            'category': 'Validation',
            'guide_id': 'r-4',
            'week': 4,
            'description': 'Synthesize validation ratings across demand, scalability, and revenue potential. Determine if you should pivot details or proceed to the Validation Stage.'
        }
    ],
    'Validation': [
        {
            'text': 'Draft website landing page structure and copy',
            'category': 'MVP',
            'guide_id': 'r-2',
            'week': 1,
            'description': 'Write engaging website headers, copy, and Call-to-Actions (CTAs) that clearly communicate the value of your startup and prompt visitors to sign up.'
        },
        {
            'text': 'Set up waitlist page on Carrd / Vercel',
            'category': 'MVP',
            'guide_id': 'r-2',
            'week': 1,
            'description': 'Launch a clean, single-page website featuring a clear email input form. Use a glassmorphism theme and embed waitlist tracking fields.'
        },
        {
            'text': 'Set up simple web analytics tracking',
            'category': 'Infrastructure',
            'guide_id': 'r-4',
            'week': 2,
            'description': 'Integrate analytics script (like Google Analytics, Plausible, or Mixpanel) on your landing page to track page views, bounce rates, and signup button conversions.'
        },
        {
            'text': 'Launch waitlist page and drive first 50 visitors',
            'category': 'Growth',
            'guide_id': 'r-4',
            'week': 2,
            'description': 'Share your waitlist link across early personal channels, relevant Slack communities, or direct messages to acquire initial landing page traffic.'
        },
        {
            'text': 'Collect 100 email signups on waitlist',
            'category': 'Growth',
            'guide_id': 'r-4',
            'week': 3,
            'description': 'Acquire 100 verified email signups on your waitlist to prove substantial demand index before investing engineering hours in the codebase.'
        },
        {
            'text': 'Publish product concept on LinkedIn or Twitter',
            'category': 'Growth',
            'guide_id': 'r-2',
            'week': 3,
            'description': 'Write a comprehensive post detailing the startup problem and your proposed waitlist solution. Tag industry voices to build public traction.'
        },
        {
            'text': 'Conduct competitive pricing analysis',
            'category': 'Finance',
            'guide_id': 'r-3',
            'week': 4,
            'description': 'Compare competitor monetization models (subscriptions, usage rates, freemium) and finalize your startup\'s initial pricing tiers and payment strategy.'
        },
        {
            'text': 'Refine core features list for MVP',
            'category': 'MVP',
            'guide_id': 'r-1',
            'week': 4,
            'description': 'Review feedback from waitlist subscribers. Narrow down the product scope to only the absolute essential features required to deliver value.'
        }
    ],
    'MVP': [
        {
            'text': 'Select development frameworks and databases',
            'category': 'Infrastructure',
            'guide_id': 'r-1',
            'week': 1,
            'description': 'Determine the ideal technology stack (e.g., React, FastAPI, Node, MongoDB) that allows your team to build and iterate quickly without lock-ins.'
        },
        {
            'text': 'Draw basic component and DB schema diagrams',
            'category': 'Infrastructure',
            'guide_id': 'r-1',
            'week': 1,
            'description': 'Map out the core page components and document database collections or schemas to avoid structural errors during the coding phase.'
        },
        {
            'text': 'Build functional core features (MVP)',
            'category': 'MVP',
            'guide_id': 'r-1',
            'week': 2,
            'description': 'Develop the core interactive workspace flow where users log in and complete the main value transaction of the product.'
        },
        {
            'text': 'Set up user authentication',
            'category': 'Infrastructure',
            'guide_id': 'r-1',
            'week': 2,
            'description': 'Integrate a secure, lightweight login flow (Firebase Auth, Supabase Auth, or JWT) to protect user accounts and custom profile data.'
        },
        {
            'text': 'Deploy application code to Vercel or Render',
            'category': 'Infrastructure',
            'guide_id': 'r-4',
            'week': 3,
            'description': 'Set up CI/CD pipeline linked to your repository and deploy the frontend/backend to live URL endpoints for user testing.'
        },
        {
            'text': 'Set up production database service',
            'category': 'Infrastructure',
            'guide_id': 'r-4',
            'week': 3,
            'description': 'Provision a cloud database instance (MongoDB Atlas or Supabase) and configure production environment variables in your hosting settings.'
        },
        {
            'text': 'Onboard 5 active beta testers',
            'category': 'Validation',
            'guide_id': 'r-4',
            'week': 4,
            'description': 'Give 5 users from your waitlist access to the MVP. Record screen sessions or observe them using the product to find usability friction.'
        },
        {
            'text': 'Document bugs and feedback in a backlog',
            'category': 'Validation',
            'guide_id': 'r-4',
            'week': 4,
            'description': 'Collect feedback, prioritize bug fixes and feature enhancements, and outline the next product iteration sprint.'
        }
    ],
    'Revenue': [
        {
            'text': 'Set up Stripe or payment gateway keys',
            'category': 'Finance',
            'guide_id': 'r-3',
            'week': 1,
            'description': 'Register on Stripe or Razorpay, pass verification audits, and connect sandbox keys to test end-to-end payment flows.'
        },
        {
            'text': 'Add pricing page to the frontend app',
            'category': 'Finance',
            'guide_id': 'r-3',
            'week': 1,
            'description': 'Build a responsive pricing grid showing monthly/annual options, and hook up checkout buttons to initiate Stripe checkout sessions.'
        },
        {
            'text': 'Schedule and launch on Product Hunt',
            'category': 'Growth',
            'guide_id': 'r-2',
            'week': 2,
            'description': 'Create product assets, write short descriptions, configure scheduler tools, and launch on Product Hunt to gain global eyeballs.'
        },
        {
            'text': 'Send launch announcement to waitlist',
            'category': 'Growth',
            'guide_id': 'r-2',
            'week': 2,
            'description': 'Blast a customized launch newsletter to your accumulated waitlist contacts, offering limited-time early adopter discount codes.'
        },
        {
            'text': 'Reach out directly to 20 warm leads',
            'category': 'Growth',
            'guide_id': 'r-4',
            'week': 3,
            'description': 'Reach out to high-priority waitlist signups or previous discovery contacts. Schedule demos to close deals individually.'
        },
        {
            'text': 'Close first 2 paid customers',
            'category': 'Growth',
            'guide_id': 'r-4',
            'week': 3,
            'description': 'Secure your first paid conversions to prove validation via real monetary value transaction.'
        },
        {
            'text': 'Establish customer success channel',
            'category': 'Growth',
            'guide_id': 'r-4',
            'week': 4,
            'description': 'Set up shared helpdesks or customer chat widgets (Intercom, Crisp) to solve user onboarding problems in real-time.'
        },
        {
            'text': 'Close 5 paid customers total',
            'category': 'Growth',
            'guide_id': 'r-4',
            'week': 4,
            'description': 'Standardize onboarding guides and convert at least 5 customers total to confirm consistent customer acquisition loops.'
        }
    ],
    'Fundraising': [
        {
            'text': 'Incorporate company as Pvt Ltd / LLP',
            'category': 'Legal',
            'guide_id': 'r-1',
            'week': 1,
            'description': 'Register your startup legally with MCA in India (or equivalent registration bodies). Keep ownership stakes and structures official.'
        },
        {
            'text': 'Draft and sign Co-founder SHA',
            'category': 'Legal',
            'guide_id': 'r-1',
            'week': 1,
            'description': 'Formulate and execute a legally-binding Shareholders Agreement (SHA) detailing equity splits, vesting periods, and IP assignment clauses.'
        },
        {
            'text': 'Draft the 10-slide pitch outline',
            'category': 'Pitching',
            'guide_id': 'r-2',
            'week': 2,
            'description': 'Outline the core slides of your pitch: Problem, Solution, Product, Market Size, Business Model, Traction, Competition, and Team.'
        },
        {
            'text': 'Fill and customize Sequoia Pitch Storyboard',
            'category': 'Pitching',
            'guide_id': 'r-2',
            'week': 2,
            'description': 'Utilize the interactive Sequoia storyboard builder in Studlyf to refine your slide narratives based on AI-guided suggestions.'
        },
        {
            'text': 'Construct 3-year financial forecast model',
            'category': 'Finance',
            'guide_id': 'r-3',
            'week': 3,
            'description': 'Map out monthly headcount, COGS, marketing, and projected revenues. Maintain a clear formula mapping variables for investor review.'
        },
        {
            'text': 'Set up clean shared investor data room',
            'category': 'Pitching',
            'guide_id': 'r-3',
            'week': 3,
            'description': 'Compile legal incorporation docs, pitch deck, cap table, and financial projections in a secure, shared drive (DocSend/Google Drive).'
        },
        {
            'text': 'List 20 target angels or micro-VCs',
            'category': 'Funding',
            'guide_id': 'r-2',
            'week': 4,
            'description': 'Filter potential investors by sector focus, average check size, and geographic criteria. Map warm introduction paths.'
        },
        {
            'text': 'Conduct cold outreach and pitch bookings',
            'category': 'Funding',
            'guide_id': 'r-2',
            'week': 4,
            'description': 'Send customized, metric-forward pitch emails to your list. Aim to book meetings and generate early momentum for the funding round.'
        }
    ]
}

DEFAULT_FUNDING_SCHEMES = [
    {
        'id': 'f-1',
        'name': 'Startup India Seed Fund Scheme (SISFS)',
        'provider': 'Department for Promotion of Industry and Internal Trade (DPIIT)',
        'type': 'Grant / Debt',
        'description': 'Financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.',
        'amount': 'Up to ₹50 Lakhs',
        'equity': '0% (Non-dilutive grant / convertible debt)',
        'deadline': '2026-09-30',
        'apply_link': 'https://www.startupindia.gov.in',
        'stages': ['Idea', 'Validation', 'MVP'],
        'countries': ['India'],
        'industries': ['Any'],
        'criteria': {
            'minStage': 'Idea',
            'maxStage': 'MVP',
            'mustBeIncorporated': True,
            'dpiitRecognized': True,
        }
    },
    {
        'id': 'f-2',
        'name': 'Y Combinator (W26 Batch)',
        'provider': 'Y Combinator',
        'type': 'Accelerator',
        'description': 'Twice a year, YC invests $500k in a large number of startups. We work intensively with the startups for three months to get them into the best shape possible.',
        'amount': '$500,000',
        'equity': '7% standard + $375k uncapped SAFE',
        'deadline': '2026-08-15',
        'apply_link': 'https://www.ycombinator.com',
        'stages': ['Idea', 'Validation', 'MVP', 'Revenue'],
        'countries': ['Any'],
        'industries': ['AI', 'SaaS', 'Fintech', 'Marketplace', 'Hardware', 'BioTech'],
        'criteria': {
            'minStage': 'Idea',
            'maxStage': 'Revenue',
            'mustBeIncorporated': False,
            'dpiitRecognized': False,
        }
    },
    {
        'id': 'f-3',
        'name': 'MeitY SAMRIDH Scheme',
        'provider': 'Ministry of Electronics and Information Technology (MeitY)',
        'type': 'Accelerator / Grant',
        'description': 'Supports software product startups with funding, mentorship, and market access to scale their businesses globally.',
        'amount': 'Up to ₹40 Lakhs matching funding',
        'equity': 'Requires matching VC investment',
        'deadline': '2026-10-15',
        'apply_link': 'https://meitystartuphub.in',
        'stages': ['MVP', 'Revenue'],
        'countries': ['India'],
        'industries': ['Software', 'SaaS', 'DeepTech'],
        'criteria': {
            'minStage': 'MVP',
            'maxStage': 'Fundraising',
            'mustBeIncorporated': True,
            'dpiitRecognized': True,
        }
    },
    {
        'id': 'f-4',
        'name': 'AWS Activate Portfolio',
        'provider': 'Amazon Web Services',
        'type': 'Credits',
        'description': 'Provides startups with free AWS cloud credits, technical support, and training resources to help scale their businesses.',
        'amount': 'Up to $100,000 in Credits',
        'equity': '0% (Non-dilutive)',
        'deadline': 'Rolling',
        'apply_link': 'https://aws.amazon.com/activate/',
        'stages': ['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'],
        'countries': ['Any'],
        'industries': ['Any'],
        'criteria': {
            'minStage': 'Idea',
            'maxStage': 'Fundraising',
            'mustBeIncorporated': False,
            'dpiitRecognized': False,
        }
    }
]

DEFAULT_INVESTORS = [
    {
        'id': 'inv-1',
        'name': 'Peak XV Partners',
        'type': 'Venture Capital',
        'ticket_size': '$1M - $10M',
        'stages': ['MVP', 'Revenue', 'Fundraising'],
        'sectors': ['SaaS', 'AI', 'Fintech', 'Consumer'],
        'geography': 'India & SEA',
        'readiness_score': 85,
        'match_reason': 'Active investor in Indian AI & SaaS space. Fits MVP/Revenue stages.',
        'contact_email': 'contact@peakxv.com'
    },
    {
        'id': 'inv-2',
        'name': 'Blume Ventures',
        'type': 'Venture Capital',
        'ticket_size': '$500K - $2M',
        'stages': ['Validation', 'MVP', 'Revenue'],
        'sectors': ['SaaS', 'DeepTech', 'EdTech'],
        'geography': 'India',
        'readiness_score': 78,
        'match_reason': 'Pre-seed/Seed specialist focused on technical founders and software.',
        'contact_email': 'pitch@blume.vc'
    },
    {
        'id': 'inv-3',
        'name': 'Kunal Bahl',
        'type': 'Angel Investor',
        'ticket_size': '$25K - $100K',
        'stages': ['Idea', 'Validation', 'MVP'],
        'sectors': ['Any', 'Consumer', 'E-commerce', 'AI'],
        'geography': 'India',
        'readiness_score': 92,
        'match_reason': 'Highly active angel support for early stage startups. Fast decisions.',
        'contact_email': 'kunal@angel.in'
    },
    {
        'id': 'inv-4',
        'name': 'Soma Capital',
        'type': 'Venture Capital (Global)',
        'ticket_size': '$100K - $500K',
        'stages': ['Idea', 'Validation', 'MVP'],
        'sectors': ['AI', 'SaaS', 'Web3', 'B2B'],
        'geography': 'Global',
        'readiness_score': 70,
        'match_reason': 'US-based VC investing in outstanding software projects globally.',
        'contact_email': 'pitch@somacap.com'
    }
]

DEFAULT_MENTORS = [
    {
        'id': 'm-1',
        'name': 'Amit Verma',
        'role': 'Ex-VP Product at Gojek',
        'expertise': ['Product Management', 'Growth', 'Scaling'],
        'availability': '1 hour/week',
        'experience': 'Scaled Gojek product teams from 20 to 300. Mentored 15+ startups.',
        'geography': 'India / Remote',
        'stages': ['MVP', 'Revenue'],
        'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    {
        'id': 'm-2',
        'name': 'Priyanka Sen',
        'role': 'SaaS GTM Consultant',
        'expertise': ['Sales', 'GTM Strategy', 'US Expansion'],
        'availability': '2 hours/month',
        'experience': 'First sales hire at BrowserStack. Built $10M ARR outbound pipeline.',
        'geography': 'US / India',
        'stages': ['Validation', 'MVP', 'Revenue'],
        'image': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
        'id': 'm-3',
        'name': 'Dr. Srinivas Iyer',
        'role': 'Chief AI Scientist, DeepTech Labs',
        'expertise': ['Artificial Intelligence', 'LLMs', 'IP Strategy'],
        'availability': '30 mins/week',
        'experience': 'Published 40+ papers. Ex-Google Research Scientist. Mentoring deeptech teams.',
        'geography': 'India',
        'stages': ['Idea', 'Validation'],
        'image': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
]

DEFAULT_RESOURCES = [
    {
        'id': 'r-1',
        'title': 'Shareholders Agreement (SHA) Template',
        'category': 'Legal',
        'desc': 'Standard SHA template for seed-stage startups, covering founder vesting, board seat representation, and drag-along rights.',
        'file_type': 'DOCX',
        'size': '42 KB',
        'downloads': 215,
        'views': 480,
        'type': 'document',
        'author': 'Studlyf Legal Team',
        'read_time': '15 min',
        'content': """# Shareholders Agreement (SHA) Guide & Draft Outline

The Shareholders Agreement (SHA) regulates the relationship between cofounders and early institutional investors. It is the primary legal mechanism governing board composition, transfer of shares, voting guidelines, and major decisions.

---

## 1. Key Clauses to Understand

### A. Founders Vesting Schedule
* Typically a **4-year vesting schedule** with a **1-year cliff**.
* If a cofounder leaves within the first year, they walk away with **0% equity**. This protects early partners from early splits.
* Vesting happens monthly after the cliff.

### B. Drag-Along Rights
* Forces minority shareholders to cooperate if a threshold majority (usually 75%+) votes to sell the startup.
* Prevents small shareholders from blocking an acquisition.

### C. Pre-Emptive Rights (Pro-Rata Rights)
* Allows current investors to participate in future rounds to prevent diluting their ownership stake.

### D. Liquidation Preference
* Guarantees that in an exit or liquidation, investors are paid back their investment (usually 1x non-participating preference) before common equity (founders) receives any proceeds.

---

## 2. Standard Drafting Outline

### Section I: Definitions & Interpretation
Defines terms like *Capital Stock*, *Liquidation Event*, *Fully Diluted Shares*, and *Qualified IPO*.

### Section II: Board of Directors & Governance
* **Board Seats**: Founders retain X seats, Seed Investors get Y seats, and Z seats are reserved for an Independent Director.
* **Consent Matters**: Major decisions (like raising debt, selling the company, changing the business line) require supermajority board consent.

### Section III: Transfer of Shares
* **Right of First Refusal (ROFR)**: If a founder wishes to sell shares, they must first offer them to the company and other shareholders.
* **Co-Sale Rights (Tag-Along)**: If a founder sells their shares, other investors can join the sale under same terms.

### Section IV: Dispute Resolution
Specifies arbitration procedures, jurisdiction, and governing law (e.g., Delhi, India or Delaware, USA)."""
    },
    {
        'id': 'r-2',
        'title': 'Pitch Deck Template (12-Slide Outline)',
        'category': 'Pitch Deck',
        'desc': 'Premium Figma & PPT outline for pitching early stage VCs, structured according to Sequoia guidelines.',
        'file_type': 'PDF/PPTX',
        'size': '12 MB',
        'downloads': 540,
        'views': 1200,
        'type': 'document',
        'author': 'Sequoia Capital & YC Partners',
        'read_time': '10 min',
        'content': """# YC & Sequoia 12-Slide Pitch Deck Framework

A premium VC-ready pitch deck is concise, clean, and numbers-focused. Early-stage venture capitalists spend an average of less than 3 minutes reviewing a seed-stage deck.

---

## 1. Standard Slide Sequence

### Slide 1: Company Purpose
* Define the company in one simple, declarative sentence.
* Avoid buzzwords (e.g., "We are the Uber of AI for pets").

### Slide 2: The Problem
* Identify a major, urgent customer pain point.
* Explain how customers solve it today (the workarounds) and why they are painful.

### Slide 3: The Solution
* Explain why your product is 10x better than existing workarounds.
* Show, don't just tell (use product screenshots or short walkthroughs).

### Slide 4: Why Now?
* Explain the market or technological shift (e.g., LLM adoption, regulatory changes) that makes this solution possible *now* when it wasn't before.

### Slide 5: Market Size (TAM, SAM, SOM)
* **TAM (Total Addressable Market)**: The total global demand if you got 100% market share.
* **SAM (Serviceable Addressable Market)**: The portion of TAM targeted by your product.
* **SOM (Serviceable Obtainable Market)**: The market you can realistically capture in 3-5 years.

### Slide 6: The Competition
* A honest matrix detailing direct and indirect competitors.
* Highlight your core unfair advantages (IP, speed, proprietary data).

### Slide 7: Product & Features
* Workflow mocks showing simplicity and user adoption.
* Focus on the 1-2 features users love most.

### Slide 8: Business Model
* Detail subscription tiers, transaction fees, or enterprise pricing models.
* Outline customer acquisition costs (CAC) and customer lifetime value (LTV) assumptions.

### Slide 9: Traction & Growth Metrics
* Show month-over-month revenue growth, active users, or pilot deployments.
* Present charts showing upward slopes.

### Slide 10: Team
* List cofounder domain credentials, previous successes, and technical roles.
* Highlight past companies worked at or universities attended.

### Slide 11: Financial Projections
* Summarize your 3-year revenue and expense forecast.
* Show key cost drivers (salaries, hosting, marketing).

### Slide 12: The Ask & Milestones
* Detail the amount you are raising and how you will spend the capital over the next 18 months.
* Specify the milestone goals you will achieve with this funding (e.g., reaching $100K MRR)."""
    },
    {
        'id': 'r-3',
        'title': 'Financial Projection Model (3-Year Projection)',
        'category': 'Financial Models',
        'desc': 'Pre-built Excel model with forecasting sheets for SaaS, hiring pipelines, and server costing variables.',
        'file_type': 'XLSX',
        'size': '1.2 MB',
        'downloads': 382,
        'views': 820,
        'type': 'document',
        'author': 'Studlyf Finance Team',
        'read_time': '12 min',
        'content': """# Startup 3-Year Financial Model Guide

A financial model simulates your startup operations, monthly burn, runway, and growth targets. For seed stage, VCs look at your modeling to understand your hiring plan and operational logic.

---

## 1. Key Modeling Sections

### A. Revenue Forecasting (SaaS/B2B Model)
* Model active accounts, conversion rates from free trials, and annual/monthly contract value (ACV/TCV).
* Calculate Annual Recurring Revenue (ARR) and Monthly Recurring Revenue (MRR).

### B. Cost of Goods Sold (COGS)
* Index hosting and API costs (AWS, GCP, OpenAI tokens).
* Include payment gateway fees (Stripe, Razorpay) and support overheads.

### C. Headcount & Hiring Plan
* Detail salary bands, bonuses, payroll taxes, and health benefits.
* Link hiring triggers to revenue milestones (e.g., hire sales reps after reaching $50K MRR).

### D. Burn Rate & Runway Indicators
* **Gross Burn**: Total monthly operating expenses.
* **Net Burn**: Operating expenses minus monthly revenues.
* **Runway**: Cash in bank divided by Net Burn. Maintain a minimum 18-month buffer.

---

## 2. Common Financial Metrics

| Metric | Formula | Target for Seed Round |
| :--- | :--- | :--- |
| **LTV:CAC Ratio** | Lifetime Value / Customer Acquisition Cost | > 3x |
| **Churn Rate** | Lost Customers / Total Customers (Monthly) | < 2% |
| **Magic Number** | (Quarterly ARR Increase) / (Previous Quarter S&M Cost) | > 0.75 |
| **Net Retention** | (Starting ARR + Expansion - Churn) / (Starting ARR) | > 110% |"""
    },
    {
        'id': 'r-4',
        'title': 'DPIIT Recognition Guide Checklist',
        'category': 'Guides',
        'desc': 'Detailed, step-by-step handbook on documents needed and errors to avoid to ensure fast DPIIT approval.',
        'file_type': 'PDF',
        'size': '820 KB',
        'downloads': 189,
        'views': 510,
        'type': 'document',
        'author': 'Startup India Portal',
        'read_time': '8 min',
        'content': """# DPIIT Recognition Handbook & Checklist

DPIIT recognition is mandatory for Indian startups to qualify for tax exemptions under Section 80-IAC, access matching schemes like the Startup India Seed Fund Scheme (SISFS), and participate in national hackathons.

---

## 1. Eligibility Criteria
* **Company Type**: Must be incorporated as a Private Limited Company, Registered Partnership, or Limited Liability Partnership (LLP). *Sole proprietorships do not qualify.*
* **Age of Entity**: Must be under 10 years from the date of incorporation.
* **Turnover**: Annual turnover must not exceed ₹100 Crores in any financial year since incorporation.
* **Innovation focus**: Must be working towards innovation, development, or improvement of products, processes, or services, or have a scalable business model with high potential of employment generation.

---

## 2. Document Checklist

1. **Certificate of Incorporation** (Pvt Ltd or LLP deed).
2. **Write-up on the Innovative Nature of the Startup**:
   * Maximum 2 pages.
   * Explain the problem statement, your solution, how it is innovative, and how it can generate jobs or wealth.
3. **Pitch Deck / Website Link**:
   * A 10-slide deck summarizing the product.
   * Product screenshots or an active workspace demo video.
4. **IPR Details (Optional)**:
   * Patents filed, registered trademarks, or copyright details.

---

## 3. Common Application Pitfalls
* **Mismatch in Name**: The startup name in the DPIIT application must match the MCA records exactly.
* **Vague Innovation Description**: Simply copying existing models (e.g., "We are a food delivery app") without explaining the technological innovation or customization will lead to rejection."""
    },
    {
        'id': 'r-5',
        'title': 'Garry Tan: How to Pitch VCs and Angel Investors',
        'category': 'Fundraising',
        'desc': 'Garry Tan outlines the absolute essentials of pitching: what to say in the first 30 seconds, how to present numbers, and mistakes that kill deals.',
        'file_type': 'Video',
        'size': '14 Min',
        'downloads': 1240,
        'views': 4520,
        'type': 'video',
        'video_url': 'https://www.youtube.com/embed/S2p-y-X-50g',
        'duration': '14:20',
        'author': 'Garry Tan',
        'chapters': [
            {'title': 'Introduction & Pitching Core Principles', 'timestamp': '0:00'},
            {'title': 'The First 30 Seconds Rule', 'timestamp': '1:15'},
            {'title': 'Explaining the Market & Traction', 'timestamp': '4:40'},
            {'title': 'Angel Investors vs VCs', 'timestamp': '8:20'},
            {'title': 'Summary & Pitch Deck Formatting Tips', 'timestamp': '12:10'}
        ],
        'transcript': """Welcome back to another YC Startup School session. I'm Garry Tan, CEO of Y Combinator.

Today, we're talking about how to pitch VCs and angel investors. Most founders get this wrong because they treat a pitch like a university lecture or a product demo. But a pitch is actually a narrative about how you're going to build a massive business.

In the first 30 seconds, you need to state clearly what your company does, who it's for, and why it's a huge opportunity. If you can't describe your business in one clear, simple sentence, investors will assume you don't understand it yourself.

Next, you need to show momentum. VCs care about lines, not dots. If you've been working on the idea for six months, show us your growth, your pilots, or your active users. Even if the numbers are small, the trajectory is what matters.

Finally, when pitching angels vs VCs, remember that VCs need 100x outcomes to make their fund math work. Angels might invest because they love the sector or want to support you, but VCs are looking for businesses that can achieve massive scale. Keep it simple, focus on your numbers, and practice daily."""
    },
    {
        'id': 'r-6',
        'title': 'Paul Graham: How to Start a Startup',
        'category': 'Becoming a Founder',
        'desc': 'The classic essay by Paul Graham detailing the three main ingredients needed to start a successful startup: good people, making something users want, and spending as little money as possible.',
        'file_type': 'Essay',
        'size': '15 KB',
        'downloads': 3400,
        'views': 9500,
        'type': 'document',
        'author': 'Paul Graham',
        'read_time': '18 min',
        'content': """# How to Start a Startup

*March 2005 (This essay is derived from a talk at the Harvard Computer Society)*

---

## 1. The Three Ingredients
To start a successful startup, you need three things:
1. To start with good people.
2. To make something customers actually want.
3. To spend as little money as possible.

Most startups that fail do so because they fail at one of these three. A startup that does all three will probably succeed. And that's actually quite encouraging, because all three are doable. You don't have to be a genius to do them.

---

## 2. Good People
What makes a cofounder? A cofounder is someone who shares your vision but brings complementary skills. If you are a developer, find a salesperson or an operations lead. If you are business-focused, you absolutely need a technical cofounder. 

Do not try to build a tech startup without a technical cofounder. Paying an agency to build your MVP is almost always a death sentence.

---

## 3. Make Something People Want
How do you know what people want? The best way is to look at your own problems. What is something you wish existed that doesn't? 

If you are not the target user, you must spend hours talking to them. Go where they hang out. Listen to their complaints. Ask them what workarounds they use.

---

## 4. Spend as Little Money as Possible
The number one cause of death for startups is running out of money. In the early stages, you must keep your expenses extremely low. This is what we call **"ramen profitable"**—making enough money to pay for the founders' basic living expenses.

If you don't raise money, you are forced to be disciplined. If you do raise money, treat it as if it's your last. Don't rent a fancy office or hire full-time employees until you have clear product-market fit."""
    },
    {
        'id': 'r-7',
        'title': 'Michael Seibel: How to Build an MVP',
        'category': 'Product & MVP',
        'desc': 'Michael Seibel, Co-founder of Twitch and YC Partner, breaks down how to build an MVP: launching quickly, focusing on the core feature, and talking to users.',
        'file_type': 'Video',
        'size': '12 Min',
        'downloads': 1890,
        'views': 6120,
        'type': 'video',
        'video_url': 'https://www.youtube.com/embed/ZRJD5N-WlhM',
        'duration': '11:45',
        'author': 'Michael Seibel',
        'chapters': [
            {'title': 'Why you need an MVP', 'timestamp': '0:00'},
            {'title': 'Launch Fast & Iterate', 'timestamp': '2:30'},
            {'title': 'Focusing on Core Features', 'timestamp': '6:15'},
            {'title': 'Getting User Feedback', 'timestamp': '9:00'}
        ],
        'transcript': """Hey guys, Michael Seibel here. Today we are talking about building an MVP.

An MVP stands for Minimum Viable Product. The key word here is *minimum*. 

Most founders build way too much before launching. They think their product needs to be perfect, with fifty different features, before anyone will use it. But in reality, your product will never be perfect on day one.

The goal of an MVP is to get a basic version of your product into the hands of users as fast as possible. Why? Because you want to start learning. You want to see if they actually use it, what they complain about, and what features they request.

Here's my advice for building a great MVP:
1. Build it in less than 4 weeks. If it takes longer, you are building too much.
2. Focus on one single problem for one single customer.
3. Write down a list of all the features you want to build, and throw away 90% of them. Keep only the absolute core feature.
4. Launch it and talk to your users. They will tell you what to build next.

Stop refining, start launching. Let's get to work."""
    }
]

DEFAULT_RADAR_ITEMS = [
    {
        'id': 'rad-1',
        'title': 'Deep Tech & AI Sector Trending Upwards',
        'type': 'Sector Trend',
        'desc': 'Indian government announces a ₹10,000 Crore AI Mission. Startups working on localized models see funding interest climb 40% QoQ.',
        'date': '2026-06-18',
        'tag': 'AI & ML'
    },
    {
        'id': 'rad-2',
        'title': 'SISFS Applications Close in 9 Weeks',
        'type': 'Grant Deadline',
        'desc': 'Ensure your DPIIT registration is active. The upcoming batch review starts September 30.',
        'date': '2026-06-20',
        'tag': 'SISFS'
    },
    {
        'id': 'rad-3',
        'title': 'SaaS Startups Valuation Multiple Stablizing',
        'type': 'Market Report',
        'desc': 'Private market multiples for seed/Series A software companies steadying at 8-12x ARR, signaling a healthy environment for fundraising.',
        'date': '2026-06-15',
        'tag': 'SaaS'
    }
]

DEFAULT_SEQUOIA_SLIDES = [
    {
        'id': 1,
        'title': '1. Company Purpose',
        'guidance': "Define your startup in a single, clear declarative sentence. Avoid technical jargon or marketing hype (e.g., 'An AI assistant that summarizes vendor contracts for SMEs in 30 seconds').",
        'placeholder': "Draft your company one-liner purpose here..."
    },
    {
        'id': 2,
        'title': '2. Problem',
        'guidance': 'Describe the specific pain point your customers face today. How are they solving it now? Why is the current workaround (like Excel or manual labor) expensive or painful?',
        'placeholder': 'Describe the core customer pain point...'
    },
    {
        'id': 3,
        'title': '3. Solution',
        'guidance': "How does your startup solve this? Show the 'aha!' moment. Detail how your software makes their life 10x easier, faster, or cheaper.",
        'placeholder': 'Draft your unique solution value proposition...'
    },
    {
        'id': 4,
        'title': '4. Why Now?',
        'guidance': 'Why hasn\'t this been built before? What recent technological shift (like large language models), market shift, or regulatory change makes today the perfect window?',
        'placeholder': 'Explain why this is the perfect time to build...'
    },
    {
        'id': 5,
        'title': '5. Market Size',
        'guidance': 'Provide realistic estimations for TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and SOM (Serviceable Obtainable Market) within the target sector.',
        'placeholder': 'e.g., TAM: $5.2B. SAM: $1.2B. SOM: $40M.'
    },
    {
        'id': 6,
        'title': '6. Competition',
        'guidance': 'List your direct and indirect competitors. What is your unique unfair advantage? Why is your product sticky enough to prevent churn?',
        'placeholder': 'Detail your competitors and your competitive moat...'
    },
    {
        'id': 7,
        'title': '7. Product',
        'guidance': 'Describe your MVP or core features. What is the key customer workflow? Keep it simple, visual, and focused on usability.',
        'placeholder': 'List your product features and user workflows...'
    },
    {
        'id': 8,
        'title': '8. Business Model',
        'guidance': 'How will your startup make money? Detail your pricing strategy (e.g. B2B SaaS subscription tiers, transaction fees, usage metrics).',
        'placeholder': 'Draft your monetization and pricing models...'
    },
    {
        'id': 9,
        'title': '9. Team',
        'guidance': 'Who is building this? Explain why your team has the technical or sector expertise to win this market.',
        'placeholder': 'Briefly list team members and domain credentials...'
    },
    {
        'id': 10,
        'title': '10. The Ask',
        'guidance': 'How much funding are you raising? How long does it extend your runway (e.g., 18 months), and what milestones will you achieve?',
        'placeholder': 'State your funding ask and runway milestones...'
    }
]
