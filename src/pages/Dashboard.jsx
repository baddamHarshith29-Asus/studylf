import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Cpu, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  Plus, 
  ChevronRight, 
  Info, 
  Layers, 
  DollarSign 
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard({ profile, setProfile, validationReports, setValidationReports, setCurrentPage }) {
  const [showValModal, setShowValModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  
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
  const [selectedReport, setSelectedReport] = useState(validationReports[0] || null);

  // Build Advisor Form State
  const [startupType, setStartupType] = useState('SaaS');
  const [buildLoading, setBuildLoading] = useState(false);
  const [buildResult, setBuildResult] = useState(null);

  // Handler for AI Validation
  const handleValidate = async (e) => {
    e.preventDefault();
    if (!idea) return;
    setValLoading(true);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupIdea: idea, problemStatement: problem, customerSegment: segment, geography: geo })
      });
      const data = await response.json();
      if (data.success) {
        setValidationReports([data.report, ...validationReports]);
        setSelectedReport(data.report);
        
        // Update user profile stage to Validation since they ran validation
        if (profile.stage === 'Idea') {
          updateProfileStage('Validation');
        }
        
        // Clear form
        setIdea('');
        setProblem('');
        setSegment('');
        setGeo('');
        setShowValModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setValLoading(false);
    }
  };

  // Handler for Build Advisor
  const handleBuildAdvisor = async (e) => {
    e.preventDefault();
    setBuildLoading(true);
    try {
      const response = await fetch('/api/build-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupType })
      });
      const data = await response.json();
      if (data.success) {
        setBuildResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBuildLoading(false);
    }
  };

  const updateProfileStage = async (newStage) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format Recharts data
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
          <p>Analyze metrics, validate hypotheses, and pilot your business goals.</p>
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

      {/* Basic Metrics Row */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Startup Venture</span>
          <span className="metric-value" style={{ fontSize: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.startupName}</span>
          <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{profile.industry}</span>
        </div>

        <div className="metric-card">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Current Phase Stage</span>
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
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Workspace Health</span>
          <span className="metric-value" style={{ color: 'var(--success)' }}>
            {selectedReport ? `${selectedReport.scores.overall}%` : '60%'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grounded scoring mechanism</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Side: Dynamic Validation Explorer */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '450px' }}>
          <div className="flex-between">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--primary)' }} /> AI Validation Scan
            </h3>
            {validationReports.length > 1 && (
              <select 
                className="form-select" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '4px' }}
                value={selectedReport?.id}
                onChange={(e) => setSelectedReport(validationReports.find(r => r.id === e.target.value))}
              >
                {validationReports.map(r => (
                  <option key={r.id} value={r.id}>{r.startupIdea.substring(0, 24)}...</option>
                ))}
              </select>
            )}
          </div>

          {selectedReport ? (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Concept scanned:</h4>
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>"{selectedReport.startupIdea}"</p>
              </div>

              <div className="grid-2" style={{ alignItems: 'center' }}>
                {/* Circular Score Meter */}
                <div className="flex-center" style={{ flexDirection: 'column', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overall Score</span>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: `conic-gradient(var(--primary) ${selectedReport.scores.overall * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    boxShadow: '0 0 15px rgba(99,102,241,0.2)'
                  }}>
                    <div style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '50%',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-heading)'
                    }}>{selectedReport.scores.overall}</div>
                  </div>
                </div>

                {/* Radar Chart */}
                <div style={{ width: '100%', height: '160px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="var(--border-light)" />
                      <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} fontSize={8} />
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
                  { name: 'Rev Potential', val: selectedReport.scores.revenuePotential },
                ].map((sub, i) => (
                  <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{sub.name}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sub.val}</div>
                  </div>
                ))}
              </div>

              {/* Competitors and Customer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem' }}>Market research highlights</h4>
                <p style={{ fontSize: '0.85rem' }}><strong>Market Size:</strong> {selectedReport.marketResearch.marketSize}</p>
                <p style={{ fontSize: '0.85rem' }}><strong>Growth Trend:</strong> {selectedReport.marketResearch.growthTrends}</p>
                
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.25rem', marginTop: '0.5rem' }}>Competitor Discovery</h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Name</th>
                        <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Funding</th>
                        <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Pricing</th>
                        <th style={{ color: 'var(--text-secondary)', padding: '0.25rem' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReport.competitors.map((comp, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.4rem 0.25rem', fontWeight: 600 }}>{comp.name}</td>
                          <td style={{ padding: '0.4rem 0.25rem' }}>{comp.funding}</td>
                          <td style={{ padding: '0.4rem 0.25rem' }}>{comp.pricing}</td>
                          <td style={{ padding: '0.4rem 0.25rem' }}><span className={`badge ${comp.type === 'Direct' ? 'badge-danger' : 'badge-primary'}`} style={{ padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>{comp.type}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-center" style={{ flexDirection: 'column', flex: 1, gap: '1rem', color: 'var(--text-muted)' }}>
              <Cpu size={48} />
              <p>No validation scans run yet.</p>
              <button onClick={() => setShowValModal(true)} className="btn btn-outline btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Run Your First Scan
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Startup Profile & Recommended Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Startup Profile Summary Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} style={{ color: 'var(--secondary)' }} /> Startup Profile (Feature 12)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex-between">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Venture Name:</span>
                <span style={{ fontWeight: 600 }}>{profile.startupName}</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Primary Target Sector:</span>
                <span style={{ fontWeight: 600 }}>{profile.industry}</span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Operational HQ:</span>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)' }} /> {profile.country}
                </span>
              </div>
              
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Startup Mission / Description:</span>
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4
                }}>
                  {profile.description || 'No description added yet. Edit profile or upload a pitch deck to sync.'}
                </div>
              </div>

              {/* Stage Progression Editor */}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Quick Phase Management:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].map((stg) => (
                    <button
                      key={stg}
                      onClick={() => updateProfileStage(stg)}
                      className={`btn ${profile.stage === stg ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px' }}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Runway & Burn Simulator (Unique Feature) */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--success)' }}>⚡</span> Cash Runway & Net Burn Simulator
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Simulate monthly cash runway by modeling cash reserves, revenues, and operating expenditures.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Input Slider 1: Cash in Bank */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div className="flex-between" style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cash in Bank (USD/INR):</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cashInBank.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="5000" 
                max="500000" 
                step="5000" 
                value={cashInBank} 
                onChange={(e) => setCashInBank(Number(e.target.value))} 
                style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Input Slider 2: Monthly Operating Expense */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div className="flex-between" style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Operating Expense:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{monthlyBurn.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="500" 
                value={monthlyBurn} 
                onChange={(e) => setMonthlyBurn(Number(e.target.value))} 
                style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Input Slider 3: Monthly Revenue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div className="flex-between" style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Revenue:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{monthlyRevenue.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="30000" 
                step="500" 
                value={monthlyRevenue} 
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))} 
                style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Calculations Breakdown */}
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-light)', 
              padding: '0.85rem', 
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.82rem',
              marginTop: '0.25rem'
            }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Net Burn Rate:</span>
                <span style={{ fontWeight: 600, color: monthlyBurn - monthlyRevenue > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {(monthlyBurn - monthlyRevenue).toLocaleString()} / mo
                </span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Total Runway Safety:</span>
                <span style={{ fontWeight: 800, color: monthlyBurn - monthlyRevenue <= 0 ? 'var(--success)' : (cashInBank / (monthlyBurn - monthlyRevenue)) < 6 ? 'var(--danger)' : 'var(--warning)' }}>
                  {monthlyBurn - monthlyRevenue <= 0 ? 'Infinite (Revenue Surplus)' : `${(cashInBank / (monthlyBurn - monthlyRevenue)).toFixed(1)} Months`}
                </span>
              </div>

              {/* Dynamic Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.25rem' }}>
                <div style={{
                  height: '100%',
                  width: monthlyBurn - monthlyRevenue <= 0 ? '100%' : `${Math.min(100, ((cashInBank / (monthlyBurn - monthlyRevenue)) / 24) * 100)}%`,
                  background: monthlyBurn - monthlyRevenue <= 0 
                    ? 'linear-gradient(90deg, #10B981, #059669)'
                    : (cashInBank / (monthlyBurn - monthlyRevenue)) < 6 
                    ? 'linear-gradient(90deg, #EF4444, #DC2626)' 
                    : (cashInBank / (monthlyBurn - monthlyRevenue)) < 12
                    ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                    : 'linear-gradient(90deg, #6366F1, #06B6D4)',
                  transition: 'width 0.3s ease, background 0.3s ease'
                }} />
              </div>
            </div>

            {/* Dynamic Alert Messages */}
            {monthlyBurn - monthlyRevenue > 0 && (cashInBank / (monthlyBurn - monthlyRevenue)) < 6 ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                lineHeight: 1.4
              }}>
                ⚠️ <strong>CRITICAL RED ZONE:</strong> Your runway is less than 6 months. You must begin pitching warm investors immediately. Visit the <strong>Network Hub</strong> to request introductions.
              </div>
            ) : monthlyBurn - monthlyRevenue > 0 && (cashInBank / (monthlyBurn - monthlyRevenue)) < 12 ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                color: 'var(--warning)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                lineHeight: 1.4
              }}>
                ⚡ <strong>PRE-WARNING ZONE:</strong> Your runway is under 12 months. Start drafting your Sequoia Pitch storyboard in the <strong>Roadmap page</strong> to prepare for seed outreach.
              </div>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                lineHeight: 1.4
              }}>
                ✅ <strong>SAFE RUNWAY ZONE:</strong> Your business has healthy runway safety. Focus on product market fit objectives and MVP development milestones.
              </div>
            )}
          </div>
        </div>

        {/* Recommended Next Actions */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Recommended Actions
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="task-item" style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.03)' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Info size={16} style={{ color: 'var(--primary)', marginTop: '0.1rem' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Validate Startup Concept</h4>
                    <p style={{ fontSize: '0.78rem' }}>Perform AI scans to compute initial demand scoring and pull immediate competitor datasets.</p>
                    <button 
                      onClick={() => setShowValModal(true)} 
                      className="btn" 
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'var(--primary)', color: '#fff', marginTop: '0.4rem', borderRadius: '4px' }}
                    >
                      Scan Idea
                    </button>
                  </div>
                </div>
              </div>

              <div className="task-item" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Info size={16} style={{ color: 'var(--secondary)', marginTop: '0.1rem' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Build Roadmap GPS Checklist</h4>
                    <p style={{ fontSize: '0.78rem' }}>Track week-by-week founder objectives tailored to your current stage: <strong>{profile.stage} Stage</strong>.</p>
                    <button 
                      onClick={() => setCurrentPage('roadmap')}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginTop: '0.4rem', borderRadius: '4px' }}
                    >
                      View Roadmap
                    </button>
                  </div>
                </div>
              </div>

              <div className="task-item" style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Info size={16} style={{ color: 'var(--success)', marginTop: '0.1rem' }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Build Advisor</h4>
                    <p style={{ fontSize: '0.78rem' }}>Generate optimized technical stack advice, project phases, and hosting estimators.</p>
                    <button 
                      onClick={() => setShowBuildModal(true)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', marginTop: '0.4rem', borderRadius: '4px' }}
                    >
                      Consult Advisor
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scrubbing competitor databases and indexing industry trends...</span>
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
                  Compute Validation Score <Sparkles size={16} style={{ marginLeft: '4px' }} />
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
                <Layers size={18} style={{ color: 'var(--secondary)' }} /> AI Build Advisor (Feature 3)
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
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Synthesizing cost profiles and server node configurations...</span>
              </div>
            ) : !buildResult ? (
              <form onSubmit={handleBuildAdvisor}>
                <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem' }}>Choose your startup architecture and let the system calculate the recommended tech stack and phase costing models.</p>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Startup Product Class</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
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
                  Generate Development Stack Profile
                </button>
              </form>
            ) : (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Tech Stack Output */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Recommended Developer Stack</h4>
                  <div className="grid-2" style={{ gap: '0.5rem' }}>
                    {Object.entries(buildResult.stack).map(([layer, tech]) => (
                      <div key={layer} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{layer}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>{tech}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phased Roadmap */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Phased Release Objectives</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {buildResult.phases.map((ph, index) => (
                      <div key={index} style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '6px', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{ph.phase}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({ph.duration})</span>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ph.objectives}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Estimator */}
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <DollarSign size={16} style={{ color: 'var(--success)' }} /> Real-World Infrastructure Cost Estimator
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>Infrastructure Node</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>MVP</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>Growth</th>
                          <th style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}>Scale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {buildResult.costEstimates.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.5rem 0.4rem', fontWeight: 500 }}>{c.item}</td>
                            <td style={{ padding: '0.5rem 0.4rem', color: 'var(--text-secondary)' }}>{c.mvp}</td>
                            <td style={{ padding: '0.5rem 0.4rem', color: 'var(--secondary)' }}>{c.growth}</td>
                            <td style={{ padding: '0.5rem 0.4rem', color: 'var(--success)' }}>{c.scale}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>* Estimates pull from standard Vercel, Render, AWS, and Gemini API pricing rates.</p>
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

// Sparkles Helper Icon
function Sparkles({ size = 16, style = {} }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/>
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
    </svg>
  );
}
