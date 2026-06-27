import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Plus, 
  MapPin, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Shield, 
  Users, 
  Target, 
  DollarSign, 
  Layers, 
  Compass, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  ExternalLink,
  BookOpen,
  Award,
  AlertTriangle,
  Zap,
  HelpCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface Scores {
  overall: number;
  demand: number;
  competition: number;
  scalability: number;
  revenuePotential: number;
}

interface MarketResearch {
  marketSize: string;
  growthTrends: string;
  industryOverview: string;
}

interface Competitor {
  name: string;
  funding: string;
  pricing: string;
  type: string;
}

interface CustomerPersona {
  name: string;
  painPoints: string;
  behavior: string;
}

interface Visuals {
  marketGrowthChart?: { year: string; value: number }[];
  demandGraph?: { month: string; interest: number }[];
  industryTimeline?: { period: string; milestone: string }[];
}

interface IdeaOverview {
  startupName: string;
  oneLineIdea: string;
  problem: string;
  solution: string;
  industry: string;
  country: string;
  targetAudience: string;
  aiSummary: string;
  businessModel: string;
  marketCategory: string;
  difficultyLevel: string;
  innovationType: string;
}

interface ProblemValidation {
  problemScore: number;
  painScore: number;
  urgency: string;
  frequency: string;
  evidence: string;
}

interface MarketAnalysisDetail {
  tam: string;
  sam: string;
  som: string;
  growthRate: string;
  futureTrends: string[];
  demand: string;
  industryGrowth: string;
  marketMaturity: string;
  visuals?: Visuals;
}

interface CompetitorAnalysisDetail {
  company: string;
  funding: string;
  revenue: string;
  country: string;
  users: string;
  pricing: string;
  strengths: string;
  weaknesses: string;
  website: string;
  techStack?: string;
  aiFeatures?: string;
  usp: string;
}

interface CustomerAnalysisDetail {
  demographics: {
    age: string;
    occupation: string;
    income: string;
    location: string;
    education: string;
  };
  icpProfile: {
    problems: string;
    goals: string;
    buyingPower: string;
    techKnowledge: string;
    decisionMaker: string;
  };
  personas?: {
    name: string;
    age: number;
    occupation: string;
    location: string;
    background: string;
    needs: string;
    goals: string;
  }[];
}

interface Swot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface BusinessModelDetail {
  revenueStreams: string[];
  pricingStructure: string;
  subscriptionTags: string[];
  recommendations: string;
}

interface Gtm {
  launchStrategy: string;
  marketingChannels: string[];
  positioning: string;
  brandStory: string;
  customerJourney?: string[];
  salesFunnel?: string[];
  growthChannels?: string[];
  first100Users: string;
  customerAcquisitionPlan: string;
  retentionPlan: string;
}

interface InvestorAnalysisDetail {
  readiness: number;
  scalability: string;
  revenuePotential: string;
  teamRisk: string;
  technologyRisk: string;
  fundingStage: string;
  investmentScore: number;
  recommendation?: string;
}

interface FinalScore {
  parameterScores: {
    problemStrength: number;
    market: number;
    competition: number;
    innovation: number;
    revenue: number;
    scalability: number;
    gtm: number;
    funding: number;
    technicalFeasibility: number;
    risk: number;
  };
  overall: number;
  grade: string;
  recommendation: string;
  suggestions: string[];
  actionPlan: { week: string; tasks: string[] }[];
}

interface ValidationReport {
  id: string;
  date: string;
  startupIdea: string;
  problemStatement?: string;
  customerSegment?: string;
  geography?: string;
  scores: Scores;
  marketResearch: MarketResearch;
  competitors: Competitor[];
  customerPersona: CustomerPersona;
  fullAnalysis?: {
    ideaOverview?: IdeaOverview;
    problemValidation?: ProblemValidation;
    marketAnalysis?: MarketAnalysisDetail;
    competitorAnalysis?: CompetitorAnalysisDetail[];
    customerAnalysis?: CustomerAnalysisDetail;
    swot?: Swot;
    businessModel?: BusinessModelDetail;
    gtm?: Gtm;
    investorAnalysis?: InvestorAnalysisDetail;
    finalScore?: FinalScore;
  };
}

