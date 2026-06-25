DEFAULT_ROADMAP_TASKS = {
    'Idea': [
        {'text': 'Document 3 critical customer pain points', 'category': 'Validation', 'guide_id': 'r-4'},
        {'text': 'Perform 10 user discovery interviews', 'category': 'Validation', 'guide_id': 'r-4'},
        {'text': 'Define startup one-liner and core value proposition', 'category': 'Pitching', 'guide_id': 'r-2'},
        {'text': 'Perform AI validation scan', 'category': 'Validation', 'guide_id': 'r-4'}
    ],
    'Validation': [
        {'text': 'Design landing page mockup', 'category': 'MVP', 'guide_id': 'r-2'},
        {'text': 'Collect 100 email signups on waitlist', 'category': 'Growth', 'guide_id': 'r-4'},
        {'text': 'Conduct competitive pricing analysis', 'category': 'Finance', 'guide_id': 'r-3'},
        {'text': 'Create draft pitch outline', 'category': 'Pitching', 'guide_id': 'r-2'}
    ],
    'MVP': [
        {'text': 'Build functional core features (MVP)', 'category': 'MVP', 'guide_id': 'r-1'},
        {'text': 'Deploy to cloud hosting (AWS / Vercel)', 'category': 'Infrastructure', 'guide_id': 'r-4'},
        {'text': 'Obtain feedback from 5 active beta testers', 'category': 'Validation', 'guide_id': 'r-4'}
    ],
    'Revenue': [
        {'text': 'Set up Stripe payment flows', 'category': 'Finance', 'guide_id': 'r-3'},
        {'text': 'Close first 5 paid customers', 'category': 'Growth', 'guide_id': 'r-4'},
        {'text': 'Launch on Product Hunt', 'category': 'Growth', 'guide_id': 'r-2'}
    ],
    'Fundraising': [
        {'text': 'Incorporate company and sign SHA', 'category': 'Legal', 'guide_id': 'r-1'},
        {'text': 'Construct complete pitch room and financial model', 'category': 'Pitching', 'guide_id': 'r-3'},
        {'text': 'Begin cold reachout to matching VCs', 'category': 'Funding', 'guide_id': 'r-2'}
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
        'downloads': 215
    },
    {
        'id': 'r-2',
        'title': 'Pitch Deck Template (12-Slide Outline)',
        'category': 'Pitch Deck',
        'desc': 'Premium Figma & PPT outline for pitching early stage VCs, structured according to Sequoia guidelines.',
        'file_type': 'PDF/PPTX',
        'size': '12 MB',
        'downloads': 540
    },
    {
        'id': 'r-3',
        'title': 'Financial Projection Model (3-Year Projection)',
        'category': 'Financial Models',
        'desc': 'Pre-built Excel model with forecasting sheets for SaaS, hiring pipelines, and server costing variables.',
        'file_type': 'XLSX',
        'size': '1.2 MB',
        'downloads': 382
    },
    {
        'id': 'r-4',
        'title': 'DPIIT Recognition Guide Checklist',
        'category': 'Guides',
        'desc': 'Detailed, step-by-step handbook on documents needed and errors to avoid to ensure fast DPIIT approval.',
        'file_type': 'PDF',
        'size': '820 KB',
        'downloads': 189
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
