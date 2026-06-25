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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Welcome back, {profile.name}</h2>
          <p>Layer 2 Connected Command Center — Orchestrating your startup journey.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowValModal(true)} className="btn btn-primary">
            <Plus size={16} /> Validate Idea
          </button>
          <button onClick={() => setShowBuildModal(true)} className="btn btn-secondary">
            <Layers size={16} /> Build Advisor
          </button>
        </div>
      </div>

      {/* Stepper Card */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
          <Compass size={18} style={{ color: 'var(--primary)' }} /> Founder Journey Stepper
        </h3>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'thin'
        }}>
          {steps.map((st, idx) => (
            <div 
              key={idx} 
              onClick={() => st.action ? st.action() : navigate(st.path)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                cursor: 'pointer',
                opacity: st.isCompleted ? 1 : 0.45,
                transition: 'opacity 0.2s ease',
                minWidth: '90px',
                flexShrink: 0
              }}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: st.isCompleted 
                  ? 'var(--success-glow)' 
                  : 'rgba(255,255,255,0.03)',
                border: st.isCompleted 
                  ? '1px solid var(--success)' 
                  : '1px solid var(--border-light)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: st.isCompleted ? 'var(--success)' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                marginBottom: '0.4rem',
                boxShadow: st.isCompleted ? '0 0 10px rgba(16,185,129,0.2)' : 'none'
              }}>
                {st.isCompleted ? '✓' : idx + 1}
              </div>
              <span style={{ 
                fontSize: '0.66rem', 
                color: 'var(--text-primary)', 
                fontWeight: st.isCompleted ? 600 : 400,
                whiteSpace: 'nowrap',
                maxWidth: '85px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Basic Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '70px', height: '70px',
            background: 'conic-gradient(var(--success) 0deg, transparent 0deg)',
            opacity: 0.05, borderRadius: '50%'
          }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Startup Venture</span>
          <span className="metric-value" style={{ fontSize: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.startupName}</span>
          <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{profile.industry}</span>
        </div>

        <div className="metric-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Current Stage</span>
          <span className="metric-value">{profile.stage}</span>
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
            {['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].map((stg) => (
              <div 
                key={stg} 
                style={{ 
                  flex: 1, 
                  height: '4px', 
                  borderRadius: '2px', 
                  backgroundColor: profile.stage === stg || ['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].indexOf(profile.stage) > ['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].indexOf(stg) 
                    ? 'var(--primary)' 
                    : 'rgba(255,255,255,0.05)' 
                }} 
              />
            ))}
          </div>
        </div>

        <div className="metric-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>AI Validation Reports</span>
          <span className="metric-value">{validationReports.length}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest: {validationReports[0]?.date || 'None'}</span>
        </div>

        <div className="metric-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Venture Health Score</span>
          <span className="metric-value" style={{ color: 'var(--success)' }}>
            {dashboardData.startupHealthScore}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grounded scoring mechanism</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Command Center Gauge & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Health Gauge & Readiness Indicators */}
          <div className="glass-card grid-2" style={{ alignItems: 'center', gap: '1.5rem' }}>
            <div className="flex-center" style={{ flexDirection: 'column', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Health Index</span>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `conic-gradient(var(--success) ${dashboardData.startupHealthScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 0 15px rgba(16,185,129,0.2)'
              }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#fff'
                }}>{dashboardData.startupHealthScore}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={18} style={{ color: 'var(--warning)' }} /> Funding Readiness
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>{dashboardData.fundingReadiness}%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>preparedness index</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                {dashboardData.fundingReadinessReasons && dashboardData.fundingReadinessReasons.slice(0, 3).map((r: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--success)' }}>✓</span> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Validation Explorer */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '400px' }}>
            <div className="flex-between">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} /> AI Validation Scan
              </h3>
              {validationReports.length > 1 && (
                <select 
                  className="form-select" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px' }}
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
                <div>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>Concept scanned:</h4>
                  <p style={{ fontStyle: 'italic', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>"{selectedReport.startupIdea}"</p>
                </div>

                <div className="grid-2" style={{ alignItems: 'center', gap: '1rem' }}>
                  {/* Circular Score Meter */}
                  <div className="flex-center" style={{ flexDirection: 'column', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Validation Score</span>
                    <div style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      background: `conic-gradient(var(--primary) ${selectedReport.scores.overall * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#fff'
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
                  {[
                    { name: 'Demand', val: selectedReport.scores.demand },
                    { name: 'Competition', val: selectedReport.scores.competition },
                    { name: 'Scalability', val: selectedReport.scores.scalability },
                    { name: 'Revenue', val: selectedReport.scores.revenuePotential },
                  ].map((sub, i) => (
                    <div key={i} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{sub.name}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{sub.val}</div>
                    </div>
                  ))}
                </div>

                {/* Competitors and Customer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <p><strong>Market Size:</strong> {selectedReport.marketResearch.marketSize}</p>
                  <p><strong>Growth Trend:</strong> {selectedReport.marketResearch.growthTrends}</p>
                  
                  <div style={{ overflowX: 'auto', marginTop: '0.25rem' }}>
                    <table style={{ width: '100%', fontSize: '0.75rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Competitor</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Funding</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.competitors.slice(0, 3).map((comp, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '0.35rem 0.25rem', fontWeight: 600 }}>{comp.name}</td>
                            <td style={{ padding: '0.35rem 0.25rem' }}>{comp.funding}</td>
                            <td style={{ padding: '0.35rem 0.25rem' }}><span className={`badge ${comp.type === 'Direct' ? 'badge-danger' : 'badge-primary'}`} style={{ padding: '0.1rem 0.3, px', fontSize: '0.6rem' }}>{comp.type}</span></td>
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
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={18} style={{ color: 'var(--secondary)' }} /> GPS stage checklist ({profile.stage})
              </h3>
              <button 
                onClick={() => navigate('/roadmap')} 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', borderRadius: '4px' }}
              >
                Go to GPS
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${dashboardData.roadmapProgress}%`, 
                  background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                  boxShadow: '0 0 8px var(--primary)'
                }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{dashboardData.roadmapProgress}%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {steps.slice(0, 4).map((st, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.4rem 0.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <input type="checkbox" checked={st.isCompleted} disabled style={{ accentColor: 'var(--primary)' }} />
                  <span style={{ flex: 1, color: st.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: st.isCompleted ? 'line-through' : 'none' }}>{st.label} Checklist Objective</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '0.1rem 0.3rem' }}>Core</span>
                </div>
              ))}
            </div>
          </div>

          {/* Runway Simulator */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--success)' }}>⚡</span> Runway & Burn Simulator
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Cash in Bank */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cash in Bank (USD):</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{cashInBank.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="5000" 
                  max="500000" 
                  step="5000" 
                  value={cashInBank} 
                  onChange={(e) => setCashInBank(Number(e.target.value))} 
                  style={{ width: '100%', height: '3px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Monthly Burn */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monthly Burn:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{monthlyBurn.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="50000" 
                  step="500" 
                  value={monthlyBurn} 
                  onChange={(e) => setMonthlyBurn(Number(e.target.value))} 
                  style={{ width: '100%', height: '3px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Monthly Revenue */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div className="flex-between" style={{ fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monthly Revenue:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{monthlyRevenue.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30000" 
                  step="500" 
                  value={monthlyRevenue} 
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))} 
                  style={{ width: '100%', height: '3px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </div>

              {/* Runway Results */}
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-light)', 
                padding: '0.75rem', 
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: '0.78rem'
              }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Net Burn Rate:</span>
                  <span style={{ fontWeight: 600, color: monthlyBurn - monthlyRevenue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {(monthlyBurn - monthlyRevenue).toLocaleString()} / mo
                  </span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Safety safety Runway:</span>
                  <span style={{ fontWeight: 800, color: monthlyBurn - monthlyRevenue <= 0 ? 'var(--success)' : (cashInBank / (monthlyBurn - monthlyRevenue)) < 6 ? 'var(--danger)' : 'var(--warning)' }}>
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
