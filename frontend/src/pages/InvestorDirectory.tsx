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
                  <a 
                    href={`mailto:${inv.contactEmail}`}
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', width: '100%', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Mail size={14} /> Request Pitch Intro
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