export default function IdeaAnalysis() {
  const [reports, setReports] = useState<ValidationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ValidationReport | null>(null);
  
  // Active Rava Tab (1 to 10)
  const [activeTab, setActiveTab] = useState<number>(1);
  
  // New Scan Form State
  const [showFormModal, setShowFormModal] = useState(false);
  const [startupName, setStartupName] = useState('');
  const [idea, setIdea] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [industry, setIndustry] = useState('');
  const [geo, setGeo] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  
  const [valLoading, setValLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Initiating validation nodes...');

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await apiFetch('/api/validation/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          setSelectedReport(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load validation reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    setValLoading(true);
    
    // Simulate pipeline micro-steps
    const steps = [
      'AI understanding business concept...',
      'Initiating Market Sizing searches...',
      'Performing Competitor Intelligence check...',
      'Indexing competitor pricing & websites...',
      'Conducting Target Customer research...',
      'Modeling persona Arjun & Siddhartha...',
      'Synthesizing SWOT matrix metrics...',
      'Formulating Go-To-Market strategy...',
      'Calculating Investor Readiness indexes...',
      'Compiling interactive 10-section report dashboard...'
    ];
    
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setLoadingStepText(steps[stepIdx]);
        stepIdx++;
      }
    }, 1500);

    try {
      const response = await apiFetch('/api/validate', {
        method: 'POST',
        body: JSON.stringify({ 
          startupIdea: idea, 
          problemStatement: problem, 
          customerSegment: targetAudience, 
          geography: geo,
          startupName: startupName,
          solution: solution,
          industry: industry,
          targetAudience: targetAudience
        })
      });
      const data = await response.json();
      clearInterval(interval);
      if (data.success) {
        showToast('Idea validation completed!', 'success');
        const newReport = data.report;
        setReports(prev => [newReport, ...prev]);
        setSelectedReport(newReport);
        setActiveTab(1); // switch to first section
        
        // Reset form
        setStartupName('');
        setIdea('');
        setProblem('');
        setSolution('');
        setIndustry('');
        setGeo('');
        setTargetAudience('');
        setShowFormModal(false);
      } else {
        showToast(data.error || 'Failed to complete scan.', 'error');
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      showToast('Connection error during scan.', 'error');
    } finally {
      setValLoading(false);
    }
  };

  // Helper function to extract scores or fallback
  const getOverviewData = (): IdeaOverview => {
    return selectedReport?.fullAnalysis?.ideaOverview || {
      startupName: selectedReport?.fullAnalysis?.ideaOverview?.startupName || "Startup",
      oneLineIdea: selectedReport?.startupIdea || "Interactive validation GPS concept.",
      problem: selectedReport?.problemStatement || "Not specified",
      solution: selectedReport?.fullAnalysis?.ideaOverview?.solution || "Automated validation",
      industry: selectedReport?.fullAnalysis?.ideaOverview?.industry || "Tech & SaaS",
      country: selectedReport?.geography || "India",
      targetAudience: selectedReport?.customerSegment || "Early-stage builders",
      aiSummary: selectedReport?.fullAnalysis?.ideaOverview?.aiSummary || "An innovative solution providing early stage startups with business intelligence validation.",
      businessModel: "B2B SaaS / Freemium",
      marketCategory: "Startup & Innovation Tech",
      difficultyLevel: "Medium",
      innovationType: "AI automation"
    };
  };

  const getProblemData = (): ProblemValidation => {
    return selectedReport?.fullAnalysis?.problemValidation || {
      problemScore: 82,
      painScore: 78,
      urgency: 'High',
      frequency: 'Daily',
      evidence: 'Student entrepreneurs and startup builders actively seek accelerators daily.'
    };
  };

  const getMarketData = (): MarketAnalysisDetail => {
    return selectedReport?.fullAnalysis?.marketAnalysis || {
      tam: "$4.2B",
      sam: "$450M",
      som: "$45M",
      growthRate: "16.5% CAGR",
      futureTrends: ["Modular CRM scaling", "AI automated advisory integration"],
      demand: "High interest volume from accelerator applications.",
      industryGrowth: "Growing rapidly due to global startup booms.",
      marketMaturity: "Emerging growth stage",
      visuals: {
        marketGrowthChart: [
          { year: '2024', value: 100 },
          { year: '2025', value: 120 },
          { year: '2026', value: 150 },
          { year: '2027', value: 190 },
          { year: '2028', value: 240 },
          { year: '2029', value: 300 }
        ],
        demandGraph: [
          { month: 'Jan', interest: 40 },
          { month: 'Feb', interest: 45 },
          { month: 'Mar', interest: 60 },
          { month: 'Apr', interest: 75 },
          { month: 'May', interest: 80 },
          { month: 'Jun', interest: 95 }
        ],
        industryTimeline: [
          { period: 'Past', milestone: 'Legacy incubators with paper checklists' },
          { period: 'Present', milestone: 'AI-guided roadmaps and digital hubs' },
          { period: 'Future', milestone: 'Fully autonomous agent-driven workspaces' }
        ]
      }
    };
  };

  const getCompetitorsData = (): CompetitorAnalysisDetail[] => {
    return selectedReport?.fullAnalysis?.competitorAnalysis || [
      {
        company: "Y Combinator",
        funding: "N/A",
        revenue: "N/A",
        country: "USA",
        users: "10,000+ Founders",
        pricing: "7% Equity stake",
        strengths: "Massive alumni network & institutional status.",
        weaknesses: "Non-AI roadmaps, limited regional context.",
        website: "ycombinator.com",
        techStack: "Unknown",
        aiFeatures: "No AI features",
        usp: "Elite funding and global status."
      },
      {
        company: "Wellfound",
        funding: "$15M",
        revenue: "N/A",
        country: "USA",
        users: "1M+",
        pricing: "Recruiter premium tiers",
        strengths: "Large recruiter and job seeker database.",
        weaknesses: "No modular GPS playbook dashboard for founders.",
        website: "wellfound.com",
        techStack: "React, Ruby",
        aiFeatures: "Basic job matches",
        usp: "Startup recruiter network."
      },
      {
        company: "Rava.ai",
        funding: "Bootstrapped",
        revenue: "Unknown",
        country: "Global",
        users: "1,000+",
        pricing: "$19/mo base pricing",
        strengths: "Solid Go-To-Market validation checks.",
        weaknesses: "Limited founder execution tools, no developer sandbox recommendations.",
        website: "rava.ai",
        techStack: "React, FastAPI",
        aiFeatures: "Automated GTM builder",
        usp: "Marketing and positioning focused checks."
      }
    ];
  };

  const getCustomerData = (): CustomerAnalysisDetail => {
    return selectedReport?.fullAnalysis?.customerAnalysis || {
      demographics: {
        age: "18-25",
        occupation: "College student / aspiring founder",
        income: "Low allowance / Bootstrapped",
        location: "Tier 1 & Tier 2 cities in India",
        education: "Undergraduate / Tech or Business stream"
      },
      icpProfile: {
        problems: "Lacks structured guidance, code support, and access to capital.",
        goals: "Wants to build a prototype and apply for pre-seed funding.",
        buyingPower: "Low",
        techKnowledge: "Moderate",
        decisionMaker: "Yes"
      },
      personas: [
        {
          name: "Arjun, The Tech Student Founder",
          age: 22,
          occupation: "Engineering Student",
          location: "Hyderabad, India",
          background: "3rd year computer science student building AI side projects.",
          needs: "Step-by-step guidance on registration and legal documents.",
          goals: "Convert his project into a structured MVP and test with 100 campus users."
        },
        {
          name: "Neha, The Business Hub Lead",
          age: 21,
          occupation: "Commerce Student",
          location: "Telangana, India",
          background: "E-cell campus leader, wants to launch a local recycling logistics app.",
          needs: "Financial runway calculators and mentor networks.",
          goals: "Find a technical co-founder and apply to T-Hub accelerator programs."
        }
      ]
    };
  };

  const getSwotData = (): Swot => {
    return selectedReport?.fullAnalysis?.swot || {
      strengths: ["Highly structured regional focus", "Low-cost pricing model for students", "Direct integration with college cells"],
      weaknesses: ["Requires extensive data crawls", "Heavily reliant on LLM performance accuracy"],
      opportunities: ["Partnering with state technology cells", "Tier-2 university hub expansion"],
      threats: ["Fast follower copies", "Direct features added by global incubators"]
    };
  };

  const getBusinessModelData = (): BusinessModelDetail => {
    return selectedReport?.fullAnalysis?.businessModel || {
      revenueStreams: ["Freemium passes", "Advisory fee percentages", "Venture placement fees"],
      pricingStructure: "$15/mo premium unlock with basic sandbox features free.",
      subscriptionTags: ["Subscription", "Freemium", "B2B", "Commission"],
      recommendations: "Recommend launch under freemium SaaS, charging for custom NDA templates and warm investor introductions."
    };
  };

  const getGtmData = (): Gtm => {
    return selectedReport?.fullAnalysis?.gtm || {
      launchStrategy: "Acquire campus leads via university entrepreneur cells.",
      marketingChannels: ["LinkedIn content hacks", "State cell webinars", "E-Cell partnerships"],
      positioning: "The end-to-end founder operating system, going from idea to funding.",
      brandStory: "Built by student founders who wasted months search for legal templates and mentor slots.",
      customerJourney: ["Advisors promote in college", "Founders scan idea", "Apply to accelerators", "Land first funding check"],
      salesFunnel: ["Free concept scan", "Milestone onboarding wizard", "Premium document suite upgrade"],
      growthChannels: ["Viral badge shares on LinkedIn", "College ambassador referral rewards"],
      first100Users: "Partner with 5 regional college E-Cells to onboard their active summer cohorts.",
      customerAcquisitionPlan: "Focus heavily on organic student founder community groups and campus ambassador nodes.",
      retentionPlan: "Retain founders by providing weekly progress email digests and milestone checks."
    };
  };

  const getInvestorData = (): InvestorAnalysisDetail => {
    return selectedReport?.fullAnalysis?.investorAnalysis || {
      readiness: 78,
      scalability: "High",
      revenuePotential: "Very High",
      teamRisk: "Medium",
      technologyRisk: "Low",
      fundingStage: "Incubator Grants / Angel Pre-Seed",
      investmentScore: 82,
      recommendation: "Ready for local student incubator programs; prepare pitch decks for pre-seed syndicates."
    };
  };

  const getFinalScoreData = (): FinalScore => {
    return selectedReport?.fullAnalysis?.finalScore || {
      parameterScores: {
        problemStrength: selectedReport?.scores?.demand || 84,
        market: selectedReport?.scores?.demand || 80,
        competition: selectedReport?.scores?.competition || 71,
        innovation: 84,
        revenue: selectedReport?.scores?.revenuePotential || 79,
        scalability: selectedReport?.scores?.scalability || 88,
        gtm: 75,
        funding: 80,
        technicalFeasibility: 92,
        risk: 58
      },
      overall: selectedReport?.scores?.overall || 78,
      grade: selectedReport?.scores?.overall && selectedReport.scores.overall >= 85 ? "A" : "B+",
      recommendation: "Proceed to validation & landing page MVP setup",
      suggestions: [
        "Improve early pricing packaging to capture enterprise colleges.",
        "Partner with T-Hub or regional state accelerators.",
        "Focus first on building the Mentor matching board."
      ],
      actionPlan: [
        { week: "Week 1", tasks: ["Interview 20 local target founders", "Draft demographic constraints"] },
        { week: "Week 2", tasks: ["Launch landing page with email capture lead magnet"] },
        { week: "Week 3", tasks: ["Deploy basic AI Copilot page interface"] },
        { week: "Week 4", tasks: ["Conduct alpha validation run with 15 users"] },
        { week: "Week 5", tasks: ["Submit application to regional state grants"] }
      ]
    };
  };

  const overview = getOverviewData();
  const problemData = getProblemData();
  const marketData = getMarketData();
  const competitorsData = getCompetitorsData();
  const customerData = getCustomerData();
  const swot = getSwotData();
  const businessModel = getBusinessModelData();
  const gtm = getGtmData();
  const investorData = getInvestorData();
  const finalScore = getFinalScoreData();

  // Recharts Radar Chart Setup
  const radarChartData = selectedReport ? [
    { subject: 'Problem Strength', value: finalScore.parameterScores.problemStrength },
    { subject: 'Market TAM', value: finalScore.parameterScores.market },
    { subject: 'Competition', value: finalScore.parameterScores.competition },
    { subject: 'Innovation', value: finalScore.parameterScores.innovation },
    { subject: 'Revenue Pot.', value: finalScore.parameterScores.revenue },
    { subject: 'Scalability', value: finalScore.parameterScores.scalability },
    { subject: 'GTM Strategy', value: finalScore.parameterScores.gtm },
    { subject: 'Investor Match', value: finalScore.parameterScores.funding },
  ] : [];

  const tabList = [
    { id: 1, label: '1. Idea Overview', icon: Cpu },
    { id: 2, label: '2. Problem Check', icon: Target },
    { id: 3, label: '3. Market Size', icon: TrendingUp },
    { id: 4, label: '4. Competitors', icon: Layers },
    { id: 5, label: '5. Personas ICP', icon: Users },
    { id: 6, label: '6. SWOT Matrix', icon: Shield },
    { id: 7, label: '7. Business Model', icon: DollarSign },
    { id: 8, label: '8. GTM Strategy', icon: Compass },
    { id: 9, label: '9. Investor Check', icon: Award },
    { id: 10, label: '10. Score & Action', icon: CheckCircle }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Header Banner */}
      <div className="page-header" style={{ position: 'relative', zIndex: 5 }}>
        <div className="page-title-section">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-glow)', padding: '0.35rem 0.85rem', borderRadius: '20px', width: 'fit-content', marginBottom: '0.5rem' }}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Idea Validation GPS</span>
          </div>
          <h2 className="gradient-text" style={{ fontSize: '1.85rem' }}>Rava-Style Idea Analyzer</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Comprehensive 10-step market, GTM, risk, and investor readiness diagnostic sweep.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {reports.length > 0 && (
            <select 
              className="form-select" 
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
              value={selectedReport?.id || ''}
              onChange={(e) => {
                const rep = reports.find(r => r.id === e.target.value);
                if (rep) setSelectedReport(rep);
              }}
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.fullAnalysis?.ideaOverview?.startupName || r.startupIdea.substring(0, 20)} ({r.date})</option>
              ))}
            </select>
          )}
          <button onClick={() => setShowFormModal(true)} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            <Plus size={16} /> New Idea Analysis
          </button>
        </div>
      </div>

      {reports.length === 0 && !valLoading ? (
        <div className="glass-card flex-center" style={{ flexDirection: 'column', gap: '1.5rem', padding: '4rem 2rem', textAlign: 'center' }}>
          <Cpu size={56} style={{ color: 'var(--primary)', opacity: 0.8 }} />
          <div style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Startup Ideas Scanned Yet</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Studlyf combines market scoping, SWOT matrix evaluation, GTM planning, and investor scoring under one workspace. Start by executing your first concept analysis sweep.
            </p>
          </div>
          <button onClick={() => setShowFormModal(true)} className="btn btn-primary">
            Analyze Your First Startup Concept <Sparkles size={16} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Navigation: 10 Tab Items */}
          <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
              Idea Analysis Tabs
            </span>
            {tabList.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'var(--primary-glow)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="sidebar-tab-btn"
                >
                  <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                  <span style={{ flex: 1 }}>{tab.label}</span>
                  {isActive && <ChevronRight size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              );
            })}

            {selectedReport && (
              <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Venture Grade:</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {finalScore.grade}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  Index: <strong>{finalScore.overall} / 100</strong>
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.62rem', marginTop: '6px', display: 'inline-block' }}>
                  {finalScore.recommendation}
                </span>
              </div>
            )}
          </div>

          {/* Right Content Panel */}
          <div className="glass-card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Active Tab Panel Renderer */}
            {activeTab === 1 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={20} style={{ color: 'var(--primary)' }} /> 1. Startup Concept Overview
                </h3>
                <p style={{ fontSize: '0.88rem' }}>AI evaluation of startup taxonomy, primary business models, and core positioning statements.</p>
                
                <div style={{ padding: '1rem', background: 'var(--primary-glow)', border: '1px solid rgba(239, 43, 112, 0.15)', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)', marginBottom: '0.25rem' }}>AI Value Proposition Summary:</h4>
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.6 }}>"{overview.aiSummary}"</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Venture Name</span>
                    <h4 style={{ fontSize: '0.98rem', color: '#fff', marginTop: '0.2rem' }}>{overview.startupName}</h4>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Industry Taxonomy</span>
                    <h4 style={{ fontSize: '0.98rem', color: '#fff', marginTop: '0.2rem' }}>{overview.industry}</h4>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Business Model</span>
                    <h4 style={{ fontSize: '0.98rem', color: '#fff', marginTop: '0.2rem' }}>{overview.businessModel}</h4>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Market Category</span>
                    <h4 style={{ fontSize: '0.98rem', color: '#fff', marginTop: '0.2rem' }}>{overview.marketCategory}</h4>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Implementation Difficulty</span>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--warning)', marginTop: '0.2rem' }}>{overview.difficultyLevel}</h4>
                  </div>
                  <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Innovation Paradigm</span>
                    <h4 style={{ fontSize: '0.98rem', color: 'var(--secondary)', marginTop: '0.2rem' }}>{overview.innovationType}</h4>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Problem Stated by Founder</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{overview.problem}</p>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Proposed Solution Architecture</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{overview.solution}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={20} style={{ color: 'var(--primary)' }} /> 2. Problem Validation
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Analysis confirming whether the problem is real, painful, and actively growing.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Problem Score</span>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{problemData.problemScore}%</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Pain Intensity</span>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>{problemData.painScore}%</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Urgency Level</span>
                    <span className="badge badge-danger" style={{ display: 'inline-block', fontSize: '0.8rem', padding: '0.2rem 0.6rem', marginTop: '0.5rem' }}>{problemData.urgency}</span>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Frequency</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'block', marginTop: '0.4rem' }}>{problemData.frequency}</span>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    <Award size={15} /> Data-Backed Evidence of Problem:
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{problemData.evidence}</p>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} style={{ color: 'var(--primary)' }} /> 3. Market Size & Analytics
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Market opportunity calculations including TAM, SAM, SOM, compound growth metrics, and visual sizing trajectories.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TAM (Addressable)</span>
                    <h4 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{marketData.tam}</h4>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SAM (Serviceable)</span>
                    <h4 style={{ fontSize: '1.35rem', color: 'var(--primary)', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{marketData.sam}</h4>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SOM (Obtainable)</span>
                    <h4 style={{ fontSize: '1.35rem', color: 'var(--secondary)', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{marketData.som}</h4>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Growth CAGR</span>
                    <h4 style={{ fontSize: '1.35rem', color: 'var(--success)', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{marketData.growthRate}</h4>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem', margin: '0.5rem 0' }}>
                  {/* Market growth chart */}
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700 }}>Market Growth Projection (USD Millions)</h4>
                    <div style={{ width: '100%', height: '180px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={marketData.visuals?.marketGrowthChart || []}>
                          <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={10} />
                          <YAxis stroke="var(--text-muted)" fontSize={10} />
                          <Tooltip contentStyle={{ background: 'var(--bg-popover)', border: '1px solid var(--border-light)', borderRadius: '6px' }} />
                          <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorGrowth)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Demand index graph */}
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: 700 }}>Interest Search Volume Trends</h4>
                    <div style={{ width: '100%', height: '180px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marketData.visuals?.demandGraph || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                          <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} />
                          <YAxis stroke="var(--text-muted)" fontSize={10} />
                          <Tooltip contentStyle={{ background: 'var(--bg-popover)', border: '1px solid var(--border-light)', borderRadius: '6px' }} />
                          <Bar dataKey="interest" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Market Maturity</span>
                    <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600, marginTop: '2px' }}>{marketData.marketMaturity}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>Future Trends:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {marketData.futureTrends.map((t, idx) => (
                        <div key={idx} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>• {t}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sector Milestones Timeline</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                      {marketData.visuals?.industryTimeline?.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.76rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', flexShrink: 0, width: '54px' }}>{t.period}:</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{t.milestone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} style={{ color: 'var(--primary)' }} /> 4. Competitive Intelligence
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Interactive competitor matrices checking funding, features checklist, website URLs, and AI positioning loops.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {competitorsData.map((comp, idx) => (
                    <div 
                      key={idx} 
                      className="glass-card" 
                      style={{ 
                        padding: '1.25rem 1rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.75rem',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div className="flex-between">
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800 }}>{comp.company}</h4>
                        <a href={`https://${comp.website}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.72rem', textDecoration: 'none' }}>
                          Visit <ExternalLink size={12} />
                        </a>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        <div>Funding: <strong style={{ color: '#fff' }}>{comp.funding}</strong></div>
                        <div>Revenue: <strong style={{ color: '#fff' }}>{comp.revenue}</strong></div>
                        <div>Pricing: <strong style={{ color: '#fff' }}>{comp.pricing}</strong></div>
                        <div>Users: <strong style={{ color: '#fff' }}>{comp.users}</strong></div>
                        <div>Stack: <strong style={{ color: 'var(--secondary)' }}>{comp.techStack || 'N/A'}</strong></div>
                      </div>

                      <div style={{ padding: '0.5rem', background: 'rgba(16,185,129,0.04)', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Strength</span>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{comp.strengths}</p>
                      </div>

                      <div style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.04)', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Weakness</span>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{comp.weaknesses}</p>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>USP:</span> <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{comp.usp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 5 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} style={{ color: 'var(--primary)' }} /> 5. Target Customer & Personas
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Grounded demographics mapping and interactive student/founder ICP personas.</p>

                <div className="grid-2" style={{ gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem', marginBottom: '0.75rem', fontWeight: 700 }}>Demographics Map</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div className="flex-between"><span>Age Cohort:</span><strong style={{ color: '#fff' }}>{customerData.demographics.age}</strong></div>
                      <div className="flex-between"><span>Primary Roles:</span><strong style={{ color: '#fff' }}>{customerData.demographics.occupation}</strong></div>
                      <div className="flex-between"><span>Income Tier:</span><strong style={{ color: '#fff' }}>{customerData.demographics.income}</strong></div>
                      <div className="flex-between"><span>Concentration:</span><strong style={{ color: '#fff' }}>{customerData.demographics.location}</strong></div>
                      <div className="flex-between"><span>Education:</span><strong style={{ color: '#fff' }}>{customerData.demographics.education}</strong></div>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.4rem', marginBottom: '0.75rem', fontWeight: 700 }}>ICP Profile Check</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div className="flex-between"><span>Frustrations:</span><strong style={{ color: '#fff', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerData.icpProfile.problems}</strong></div>
                      <div className="flex-between"><span>Goals:</span><strong style={{ color: '#fff', textAlign: 'right', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customerData.icpProfile.goals}</strong></div>
                      <div className="flex-between"><span>Buying Power:</span><strong style={{ color: '#fff' }}>{customerData.icpProfile.buyingPower}</strong></div>
                      <div className="flex-between"><span>Tech Savviness:</span><strong style={{ color: '#fff' }}>{customerData.icpProfile.techKnowledge}</strong></div>
                      <div className="flex-between"><span>Decision Maker:</span><strong style={{ color: '#fff' }}>{customerData.icpProfile.decisionMaker}</strong></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.88rem', marginBottom: '0.75rem', fontWeight: 700 }}>Representative User Personas</h4>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    {customerData.personas?.map((p, idx) => (
                      <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: idx === 0 ? 'var(--primary)' : 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <h5 style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>{p.name}</h5>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{p.age} years • {p.location}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0.2rem 0' }}>"{p.background}"</p>
                        <div style={{ fontSize: '0.76rem' }}>
                          <div style={{ color: 'var(--primary)', fontWeight: 600 }}>Frustrations & Needs:</div>
                          <span style={{ color: 'var(--text-secondary)' }}>{p.needs}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', marginTop: '2px' }}>
                          <div style={{ color: 'var(--success)', fontWeight: 600 }}>Core Goals:</div>
                          <span style={{ color: 'var(--text-secondary)' }}>{p.goals}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 6 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} style={{ color: 'var(--primary)' }} /> 6. SWOT Analysis Matrix
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Strategic index quadrants evaluating internal strengths/weaknesses and external opportunities/threats.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                  {/* Strengths */}
                  <div style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(16, 185, 129, 0.02)', 
                    border: '1px solid rgba(16, 185, 129, 0.25)', 
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.02)'
                  }}>
                    <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '0.75rem' }}>
                      <CheckCircle size={16} /> Strengths
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {swot.strengths.map((s, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(245, 158, 11, 0.02)', 
                    border: '1px solid rgba(245, 158, 11, 0.25)', 
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 0 15px rgba(245, 158, 11, 0.02)'
                  }}>
                    <h4 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '0.75rem' }}>
                      <AlertTriangle size={16} /> Weaknesses
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {swot.weaknesses.map((w, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>-</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(107, 108, 255, 0.02)', 
                    border: '1px solid rgba(107, 108, 255, 0.25)', 
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 0 15px rgba(107, 108, 255, 0.02)'
                  }}>
                    <h4 style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '0.75rem' }}>
                      <Zap size={16} /> Opportunities
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {swot.opportunities.map((o, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>↗</span>
                          <span>{o}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Threats */}
                  <div style={{ 
                    padding: '1.25rem', 
                    background: 'rgba(239, 68, 68, 0.02)', 
                    border: '1px solid rgba(239, 68, 68, 0.25)', 
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 0 15px rgba(239, 68, 68, 0.02)'
                  }}>
                    <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.98rem', marginBottom: '0.75rem' }}>
                      <ShieldAlert size={16} /> Threats
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {swot.threats.map((t, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                          <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>⚠</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 7 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={20} style={{ color: 'var(--primary)' }} /> 7. Business Model & Monetization
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Valuating revenue streams, recommending tier pricing matrix structure, and pricing adjustments.</p>

                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Monetization Streams Recommended</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {businessModel.revenueStreams.map((s, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.76rem' }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pricing Architecture</span>
                    <p style={{ fontSize: '0.88rem', color: '#fff', fontWeight: 600, marginTop: '0.25rem' }}>{businessModel.pricingStructure}</p>
                    
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.75rem' }}>Target Tags:</span>
                    <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
                      {businessModel.subscriptionTags.map(tag => (
                        <span key={tag} className="badge badge-secondary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', color: 'var(--secondary)' }}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--secondary-glow)', border: '1px solid rgba(107, 108, 255, 0.15)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>AI Monetization Advice</span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.5 }}>{businessModel.recommendations}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 8 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={20} style={{ color: 'var(--primary)' }} /> 8. Go-To-Market (GTM) Strategy
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Brand story narratives, growth hacking channels, and roadmap triggers to acquire your first 100 users.</p>

                <div className="grid-2" style={{ gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Launch Positioning Strategy</span>
                    <p style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginTop: '0.3rem' }}>{gtm.launchStrategy}</p>
                    
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.75rem' }}>Positioning Statement:</span>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.2rem' }}>"{gtm.positioning}"</p>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Brand Story Core</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem', lineHeight: 1.5 }}>{gtm.brandStory}</p>
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Acquisition Funnel Steps</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {gtm.customerJourney?.map((step, idx) => (
                        <div key={idx} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{idx + 1}.</span> {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Acquisition & Growth Channels</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {gtm.marketingChannels.map(ch => (
                        <span key={ch} className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{ch}</span>
                      ))}
                      {gtm.growthChannels?.map(ch => (
                        <span key={ch} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{ch}</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.75rem' }}>First 100 Users Action:</span>
                    <p style={{ fontSize: '0.78rem', color: '#fff', fontWeight: 600, marginTop: '0.2rem' }}>{gtm.first100Users}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 9 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: 'var(--primary)' }} /> 9. Investor Readiness
                </h3>
                <p style={{ fontSize: '0.88rem' }}>VC assessment scoring, scalability indicators, team/tech risks audits, and initial funding stage recommendations.</p>

                <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
                  {/* circular gauge for investor readiness */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Investor Readiness Index</span>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: `conic-gradient(var(--primary) ${investorData.readiness * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '84px',
                        height: '84px',
                        borderRadius: '50%',
                        background: 'var(--bg-popover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.45rem',
                        fontWeight: 900,
                        color: '#fff'
                      }}>{investorData.readiness}%</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Scalability Potential:</span>
                      <strong style={{ color: 'var(--success)' }}>{investorData.scalability}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Revenue Potential:</span>
                      <strong style={{ color: 'var(--success)' }}>{investorData.revenuePotential}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Team Composition Risk:</span>
                      <strong style={{ color: 'var(--warning)' }}>{investorData.teamRisk}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Technology Implementation Risk:</span>
                      <strong style={{ color: 'var(--success)' }}>{investorData.technologyRisk}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Target Funding Round:</span>
                      <strong style={{ color: '#fff' }}>{investorData.fundingStage}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--primary-glow)', border: '1px solid rgba(239, 43, 112, 0.15)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Investor Strategy Recommendations:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.25rem' }}>{investorData.recommendation}</p>
                </div>
              </div>
            )}

            {activeTab === 10 && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} style={{ color: 'var(--primary)' }} /> 10. AI Score & 5-Week Action Plan
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Parameter scores breakdown, grade allocation, and weekly milestone task outlines.</p>

                <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'center' }}>
                  {/* radar chart container */}
                  <div style={{ width: '100%', height: '220px', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                        <PolarGrid stroke="var(--border-light)" />
                        <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={8} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} fontSize={6} />
                        <Radar name="Scoring" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(finalScore.parameterScores).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div className="flex-between" style={{ fontSize: '0.72rem' }}>
                          <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                          <strong style={{ color: '#fff' }}>{val}%</strong>
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${val}%`, background: val > 75 ? 'var(--success)' : val > 50 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>AI Strategic Suggestions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {finalScore.suggestions.map((s, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--primary)' }}>•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.88rem', marginBottom: '0.75rem', fontWeight: 700 }}>5-Week Execution Plan</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {finalScore.actionPlan.map((plan, idx) => (
                      <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-glow)', border: '1px solid rgba(239,43,112,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{plan.week}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
                            {plan.tasks.map((task, tIdx) => (
                              <span key={tIdx} className="badge badge-secondary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', color: 'var(--text-secondary)' }}>
                                {task}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODAL: NEW IDEA VALIDATION FORM */}
      {showFormModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.82)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)',
          padding: '1rem'
        }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '540px', background: 'var(--bg-popover)', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Cpu size={20} style={{ color: 'var(--primary)' }} /> AI Startup Idea Diagnostic
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: 'none', background: 'transparent' }}
              >✕</button>
            </div>

            {valLoading ? (
              <div className="flex-center" style={{ flexDirection: 'column', height: '300px', gap: '1.25rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', fontWeight: 600 }}>{loadingStepText}</span>
              </div>
            ) : (
              <form onSubmit={handleValidate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="form-group">
                  <label className="form-label">Startup Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Studlyf"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">One-line Idea / Core Concept</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. AI Founder GPS & SaaS Workspace"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Statement</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="e.g. Students don't know how to build startups, lack roadmaps and funding."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    required
                    style={{ minHeight: '60px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Solution</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="e.g. AI-powered GPS builder, template database, cofounder matcher."
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    required
                    style={{ minHeight: '60px' }}
                  />
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Industry Sector</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. EdTech & SaaS"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Country</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. India"
                      value={geo}
                      onChange={(e) => setGeo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Target Audience / ICP Segment</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. College students, young developers"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  Run Rava Diagnostic Sweep <Sparkles size={16} style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
