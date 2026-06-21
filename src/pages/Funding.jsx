import React, { useState, useEffect } from 'react';
import { Coins, Filter, Search, Award, Activity, Check, X, BookmarkPlus, Calendar, ArrowUpRight } from 'lucide-react';
import { showToast } from '../components/Toast';

export default function Funding({ profile }) {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [radarItems, setRadarItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState('navigator');

  // Dilution Simulator State
  const [preMoneyVal, setPreMoneyVal] = useState(5000000);
  const [raiseAmount, setRaiseAmount] = useState(1000000);
  const [optionPoolExpansion, setOptionPoolExpansion] = useState(10);
  const [founder1Allocation, setFounder1Allocation] = useState(60);
  const [founder2Allocation, setFounder2Allocation] = useState(40);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    fetchFundingData();
  }, []);

  const fetchFundingData = async () => {
    setLoading(true);
    try {
      const [schRes, appRes, radRes] = await Promise.all([
        fetch('/api/funding/schemes'),
        fetch('/api/funding/applications'),
        fetch('/api/radar')
      ]);
      const schData = await schRes.json();
      const appData = await appRes.json();
      const radData = await radRes.json();
      setSchemes(schData);
      setApplications(appData);
      setRadarItems(radData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (schemeId) => {
    setApplyLoading(true);
    try {
      const response = await fetch('/api/funding/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId, notes: applyNotes })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Application added to your tracker successfully!', 'success');
        setSelectedScheme(null);
        setApplyNotes('');
        // Refresh tracker
        const appRes = await fetch('/api/funding/applications');
        const appData = await appRes.json();
        setApplications(appData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const response = await fetch('/api/funding/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setApplications(applications.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Eligibility checker logic
  const checkEligibility = (scheme) => {
    const isStageEligible = scheme.stages.includes('Any') || scheme.stages.includes(profile.stage);
    const isCountryEligible = scheme.countries.includes('Any') || scheme.countries.includes(profile.country);
    
    // Clean tags
    let isSectorEligible = true;
    if (!scheme.industries.includes('Any')) {
      const matches = scheme.industries.some(ind => profile.industry.toLowerCase().includes(ind.toLowerCase()));
      isSectorEligible = matches;
    }

    const fails = [];
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
      </div>

      {activeSubTab === 'navigator' ? (
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
                                background: app.status === 'Accepted' ? 'var(--success-glow)' : app.status === 'Rejected' ? 'var(--danger-glow)' : 'var(--primary-glow)',
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

                        {/* Transparent Eligibility Checklist */}
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
                      <span className="badge" style={{ padding: '0.1rem 0.4rem', fontSize: '0.62rem', background: item.type === 'Grant Deadline' ? 'var(--warning-glow)' : 'var(--secondary-glow)', color: item.type === 'Grant Deadline' ? 'var(--warning)' : 'var(--secondary)' }}>{item.type}</span>
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
      ) : (
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
                      {((100 - (raiseAmount / (preMoneyVal + raiseAmount) * 100) - optionPoolExpansion) * (founder1Allocation / (founder1Allocation + founder2Allocation || 1))).toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--danger)' }}>
                      -{((founder1Allocation) - ((100 - (raiseAmount / (preMoneyVal + raiseAmount) * 100) - optionPoolExpansion) * (founder1Allocation / (founder1Allocation + founder2Allocation || 1)))).toFixed(1)}%
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600 }}>Founder B</td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--text-secondary)' }}>{founder2Allocation}%</td>
                    <td style={{ padding: '0.5rem 0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {((100 - (raiseAmount / (preMoneyVal + raiseAmount) * 100) - optionPoolExpansion) * (founder2Allocation / (founder1Allocation + founder2Allocation || 1))).toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--danger)' }}>
                      -{((founder2Allocation) - ((100 - (raiseAmount / (preMoneyVal + raiseAmount) * 100) - optionPoolExpansion) * (founder2Allocation / (founder1Allocation + founder2Allocation || 1)))).toFixed(1)}%
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
                      {((raiseAmount / (preMoneyVal + raiseAmount)) * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', color: 'var(--success)' }}>
                      +{((raiseAmount / (preMoneyVal + raiseAmount)) * 100).toFixed(1)}%
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
                  <span style={{ fontWeight: 600, color: '#fff' }}>${(preMoneyVal + raiseAmount).toLocaleString()}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Total Ownership Diluted:</span>
                  <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                    {(((raiseAmount / (preMoneyVal + raiseAmount)) * 100) + optionPoolExpansion).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Visualized ownership blocks stacked bar */}
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Equity Distribution:</span>
                <div style={{ width: '100%', height: '36px', borderRadius: '8px', overflow: 'hidden', display: 'flex', border: '1px solid var(--border-light)' }}>
                  
                  {/* Founder A block */}
                  <div style={{
                    width: `${((100 - (raiseAmount / (preMoneyVal + raiseAmount) * 100) - optionPoolExpansion) * (founder1Allocation / (founder1Allocation + founder2Allocation || 1)))}%`,
                    background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} title="Founder A" />

                  {/* Founder B block */}
                  <div style={{
                    width: `${((100 - (raiseAmount / (preMoneyVal + raiseAmount) * 100) - optionPoolExpansion) * (founder2Allocation / (founder1Allocation + founder2Allocation || 1)))}%`,
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
                    width: `${((raiseAmount / (preMoneyVal + raiseAmount)) * 100)}%`,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} title="Investors" />

                </div>

                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.72rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Founder A Post-Round</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#06b6d4', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Founder B Post-Round</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Option Pool Share</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>New Seed Investors</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Dynamic Warnings and advice boxes */}
            {((raiseAmount / (preMoneyVal + raiseAmount) * 100) + optionPoolExpansion) > 30 ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                lineHeight: 1.4
              }}>
                ⚠️ <strong>HIGH DILUTION WARNING:</strong> You are diluting <strong>{(((raiseAmount / (preMoneyVal + raiseAmount)) * 100) + optionPoolExpansion).toFixed(1)}%</strong> in this single round. Diluting over 30% makes it difficult for founders to retain majority control in future Series A/B rounds. Consider raising less capital or increasing your pre-money valuation targets.
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
