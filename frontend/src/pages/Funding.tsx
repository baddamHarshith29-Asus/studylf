import React, { useState, useEffect } from 'react';
import { Search, Check, X, BookmarkPlus, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface FundingScheme {
  id: string;
  name: string;
  provider: string;
  type: string;
  description: string;
  amount: string;
  equity: string;
  deadline: string;
  stages: string[];
  countries: string[];
  industries: string[];
}

interface Application {
  id: string;
  appliedDate: string;
  status: 'Applied' | 'Under Review' | 'Accepted' | 'Rejected';
  notes: string;
  scheme?: FundingScheme;
}

interface RadarItem {
  id: string;
  type: string;
  date: string;
  title: string;
  desc: string;
}

export default function Funding() {
  const { profile } = useAuth();
  const [schemes, setSchemes] = useState<FundingScheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [radarItems, setRadarItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState<'navigator' | 'dilution' | 'calendar'>('navigator');

  // Reminders state
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('grant-reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleReminder = (schemeId: string, schemeName: string, daysRemaining: number) => {
    let updated;
    if (reminders.includes(schemeId)) {
      updated = reminders.filter(id => id !== schemeId);
      showToast(`Reminder removed for ${schemeName}.`, 'info');
    } else {
      updated = [...reminders, schemeId];
      showToast(`Reminder set for ${schemeName}! We will alert you ${daysRemaining <= 7 ? 'immediately' : '7 days'} before closing.`, 'success');
    }
    setReminders(updated);
    localStorage.setItem('grant-reminders', JSON.stringify(updated));
  };

  const getDaysRemaining = (deadlineStr: string) => {
    if (!deadlineStr || deadlineStr === 'Rolling') return 999;
    try {
      const deadline = new Date(deadlineStr);
      const now = new Date();
      deadline.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  // Dilution Simulator State
  const [preMoneyVal, setPreMoneyVal] = useState(5000000);
  const [raiseAmount, setRaiseAmount] = useState(1000000);
  const [optionPoolExpansion, setOptionPoolExpansion] = useState(10);
  const [founder1Allocation, setFounder1Allocation] = useState(60);
  const [founder2Allocation, setFounder2Allocation] = useState(40);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState<FundingScheme | null>(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    fetchFundingData();
  }, []);

  const fetchFundingData = async () => {
    setLoading(true);
    try {
      const [schRes, appRes, radRes] = await Promise.all([
        apiFetch('/api/funding/schemes'),
        apiFetch('/api/funding/applications'),
        apiFetch('/api/radar')
      ]);
      if (schRes.ok) setSchemes(await schRes.json());
      if (appRes.ok) setApplications(await appRes.json());
      if (radRes.ok) setRadarItems(await radRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (schemeId: string) => {
    setApplyLoading(true);
    try {
      const response = await apiFetch('/api/funding/apply', {
        method: 'POST',
        body: JSON.stringify({ schemeId, notes: applyNotes })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Application added to your tracker successfully!', 'success');
        setSelectedScheme(null);
        setApplyNotes('');
        // Refresh tracker
        const appRes = await apiFetch('/api/funding/applications');
        if (appRes.ok) {
          setApplications(await appRes.json());
        }
      } else {
        showToast(data.error || 'Failed to record application.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error recording application.', 'error');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const response = await apiFetch('/api/funding/update-status', {
        method: 'POST',
        body: JSON.stringify({ id: appId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus as any } : app));
        showToast(`Application status updated to ${newStatus}!`, 'success');
      } else {
        showToast(data.error || 'Failed to update status.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error updating status.', 'error');
    }
  };

  // Eligibility checker logic
  const checkEligibility = (scheme: FundingScheme) => {
    const isStageEligible = scheme.stages.includes('Any') || scheme.stages.includes(profile.stage);
    const isCountryEligible = scheme.countries.includes('Any') || scheme.countries.includes(profile.country);
    
    let isSectorEligible = true;
    if (!scheme.industries.includes('Any')) {
      isSectorEligible = scheme.industries.some(ind => profile.industry.toLowerCase().includes(ind.toLowerCase()));
    }

    const fails: string[] = [];
    if (!isStageEligible) fails.push(`Venture stage must be in: ${scheme.stages.join(', ')}`);
    if (!isCountryEligible) fails.push(`Location restricted to: ${scheme.countries.join(', ')}`);
    if (!isSectorEligible) fails.push(`Target sector restricted to: ${scheme.industries.join(', ')}`);

    return {
      eligible: fails.length === 0,
      fails,
      checks: {
        stage: isStageEligible,
        country: isCountryEligible,
        sector: isSectorEligible
      }
    };
  };

  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.provider.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Dilution calculations
  const totalPostRoundVal = preMoneyVal + raiseAmount;
  const newInvestorPct = (raiseAmount / totalPostRoundVal) * 100;
  const founderRemainingPct = 100 - newInvestorPct - optionPoolExpansion;
  
  const founder1Pct = founderRemainingPct * (founder1Allocation / (founder1Allocation + founder2Allocation || 1));
  const founder2Pct = founderRemainingPct * (founder2Allocation / (founder1Allocation + founder2Allocation || 1));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Funding Navigator & Opportunity Radar</h2>
          <p>Discover verified government programs, grants, accelerators, and track applications.</p>
        </div>
      </div>

      {/* Sub tabs headers */}
      <div className="tabs-header" style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('navigator')} 
          className={`tab-btn ${activeSubTab === 'navigator' ? 'active' : ''}`}
        >
          Funding Navigator & Radar
        </button>
        <button 
          onClick={() => setActiveSubTab('dilution')} 
          className={`tab-btn ${activeSubTab === 'dilution' ? 'active' : ''}`}
        >
          Equity Dilution Simulator
        </button>
        <button 
          onClick={() => setActiveSubTab('calendar')} 
          className={`tab-btn ${activeSubTab === 'calendar' ? 'active' : ''}`}
        >
          Grant Deadline Calendar
        </button>
      </div>

      {activeSubTab === 'navigator' && (
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          
          {/* Left Column: Navigator & Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Applications Tracker */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3>📁 Application Tracker</h3>
              
              {applications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No active applications tracked yet. Click "Apply / Track" on matching schemes below.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Program Name</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Applied Date</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Status Tracker</th>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{app.scheme?.name || 'Unknown Scheme'}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>{app.appliedDate}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <select
                              className="form-select"
                              style={{ 
                                padding: '0.2rem 0.4rem', 
                                fontSize: '0.75rem', 
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)',
                                background: app.status === 'Accepted' ? 'rgba(16, 185, 129, 0.1)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                color: app.status === 'Accepted' ? '#10B981' : app.status === 'Rejected' ? '#EF4444' : '#6366F1'
                              }}
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{app.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Scheme Navigator Search */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="flex-between">
                <h3>🔍 Program Finder</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    className="form-select" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All Types</option>
                    <option value="Grant / Debt">Grants / Debts</option>
                    <option value="Accelerator">Accelerators</option>
                    <option value="Accelerator / Grant">Accelerator Grants</option>
                    <option value="Credits">Cloud Credits</option>
                  </select>
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search programs by name, provider, or keyword..." 
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>

              {loading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                  <div className="pulse-loader">
                    <div className="pulse-bubble" />
                    <div className="pulse-bubble" />
                    <div className="pulse-bubble" />
                  </div>
                </div>
              ) : filteredSchemes.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No schemes match your filter query.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {filteredSchemes.map((scheme) => {
                    const eligibility = checkEligibility(scheme);
                    return (
                      <div 
                        key={scheme.id} 
                        className="task-item" 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '0.75rem', 
                          background: 'rgba(255,255,255,0.01)',
                          borderColor: eligibility.eligible ? 'var(--border-light)' : 'rgba(239, 68, 68, 0.1)'
                        }}
                      >
                        <div className="flex-between" style={{ width: '100%' }}>
                          <div>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>{scheme.name}</h4>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Provided by {scheme.provider}</span>
                          </div>
                          <span className="badge badge-primary">{scheme.type}</span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{scheme.description}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Support Amount:</span>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{scheme.amount}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Equity Terms:</span>
                            <span style={{ fontWeight: 600, color: '#fff' }}>{scheme.equity}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Application Deadline:</span>
                            <span style={{ fontWeight: 600, color: 'var(--warning)' }}>{scheme.deadline}</span>
                          </div>
                        </div>

                        {/* Eligibility Checklist */}
                        <div style={{ 
                          borderTop: '1px solid rgba(255,255,255,0.05)', 
                          paddingTop: '0.75rem', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: eligibility.checks.stage ? 'var(--success)' : 'var(--danger)' }}>
                              {eligibility.checks.stage ? <Check size={12} /> : <X size={12} />} Stage Fit
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: eligibility.checks.country ? 'var(--success)' : 'var(--danger)' }}>
                              {eligibility.checks.country ? <Check size={12} /> : <X size={12} />} Location Fit
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: eligibility.checks.sector ? 'var(--success)' : 'var(--danger)' }}>
                              {eligibility.checks.sector ? <Check size={12} /> : <X size={12} />} Sector Fit
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {!eligibility.eligible && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>Ineligible based on profile</span>
                            )}
                            <button 
                              onClick={() => setSelectedScheme(scheme)} 
                              className="btn" 
                              style={{ 
                                padding: '0.35rem 0.75rem', 
                                fontSize: '0.75rem', 
                                borderRadius: '4px',
                                background: eligibility.eligible ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: eligibility.eligible ? '#fff' : 'var(--text-muted)',
                                border: '1px solid var(--border-light)'
                              }}
                            >
                              Apply / Track
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Opportunity Radar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={18} style={{ color: 'var(--secondary)' }} /> Opportunity Radar
              </h3>
              <p style={{ fontSize: '0.78rem' }}>Live index updates of ecosystem grants, trending sectors, and market developments.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '1px solid var(--border-light)', paddingLeft: '1rem', marginLeft: '0.25rem' }}>
                {radarItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', position: 'relative' }}>
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-21px',
                      top: '4px',
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: item.type === 'Grant Deadline' ? 'var(--warning)' : 'var(--secondary)',
                      border: '2px solid var(--bg-card)'
                    }} />
                    
                    <div className="flex-between" style={{ fontSize: '0.72rem' }}>
                      <span className="badge" style={{ padding: '0.1rem 0.4rem', fontSize: '0.62rem', background: item.type === 'Grant Deadline' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(6, 182, 212, 0.1)', color: item.type === 'Grant Deadline' ? 'var(--warning)' : 'var(--secondary)' }}>{item.type}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.date}</span>
                    </div>
                    
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ 
                marginTop: 'auto', 
                padding: '0.75rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
              }}>
                ✨ Sourced independently via verified incubator updates.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'dilution' && (
        /* Equity Dilution Simulator Panel (Unique Feature) */
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          
          {/* Left Column: Dilution Calculator Sliders & Tables */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3>📊 Equity Dilution Simulator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Model your future seed round funding dilution. Move sliders to simulate how new capital investment and option pool allocations impact your ownership.
            </p>

            <div className="grid-2" style={{ gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Pre-Money Valuation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Pre-Money Valuation:</span>
                    <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>${preMoneyVal.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="500000" 
                    max="15000000" 
                    step="100000" 
                    value={preMoneyVal} 
                    onChange={(e) => setPreMoneyVal(Number(e.target.value))} 
                    style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>$500K</span>
                    <span>$15M</span>
                  </div>
                </div>

                {/* Target Raise Size */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Target Capital Raise:</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>${raiseAmount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="50000" 
                    max="5000000" 
                    step="2500" 
                    value={raiseAmount} 
                    onChange={(e) => setRaiseAmount(Number(e.target.value))} 
                    style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>$50K</span>
                    <span>$5M</span>
                  </div>
                </div>

                {/* Option Pool Expansion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Post-Money Option Pool Size:</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>{optionPoolExpansion}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="25" 
                    step="1" 
                    value={optionPoolExpansion} 
                    onChange={(e) => setOptionPoolExpansion(Number(e.target.value))} 
                    style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>0% (None)</span>
                    <span>25% Max</span>
                  </div>
                </div>

              </div>

              {/* Founder Allocations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.88rem', color: '#fff' }}>Co-founder Equity Share Ratio:</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Founder A Ownership Share:</span>
                    <span style={{ fontWeight: 600 }}>{founder1Allocation}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1" 
                    value={founder1Allocation} 
                    onChange={(e) => {
                      setFounder1Allocation(Number(e.target.value));
                      setFounder2Allocation(100 - Number(e.target.value));
                    }} 
                    style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="flex-between" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Founder B Ownership Share:</span>
                    <span style={{ fontWeight: 600 }}>{founder2Allocation}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="1" 
                    value={founder2Allocation} 
                    onChange={(e) => {
                      setFounder2Allocation(Number(e.target.value));
                      setFounder1Allocation(100 - Number(e.target.value));
                    }} 
                    style={{ width: '100%', height: '4px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div style={{ 
                  padding: '0.5rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-light)', 
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.3
                }}>
                  💡 Adjust initial co-founder ratio splits. These will automatically dilute proportionally to fit new capital and options pools.
                </div>
              </div>
            </div>

            {/* dilutive allocations table */}
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '0.5rem' }}>Dilutive Allocations Breakdown:</h4>
              <table style={{ width: '100%', fontSize: '0.82rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>Stakeholder Group</th>
                    <th style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>Pre-Round %</th>
                    <th style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>Post-Round %</th>
                    <th style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>Dilutive Shift</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>Founder A</td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--text-secondary)' }}>{founder1Allocation}%</td>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {founder1Pct.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--danger)' }}>
                      -{(founder1Allocation - founder1Pct).toFixed(1)}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>Founder B</td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--text-secondary)' }}>{founder2Allocation}%</td>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {founder2Pct.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--danger)' }}>
                      -{(founder2Allocation - founder2Pct).toFixed(1)}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>Option Pool</td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--text-secondary)' }}>0.0%</td>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600, color: 'var(--success)' }}>{optionPoolExpansion.toFixed(1)}%</td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--success)' }}>+{optionPoolExpansion.toFixed(1)}%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>New Investors</td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--text-secondary)' }}>0.0%</td>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {newInvestorPct.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--success)' }}>
                      +{newInvestorPct.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Right Column: Capitalization visual and metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>📈 Post-Round Cap Table</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Post-Money Valuation:</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>${totalPostRoundVal.toLocaleString()}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Ownership Diluted:</span>
                  <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                    {(newInvestorPct + optionPoolExpansion).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Visualized ownership blocks stacked bar */}
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Equity Distribution:</span>
                <div style={{ width: '100%', height: '36px', borderRadius: '8px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-light)' }}>
                  
                  {/* Founder A block */}
                  <div style={{
                    width: `${founder1Pct}%`,
                    background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} title="Founder A" />

                  {/* Founder B block */}
                  <div style={{
                    width: `${founder2Pct}%`,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} title="Founder B" />

                  {/* Option Pool block */}
                  <div style={{
                    width: `${optionPoolExpansion}%`,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} title="Option Pool" />

                  {/* Investors block */}
                  <div style={{
                    width: `${newInvestorPct}%`,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} title="Investors" />

                </div>

                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.72rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Founder A Post-Round ({founder1Pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#06b6d4', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Founder B Post-Round ({founder2Pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Option Pool Share ({optionPoolExpansion.toFixed(1)}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>New Seed Investors ({newInvestorPct.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Dynamic Warnings and advice boxes */}
            {(newInvestorPct + optionPoolExpansion) > 30 ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                lineHeight: 1.4
              }}>
                ⚠️ <strong>HIGH DILUTION WARNING:</strong> You are diluting <strong>{((newInvestorPct) + optionPoolExpansion).toFixed(1)}%</strong> in this single round. Diluting over 30% makes it difficult for founders to retain majority control in future Series A/B rounds. Consider raising less capital or increasing your pre-money valuation targets.
              </div>
            ) : optionPoolExpansion < 10 ? (
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.15)',
                color: 'var(--warning)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                lineHeight: 1.4
              }}>
                💡 <strong>OPTION POOL ADVICE:</strong> Your post-round option pool is only <strong>{optionPoolExpansion}%</strong>. Institutional investors typically expect a 10% to 15% ESOP pool to recruit top engineering and sales leadership talent post-funding.
              </div>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                lineHeight: 1.4
              }}>
                ✅ <strong>BALANCED CAPITAL ROUND:</strong> This round creates a healthy cap structure. Dilution is under 30%, leaving founders highly motivated and leaving ample equity runway for subsequent Series A rounds.
              </div>
            )}

          </div>

        </div>
      )}

      {activeSubTab === 'calendar' && (
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          {/* Calendar Grid & List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3>📅 Program Deadlines Calendar</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Track application close dates for active grants and accelerators. Enable reminders to receive alerts.
            </p>
            
            {/* Simple Grid Calendar UI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>{d}</div>
                ))}
                {/* Seed a mock calendar month representation */}
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  return (
                    <div key={dayNum} style={{
                      minHeight: '48px',
                      padding: '4px',
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.03)',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayNum}</span>
                      {dayNum === 15 && (
                        <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.2rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '2px', border: '1px solid rgba(239, 68, 68, 0.2)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title="YC closes">YC Closes</span>
                      )}
                      {dayNum === 30 && (
                        <span style={{ fontSize: '0.55rem', padding: '0.1rem 0.2rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '2px', border: '1px solid rgba(245, 158, 11, 0.2)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title="SISFS closes">SISFS Closes</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* List of Deadlines with countdown and reminder button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Active Countdown Alerts</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {schemes.filter(s => s.deadline && s.deadline !== 'Rolling').map(scheme => {
                  const days = getDaysRemaining(scheme.deadline);
                  const hasReminder = reminders.includes(scheme.id);
                  
                  return (
                    <div key={scheme.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{scheme.name}</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Provided by {scheme.provider}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          {days > 0 ? (
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: days <= 15 ? 'var(--danger)' : 'var(--warning)' }}>
                              Closes in {days} days
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                              Closed
                            </span>
                          )}
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Deadline: {scheme.deadline}</span>
                        </div>
                        
                        <button 
                          onClick={() => toggleReminder(scheme.id, scheme.name, days)}
                          className={`btn ${hasReminder ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', borderRadius: '6px' }}
                        >
                          {hasReminder ? '🔔 Reminder Set' : '🔕 Set Reminder'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Right Column: Reminder Subscriptions list */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3>🔔 Active Reminder Notifications</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>You will receive email notifications and browser alerts before these deadlines close.</p>
            
            {reminders.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.4rem', padding: '2rem 1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '1.5rem' }}>🔕</span>
                <p style={{ fontSize: '0.75rem' }}>No reminders configured yet. Click "Set Reminder" on any upcoming program.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reminders.map(rid => {
                  const scheme = schemes.find(s => s.id === rid);
                  if (!scheme) return null;
                  const days = getDaysRemaining(scheme.deadline);
                  return (
                    <div key={rid} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scheme.name}</h5>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Closing in {days} days</span>
                      </div>
                      <button 
                        onClick={() => toggleReminder(scheme.id, scheme.name, days)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '0.5rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Track Application Popup Drawer */}
      {selectedScheme && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '460px', background: 'var(--bg-popover)' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookmarkPlus size={18} style={{ color: 'var(--primary)' }} /> Track New Application
              </h3>
              <button 
                onClick={() => { setSelectedScheme(null); setApplyNotes(''); }}
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
              >✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff' }}>{selectedScheme.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedScheme.provider}</p>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Application Notes (Optional)</label>
              <textarea 
                className="form-textarea" 
                placeholder="e.g. Registered on Startup India portal. Preparing core pitch slides."
                value={applyNotes}
                onChange={(e) => setApplyNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => { setSelectedScheme(null); setApplyNotes(''); }} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleApply(selectedScheme.id)}
                disabled={applyLoading}
                className="btn btn-primary" 
                style={{ flex: 2 }}
              >
                {applyLoading ? 'Recording...' : 'Add to Application List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
