import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Cpu, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  Plus, 
  Info, 
  Layers, 
  DollarSign,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Compass,
  FileText,
  Calendar,
  Lock,
  ArrowRight,
  Mail
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface ValidationScore {
  overall: number;
  demand: number;
  competition: number;
  scalability: number;
  revenuePotential: number;
}

interface Competitor {
  name: string;
  funding: string;
  pricing: string;
  type: 'Direct' | 'Indirect';
}

interface MarketResearch {
  marketSize: string;
  growthTrends: string;
}

interface ValidationReport {
  id: string;
  date: string;
  startupIdea: string;
  scores: ValidationScore;
  competitors: Competitor[];
  marketResearch: MarketResearch;
}

interface BuildPhase {
  phase: string;
  duration: string;
  objectives: string;
}

interface CostEstimate {
  item: string;
  mvp: string;
  growth: string;
  scale: string;
}

interface BuildAdvisorResult {
  stack: Record<string, string>;
  phases: BuildPhase[];
  costEstimates: CostEstimate[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuth();
  
  const [validationReports, setValidationReports] = useState<ValidationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ValidationReport | null>(null);
  
  const [showValModal, setShowValModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Runway & Burn Simulator State
  const [cashInBank, setCashInBank] = useState(120000);
  const [monthlyBurn, setMonthlyBurn] = useState(10000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(2000);
  
  // Validation Form State
  const [idea, setIdea] = useState('');
  const [problem, setProblem] = useState('');
  const [segment, setSegment] = useState('');
  const [geo, setGeo] = useState('');
  const [valLoading, setValLoading] = useState(false);

  // Build Advisor Form State
  const [startupType, setStartupType] = useState('SaaS');
  const [buildLoading, setBuildLoading] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildAdvisorResult | null>(null);

  // Layer 2 Connected Data State
  const [dashboardData, setDashboardData] = useState<any>({
    startupHealthScore: 65,
    validationScore: 0,
    roadmapProgress: 0,
    fundingReadiness: 40,
    recommendedMentors: [],
    recommendedInvestors: [],
    upcomingDeadlines: [],
    openOpportunities: [],
    aiSuggestions: [],
    fundingReadinessReasons: []
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const response = await apiFetch('/api/dashboard/connected-data');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard connected data:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const response = await apiFetch('/api/validation/reports');
      if (response.ok) {
        const data = await response.json();
        setValidationReports(data);
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
    fetchDashboardData();
  }, []);

  // Handler for AI Validation
  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) return;
    setValLoading(true);
    try {
      const response = await apiFetch('/api/validate', {
        method: 'POST',
        body: JSON.stringify({ 
          startupIdea: idea, 
          problemStatement: problem, 
          customerSegment: segment, 
          geography: geo 
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Idea validation scan completed!', 'success');
        const newReport = data.report;
        setValidationReports(prev => [newReport, ...prev]);
        setSelectedReport(newReport);
        
        // Reload dashboard connected details
        fetchDashboardData();
        
        if (profile.stage === 'Idea') {
          updateProfileStage('Validation');
        }
        
        setIdea('');
        setProblem('');
        setSegment('');
        setGeo('');
        setShowValModal(false);
      } else {
        showToast(data.error || 'Failed to complete validation scan.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error during scan.', 'error');
    } finally {
      setValLoading(false);
    }
  };

  // Handler for Build Advisor
  const handleBuildAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuildLoading(true);
    try {
      const response = await apiFetch('/api/build-advisor', {
        method: 'POST',
        body: JSON.stringify({ startupType })
      });
      const data = await response.json();
      if (data.success) {
        setBuildResult(data);
        showToast('Technical stack advisor profile generated!', 'success');
        fetchDashboardData();
      } else {
        showToast(data.error || 'Failed to generate stack advice.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error connecting to Build Advisor.', 'error');
    } finally {
      setBuildLoading(false);
    }
  };

  const updateProfileStage = async (newStage: string) => {
    try {
      const response = await apiFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify({ stage: newStage })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        showToast(`Phase stage updated to ${newStage}!`, 'info');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stepper calculations
  const steps = [
    { label: 'Signup', path: '/settings', isCompleted: true },
    { label: 'Startup Creation', path: '/startup-profile', isCompleted: profile.registered },
    { label: 'AI Validation', path: '/', isCompleted: validationReports.length > 0 || dashboardData.validationScore > 0, action: () => setShowValModal(true) },
    { label: 'Founder GPS', path: '/roadmap', isCompleted: dashboardData.roadmapProgress > 0 },
    { label: 'AI Build Advisor', path: '/', isCompleted: profile.stage !== 'Idea', action: () => setShowBuildModal(true) },
    { label: 'Resources Library', path: '/playbooks', isCompleted: true },
    { label: 'Mentor Discovery', path: '/mentors', isCompleted: dashboardData.recommendedMentors.length > 0 },
    { label: 'Smart Network Recommender', path: '/network', isCompleted: false },
    { label: 'Investor Discovery', path: '/investors', isCompleted: dashboardData.recommendedInvestors.length > 0 },
    { label: 'Funding Navigator', path: '/funding', isCompleted: false },
    { label: 'Opportunity Board', path: '/opportunities', isCompleted: false },
    { label: 'Startup Growth', path: '/pitch-review', isCompleted: false }
  ];

  const chartData = selectedReport ? [
    { subject: 'Demand', value: selectedReport.scores.demand },
    { subject: 'Competition', value: selectedReport.scores.competition },
    { subject: 'Scalability', value: selectedReport.scores.scalability },
    { subject: 'Revenue Potential', value: selectedReport.scores.revenuePotential }
  ] : [];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      <div className="radial-glow-spot" style={{ top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 60%)' }} />
      <div className="radial-glow-spot" style={{ bottom: '20%', left: '-15%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 65%)' }} />

      {/* Top Banner */}
      <div className="page-header" style={{ position: 'relative', zIndex: 5 }}>
        <div className="page-title-section">
          <h2 className="gradient-text" style={{ fontSize: '1.85rem' }}>Welcome back, {profile.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Layer 2 Connected Command Center — Orchestrating your startup journey.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setShowValModal(true)} className="btn btn-primary">
            <Plus size={16} /> Validate Idea
          </button>
          <button onClick={() => setShowBuildModal(true)} className="btn btn-secondary">
            <Layers size={16} /> Build Advisor
          </button>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', zIndex: 5 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.05rem', marginBottom: '1.5rem', fontWeight: 700 }}>
          <Compass size={18} style={{ color: 'var(--secondary)' }} /> Founder Journey Stepper
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'thin'
        }}>
          {steps.map((st, idx) => (
            <div 
              key={idx} 
              onClick={() => st.action ? st.action() : navigate(st.path)}
              className="flex-center"
              style={{ 
                padding: '0.6rem 1.15rem', 
                background: st.isCompleted ? 'rgba(16, 185, 129, 0.07)' : 'rgba(255, 255, 255, 0.02)',
                border: st.isCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-light)',
                borderRadius: '24px',
                gap: '0.6rem',
                cursor: 'pointer',
                opacity: st.isCompleted ? 1 : 0.55,
                transition: 'all 0.25s ease',
                flexShrink: 0,
                boxShadow: st.isCompleted ? '0 2px 10px rgba(16, 185, 129, 0.05)' : 'none'
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: st.isCompleted ? 'var(--success)' : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: st.isCompleted ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {st.isCompleted ? '✓' : idx + 1}
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: st.isCompleted ? '#fff' : 'var(--text-secondary)'
              }}>{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ position: 'absolute', top: '10%', right: '8%', color: 'var(--primary)', opacity: 0.12 }}>
            <Briefcase size={36} />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Startup Venture</span>
          <span className="metric-value" style={{ fontSize: '1.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 800 }}>{profile.startupName}</span>
          <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{profile.industry}</span>
        </div>

        <div className="metric-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ position: 'absolute', top: '10%', right: '8%', color: 'var(--secondary)', opacity: 0.12 }}>
            <Layers size={36} />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Stage</span>
          <span className="metric-value" style={{ fontSize: '1.35rem', fontWeight: 800 }}>{profile.stage}</span>
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
            {['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].map((stg) => (
              <div 
                key={stg} 
                style={{ 
                  flex: 1, 
                  height: '4px', 
                  borderRadius: '2px', 
                  backgroundColor: profile.stage === stg || ['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].indexOf(profile.stage) > ['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].indexOf(stg) 
                    ? 'var(--secondary)' 
                    : 'rgba(255,255,255,0.06)' 
                }} 
              />
            ))}
          </div>
        </div>

        <div className="metric-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ position: 'absolute', top: '10%', right: '8%', color: 'var(--primary)', opacity: 0.12 }}>
            <Sparkles size={36} />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Validation Reports</span>
          <span className="metric-value" style={{ fontSize: '1.35rem', fontWeight: 800 }}>{validationReports.length}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Latest: {validationReports[0]?.date || 'None'}</span>
        </div>

        <div className="metric-card" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ position: 'absolute', top: '10%', right: '8%', color: 'var(--success)', opacity: 0.12 }}>
            <Activity size={36} />
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Venture Health Score</span>
          <span className="metric-value" style={{ color: 'var(--success)', fontSize: '1.35rem', fontWeight: 800 }}>
            {dashboardData.startupHealthScore}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Grounded scoring mechanism</span>
        </div>
      </div>

      <div className="grid-2" style={{ position: 'relative', zIndex: 5 }}>
        {/* Left Column: Command Center Gauge & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Health Gauge & Readiness Indicators */}
          <div className="glass-card grid-2" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <div className="flex-center" style={{ 
              flexDirection: 'column', 
              padding: '1.25rem 1rem', 
              background: 'rgba(255,255,255,0.01)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-light)',
              boxShadow: 'inset 0 0 12px rgba(255,255,255,0.01)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Health Index</span>
              <div style={{
                width: '104px',
                height: '104px',
                borderRadius: '50%',
                background: `conic-gradient(var(--success) ${dashboardData.startupHealthScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 0 20px rgba(16,185,129,0.15)'
              }}>
                <div style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  background: 'var(--bg-popover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.02)'
                }}>{dashboardData.startupHealthScore}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                <Award size={18} style={{ color: 'var(--warning)', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.3))' }} /> Funding Readiness
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>{dashboardData.fundingReadiness}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>preparedness index</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                {dashboardData.fundingReadinessReasons && dashboardData.fundingReadinessReasons.slice(0, 3).map((r: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Validation Explorer */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '400px' }}>
            <div className="flex-between">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} /> AI Validation Scan
              </h3>
              {validationReports.length > 1 && (
                <select 
                  className="form-select" 
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                  value={selectedReport?.id || ''}
                  onChange={(e) => setSelectedReport(validationReports.find(r => r.id === e.target.value) || null)}
                >
                  {validationReports.map(r => (
                    <option key={r.id} value={r.id}>{r.startupIdea.substring(0, 24)}...</option>
                  ))}
                </select>
              )}
            </div>

            {selectedReport ? (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Concept scanned:</h4>
                  <p style={{ fontStyle: 'italic', fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 500 }}>"{selectedReport.startupIdea}"</p>
                </div>

                <div className="grid-2" style={{ alignItems: 'center', gap: '1rem' }}>
                  {/* Circular Score Meter */}
                  <div className="flex-center" style={{ 
                    flexDirection: 'column', 
                    padding: '1rem 0.75rem', 
                    background: 'rgba(255,255,255,0.01)', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1px solid var(--border-light)',
                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.01)'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>Overall Score</span>
                    <div style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: `conic-gradient(var(--primary) ${selectedReport.scores.overall * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 0 16px rgba(99, 102, 241, 0.12)'
                    }}>
                      <div style={{
                        width: '62px',
                        height: '62px',
                        borderRadius: '50%',
                        background: 'var(--bg-popover)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.02)'
                      }}>{selectedReport.scores.overall}</div>
                    </div>
                  </div>

                  {/* Radar Chart */}
                  <div style={{ width: '100%', height: '140px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                        <PolarGrid stroke="var(--border-light)" />
                        <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={9} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} fontSize={7} />
                        <Radar name="Scoring" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Subscores Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  {[
                    { name: 'Demand', val: selectedReport.scores.demand },
                    { name: 'Competition', val: selectedReport.scores.competition },
                    { name: 'Scalability', val: selectedReport.scores.scalability },
                    { name: 'Revenue', val: selectedReport.scores.revenuePotential },
                  ].map((sub, i) => (
                    <div key={i} style={{ padding: '0.5rem 0.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase' }}>{sub.name}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{sub.val}</div>
                    </div>
                  ))}
                </div>

                {/* Competitors and Customer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <p><strong>Market Size:</strong> <span style={{ color: '#fff', fontWeight: 500 }}>{selectedReport.marketResearch.marketSize}</span></p>
                  <p><strong>Growth Trend:</strong> <span style={{ color: '#fff', fontWeight: 500 }}>{selectedReport.marketResearch.growthTrends}</span></p>
                  
                  <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                    <table style={{ width: '100%', fontSize: '0.78rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <th style={{ color: 'var(--text-muted)', padding: '0.4rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Competitor</th>
                          <th style={{ color: 'var(--text-muted)', padding: '0.4rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Funding</th>
                          <th style={{ color: 'var(--text-muted)', padding: '0.4rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.competitors.slice(0, 3).map((comp, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.55rem 0.4rem', fontWeight: 600, color: '#fff' }}>{comp.name}</td>
                            <td style={{ padding: '0.55rem 0.4rem' }}>{comp.funding}</td>
                            <td style={{ padding: '0.55rem 0.4rem' }}><span className={`badge ${comp.type === 'Direct' ? 'badge-danger' : 'badge-primary'}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.62rem' }}>{comp.type}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-center" style={{ flexDirection: 'column', flex: 1, gap: '1rem', color: 'var(--text-muted)' }}>
                <Cpu size={42} />
                {loadingReports ? (
                  <span>Loading validation records...</span>
                ) : (
                  <>
                    <p style={{ fontSize: '0.85rem' }}>No validation scans run yet.</p>
                    <button onClick={() => setShowValModal(true)} className="btn btn-outline btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                      Run Your First Scan
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: GPS Roadmap, Runway, and Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* GPS Roadmap & Tasks checklist */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="flex-between">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Compass size={18} style={{ color: 'var(--secondary)', filter: 'drop-shadow(0 0 3px rgba(6,182,212,0.3))' }} /> GPS stage checklist ({profile.stage})
              </h3>
              <button 
                onClick={() => navigate('/roadmap')} 
                className="btn btn-secondary" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', borderRadius: '4px' }}
              >
                Go to GPS
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${dashboardData.roadmapProgress}%`, 
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  boxShadow: '0 0 10px var(--primary)',
                  borderRadius: '9999px'
                }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{dashboardData.roadmapProgress}%</span>
            </div>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {steps.slice(0, 4).map((st, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <input type="checkbox" checked={st.isCompleted} readOnly style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ flex: 1, color: st.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: st.isCompleted ? 'line-through' : 'none', fontWeight: 500 }}>{st.label} Checklist Objective</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>Core</span>
                </div>
              ))}
            </div>
          </div>
 
          {/* Runway Simulator */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--success)', textShadow: '0 0 6px rgba(16,185,129,0.4)' }}>⚡</span> Runway & Burn Simulator
            </h3>
 
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Cash in Bank */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Cash in Bank (USD):</span>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.86rem' }}>${cashInBank.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="500000" 
                  step="5000" 
                  value={cashInBank} 
                  onChange={(e) => setCashInBank(Number(e.target.value))} 
                  className="premium-slider"
                />
              </div>
 
              {/* Monthly Burn */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Monthly Burn:</span>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.86rem' }}>${monthlyBurn.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500" 
                  value={monthlyBurn} 
                  onChange={(e) => setMonthlyBurn(Number(e.target.value))} 
                  className="premium-slider"
                />
              </div>
 
              {/* Monthly Revenue */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Monthly Revenue:</span>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.86rem' }}>${monthlyRevenue.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30000" 
                  step="500" 
                  value={monthlyRevenue} 
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))} 
                  className="premium-slider"
                />
              </div>
 
              {/* Runway Results */}
              <div style={{ 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-light)', 
                padding: '1rem', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.82rem',
                boxShadow: 'inset 0 0 8px rgba(255,255,255,0.01)'
              }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Net Burn Rate:</span>
                  <span style={{ fontWeight: 700, color: monthlyBurn - monthlyRevenue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ${(monthlyBurn - monthlyRevenue).toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Venture Runway:</span>
                  <span style={{ fontWeight: 800, color: monthlyBurn - monthlyRevenue <= 0 ? 'var(--success)' : (cashInBank / (monthlyBurn - monthlyRevenue)) < 6 ? 'var(--danger)' : 'var(--warning)', fontSize: '0.9rem' }}>
                    {monthlyBurn - monthlyRevenue <= 0 ? 'Infinite (Surplus)' : `${(cashInBank / (monthlyBurn - monthlyRevenue)).toFixed(1)} Months`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Next Steps Suggestions */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} /> AI Next Steps Suggestions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {dashboardData.aiSuggestions && dashboardData.aiSuggestions.map((s: any, idx: number) => (
            <div key={idx} style={{ 
              padding: '1rem', 
              background: 'rgba(99,102,241,0.03)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-light)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem' 
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{s.title}</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{s.text}</p>
              <button 
                onClick={() => navigate(s.route)}
                className="btn btn-primary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem', alignSelf: 'flex-start', borderRadius: '4px' }}
              >
                {s.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Mentors and Investors */}
      <div className="grid-2">
        {/* Recommended Mentors */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex-between">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
              <Users size={18} style={{ color: 'var(--secondary)' }} /> Mentor Recommendations
            </h3>
            <button 
              onClick={() => navigate('/mentors')} 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
            >
              All Mentors
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardData.recommendedMentors && dashboardData.recommendedMentors.map((m: any, idx: number) => (
              <div key={m.id || idx} style={{ 
                padding: '0.75rem', 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-light)', 
                borderRadius: '8px', 
                display: 'flex', 
                gap: '0.75rem', 
                alignItems: 'center' 
              }}>
                <img 
                  src={m.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                  alt={m.name} 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{m.role}</span>
                </div>
                <button 
                  onClick={() => navigate('/mentors')}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Investors */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex-between">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
              <DollarSign size={18} style={{ color: 'var(--warning)' }} /> Investor Recommendations
            </h3>
            <button 
              onClick={() => navigate('/investors')} 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
            >
              All Investors
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardData.recommendedInvestors && dashboardData.recommendedInvestors.map((inv: any, idx: number) => (
              <div key={inv.id || idx} style={{ 
                padding: '0.75rem', 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-light)', 
                borderRadius: '8px', 
                display: 'flex', 
                justifyContent: 'between', 
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#fff' }}>{inv.name}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>{inv.type} • Ticket: {inv.ticketSize}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: inv.readinessScore > 75 ? 'var(--success)' : 'var(--warning)', display: 'block' }}>
                    {inv.readinessScore}% Match
                  </span>
                  <a 
                    href={`mailto:${inv.contactEmail}`}
                    style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none', justifyContent: 'flex-end', marginTop: '2px' }}
                  >
                    <Mail size={12} /> Contact
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadlines and Open Roles */}
      <div className="grid-2">
        {/* Funding program deadlines */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
            <Calendar size={18} style={{ color: 'var(--success)' }} /> Upcoming Funding Deadlines
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.78rem', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>Program</th>
                  <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>Amount</th>
                  <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.upcomingDeadlines && dashboardData.upcomingDeadlines.map((d: any, idx: number) => (
                  <tr key={d.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.45rem', fontWeight: 600, color: '#fff' }}>{d.name}</td>
                    <td style={{ padding: '0.45rem' }}>{d.amount}</td>
                    <td style={{ padding: '0.45rem' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>{d.deadline}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Open Opportunities */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex-between">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
              <Briefcase size={18} style={{ color: 'var(--primary)' }} /> Open Opportunities
            </h3>
            <button 
              onClick={() => navigate('/opportunities')} 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
            >
              Board
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dashboardData.openOpportunities && dashboardData.openOpportunities.map((o: any, idx: number) => (
              <div key={o.id || idx} style={{ 
                padding: '0.65rem 0.75rem', 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-light)', 
                borderRadius: '8px', 
                display: 'flex', 
                justifyContent: 'between', 
                alignItems: 'center',
                fontSize: '0.78rem'
              }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: '#fff' }}>{o.title}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{o.startupName} • {o.location}</span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '0.15rem 0.4rem' }}>{o.equity || 'Equity Match'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: AI STARTUP VALIDATION FORM */}
      {showValModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-popover)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={18} style={{ color: 'var(--primary)' }} /> AI Validation Scan
              </h3>
              <button 
                onClick={() => setShowValModal(false)}
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
              >✕</button>
            </div>

            {valLoading ? (
              <div className="flex-center" style={{ flexDirection: 'column', height: '200px', gap: '1rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Scrubbing competitor databases and indexing industry trends...</span>
              </div>
            ) : (
              <form onSubmit={handleValidate}>
                <div className="form-group">
                  <label className="form-label">Startup Idea / Core Concept</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Automated legal contract summarizer for SMEs"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Problem Statement</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Describe what pain you are addressing..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ideal Customer Segment</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Small business owners, freelance creators"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Target Geography</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. India, United States"
                    value={geo}
                    onChange={(e) => setGeo(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Compute Validation Score <Sparkles size={16} style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: AI BUILD ADVISOR */}
      {showBuildModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '620px', background: 'var(--bg-popover)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} style={{ color: 'var(--secondary)' }} /> AI Build Advisor
              </h3>
              <button 
                onClick={() => { setShowBuildModal(false); setBuildResult(null); }}
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
              >✕</button>
            </div>

            {buildLoading ? (
              <div className="flex-center" style={{ flexDirection: 'column', height: '220px', gap: '1rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Synthesizing cost profiles and server node configurations...</span>
              </div>
            ) : !buildResult ? (
              <form onSubmit={handleBuildAdvisor}>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>Choose your startup architecture and let the system calculate the recommended tech stack and phase costing models.</p>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Startup Product Class</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {['SaaS', 'AI Startup', 'Marketplace', 'Mobile App'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setStartupType(t)}
                        className={`btn ${startupType === t ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.75rem 0.25rem', fontSize: '0.8rem' }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                  Generate Stack Profile
                </button>
              </form>
            ) : (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Tech Stack Output */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Recommended Developer Stack</h4>
                  <div className="grid-2" style={{ gap: '0.5rem' }}>
                    {Object.entries(buildResult.stack).map(([layer, tech]) => (
                      <div key={layer} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{layer}</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--secondary)' }}>{tech}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phased Roadmap */}
                <div>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Phased Release Objectives</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {buildResult.phases.map((ph, index) => (
                      <div key={index} style={{ padding: '0.45rem 0.65rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '6px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ph.phase}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({ph.duration})</span>
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{ph.objectives}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Estimator */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <DollarSign size={15} style={{ color: 'var(--success)' }} /> Cost Estimator
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.75rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.35rem' }}>Infrastructure Node</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.35rem' }}>MVP</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.35rem' }}>Growth</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.35rem' }}>Scale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buildResult.costEstimates.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.45rem 0.35rem', fontWeight: 500 }}>{c.item}</td>
                            <td style={{ padding: '0.45rem 0.35rem', color: 'var(--text-secondary)' }}>{c.mvp}</td>
                            <td style={{ padding: '0.45rem 0.35rem', color: 'var(--secondary)' }}>{c.growth}</td>
                            <td style={{ padding: '0.45rem 0.35rem', color: 'var(--success)' }}>{c.scale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => setBuildResult(null)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1 }}
                  >
                    Configure Another
                  </button>
                  <button 
                    onClick={() => { setShowBuildModal(false); setBuildResult(null); }}
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
