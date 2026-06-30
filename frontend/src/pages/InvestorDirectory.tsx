import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { Search, Mail, Coins } from 'lucide-react';

interface Investor {
  id: string;
  name: string;
  type: string;
  ticketSize: string;
  geography: string;
  sectors: string[];
  stages: string[];
  readinessScore: number;
  matchReason: string;
  contactEmail: string;
  readinessBreakdown?: {
    team: number;
    product: number;
    market: number;
    traction: number;
  };
}

export default function InvestorDirectory() {
  const { profile } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pitchInvestor, setPitchInvestor] = useState<Investor | null>(null);
  const [pitchEmailText, setPitchEmailText] = useState('');

  // Overriding Outreach Configuration State
  const [selectedIndustry, setSelectedIndustry] = useState(profile.industry || 'AI & SaaS');
  const [selectedStage, setSelectedStage] = useState(profile.stage || 'Idea');
  const [selectedRevenue, setSelectedRevenue] = useState(profile.annualRevenue || 'Pre-revenue');

  const generatePitchDraft = (investor: Investor) => {
    return `Subject: Introduction: ${profile.startupName || 'Our Startup'} - Stage: ${selectedStage} stage fit

Hi ${investor.name.split(' ')[0] || 'Team'},

I noticed that you invest in early-stage ${investor.sectors.join(', ')} startups with check sizes of ${investor.ticketSize}, focusing on ${investor.geography}. 

Our startup, ${profile.startupName || 'Studlyf Venture'}, is building in the ${selectedIndustry} sector. Here is a brief overview:
"${profile.description || 'Describe startup value proposition.'}"

We are currently at the ${selectedStage} stage with a revenue profile of ${selectedRevenue} and would love to share our pitch outline with you. 

Do you have 10 minutes for a brief call next Tuesday or Thursday afternoon?

Best regards,
${profile.name}
Founder, ${profile.startupName}`;
  };

  const openPitchAssistant = (inv: Investor) => {
    setPitchInvestor(inv);
    setPitchEmailText(generatePitchDraft(inv));
  };

  useEffect(() => {
    fetchInvestors(selectedIndustry, selectedStage, selectedRevenue);
  }, [selectedIndustry, selectedStage, selectedRevenue]);

  const fetchInvestors = async (industry: string, stage: string, revenue: string) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        industry,
        stage,
        revenue
      }).toString();
      const res = await apiFetch(`/api/network/investors?${queryParams}`);
      if (res.ok) {
        setInvestors(await res.json());
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading investor listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestors = investors.filter((inv) => {
    return (
      inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.sectors.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      inv.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Extract general readiness scores from first listing (representing the current startup profile context)
  const currentReadiness = investors[0]?.readinessBreakdown || {
    team: 50,
    product: 40,
    market: 50,
    traction: 30
  };

  const overallReadinessAvg = Math.round((currentReadiness.team + currentReadiness.product + currentReadiness.market + currentReadiness.traction) / 4);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Venture Capital Discovery</h2>
          <p>Explore matching angel networks, VC partners, and startup grant providers calculated using your company stage and sector.</p>
        </div>
      </div>

      {/* Startup Fundraising Readiness Scorecard */}
      <div className="glass-card slide-up" style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'center' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 0.5rem 0' }}>
            📊 General Fundraising Readiness Scorecard
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            This card rates your venture's compliance for seed/angel checks across the four core investment pillars. Add legal entity configuration and complete validation roadmaps to improve scores.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overall Readiness Rank:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: overallReadinessAvg > 70 ? 'var(--success)' : 'var(--warning)' }}>{overallReadinessAvg}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${overallReadinessAvg}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)' }} />
          </div>
        </div>
      </div>

      {/* Outreach Override Control Panel */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '1.25rem' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Industry Focus</label>
          <select className="form-select" value={selectedIndustry} onChange={(e) => setSelectedIndustry(e.target.value)}>
            <option value="AI & SaaS">AI & SaaS</option>
            <option value="Fintech">Fintech</option>
            <option value="Healthtech">Healthtech</option>
            <option value="Edtech">Edtech</option>
            <option value="Deep Tech">Deep Tech</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Venture Stage</label>
          <select className="form-select" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
            <option value="Idea">Idea Stage</option>
            <option value="Validation">Validation Stage</option>
            <option value="MVP">MVP Phase</option>
            <option value="Revenue">Early Revenue</option>
            <option value="Fundraising">Fundraising Round</option>
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Annual Revenue Profile</label>
          <select className="form-select" value={selectedRevenue} onChange={(e) => setSelectedRevenue(e.target.value)}>
            <option value="Pre-revenue">Pre-revenue</option>
            <option value="< $10k ARR">&lt; $10k ARR</option>
            <option value="$10k - $50k ARR">$10k - $50k ARR</option>
            <option value="$50k - $100k ARR">$50k - $100k ARR</option>
            <option value="> $100k ARR">&gt; $100k ARR</option>
          </select>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search investors by firm name, vertical focus (e.g. Fintech, B2B, AI)..."
          style={{ width: '100%', paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
      </div>

      {/* List Grid */}
      {loading ? (
        <div className="flex-center" style={{ padding: '3rem' }}>
          <div className="pulse-loader"><div className="pulse-bubble" /></div>
        </div>
      ) : filteredInvestors.length === 0 ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
          <Coins size={36} />
          <p>No investors found matching the search criteria.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredInvestors.map((inv) => {
            const score = inv.readinessScore;

            return (
              <div key={inv.id} className="glass-card animate-glow" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex-between">
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{inv.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{inv.type}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Match Rate</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: score > 75 ? 'var(--success)' : 'var(--warning)' }}>
                      {score}%
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{inv.matchReason}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem', background: 'rgba(255,255,255,0.01)', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Ticket Size:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{inv.ticketSize}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Geography:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{inv.geography}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                  {inv.sectors.map((sec, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{sec}</span>
                  ))}
                </div>

                {/* Specific Fundraising Readiness Scorecard inside Card */}
                {inv.readinessBreakdown && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fundraising Readiness Breakdown:</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem 1rem', fontSize: '0.72rem' }}>
                      <div>
                        <div className="flex-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Team Score:</span>
                          <span style={{ fontWeight: 600 }}>{inv.readinessBreakdown.team}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${inv.readinessBreakdown.team}%`, height: '100%', background: 'var(--primary)' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Product Score:</span>
                          <span style={{ fontWeight: 600 }}>{inv.readinessBreakdown.product}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${inv.readinessBreakdown.product}%`, height: '100%', background: 'var(--secondary)' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Market Fit:</span>
                          <span style={{ fontWeight: 600 }}>{inv.readinessBreakdown.market}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${inv.readinessBreakdown.market}%`, height: '100%', background: 'var(--success)' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex-between">
                          <span style={{ color: 'var(--text-secondary)' }}>Traction Score:</span>
                          <span style={{ fontWeight: 600 }}>{inv.readinessBreakdown.traction}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${inv.readinessBreakdown.traction}%`, height: '100%', background: 'var(--warning)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', marginTop: 'auto' }}>
                  <button 
                    onClick={() => openPitchAssistant(inv)}
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Mail size={14} /> Request Pitch Intro
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pitchInvestor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-popover)', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Mail size={18} style={{ color: 'var(--secondary)' }} /> Pitch Draft Assistant
              </h3>
              <button onClick={() => setPitchInvestor(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Personalized cold outreach email draft for <strong>{pitchInvestor.name}</strong> matching their vertical preference.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <textarea 
                className="form-textarea" 
                style={{ width: '100%', minHeight: '260px', padding: '0.75rem', fontSize: '0.85rem', lineHeight: 1.45, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)' }}
                value={pitchEmailText} 
                onChange={(e) => setPitchEmailText(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pitchEmailText);
                  showToast('Pitch email copied to clipboard!', 'success');
                }}
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Copy to Clipboard
              </button>
              <a 
                href={`mailto:${pitchInvestor.contactEmail}?subject=${encodeURIComponent(`Introduction: ${profile.startupName || 'Our Startup'}`)}&body=${encodeURIComponent(pitchEmailText)}`}
                className="btn btn-primary" 
                style={{ flex: 1, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setPitchInvestor(null)}
              >
                Open Mail App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
