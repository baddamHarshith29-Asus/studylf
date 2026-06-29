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
}

export default function InvestorDirectory() {
  const { profile } = useAuth();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pitchInvestor, setPitchInvestor] = useState<Investor | null>(null);
  const [pitchEmailText, setPitchEmailText] = useState('');

  const generatePitchDraft = (investor: Investor) => {
    return `Subject: Introduction: ${profile.startupName || 'Our Startup'} - Stage: ${profile.stage} stage fit

Hi ${investor.name.split(' ')[0] || 'Team'},

I noticed that you invest in early-stage ${investor.sectors.join(', ')} startups with check sizes of ${investor.ticketSize}, focusing on ${investor.geography}. 

Our startup, ${profile.startupName || 'Studlyf Venture'}, is building in the ${profile.industry} sector. Here is a brief overview:
"${profile.description || 'Describe startup value proposition.'}"

We are currently at the ${profile.stage} stage and would love to share our pitch outline with you. 

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
    fetchInvestors();
  }, []);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/network/investors');
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

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Venture Capital Discovery</h2>
          <p>Explore matching angel networks, VC partners, and startup grant providers calculated using your company stage and sector.</p>
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
            const matchesStage = inv.stages.includes(profile.stage);
            const matchesSector = inv.sectors.some(s => profile.industry.toLowerCase().includes(s.toLowerCase()));
            let score = inv.readinessScore;
            if (!matchesStage) score -= 20;
            if (!matchesSector) score -= 15;
            score = Math.max(40, score);

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
