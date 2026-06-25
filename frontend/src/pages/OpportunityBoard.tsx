import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { Search, Briefcase, Plus, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Opportunity {
  id: string;
  startupId: string;
  startupName: string;
  startupIndustry: string;
  startupStage: string;
  title: string;
  roleType: string;
  description: string;
  requirements: string;
  equityRange: string;
  createdAt: string;
}

export default function OpportunityBoard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Application State
  const [applyingJob, setApplyingJob] = useState<Opportunity | null>(null);
  const [pitchNotes, setPitchNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/opportunities/list');
      if (response.ok) {
        setOpps(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    setApplyLoading(true);
    try {
      const response = await apiFetch('/api/opportunities/apply', {
        method: 'POST',
        body: JSON.stringify({
          opportunityId: applyingJob.id,
          pitchNotes
        })
      });
      if (response.ok) {
        showToast(`Successfully applied for the ${applyingJob.title} position!`, 'success');
        setApplyingJob(null);
        setPitchNotes('');
      } else {
        showToast('Failed to submit application. Make sure you are logged in.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error submitting application.', 'error');
    } finally {
      setApplyLoading(false);
    }
  };

  const categories = ['All', 'Team Member', 'Mentor', 'Collaborator', 'Investor'];

  const filteredOpps = opps.filter((opp) => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.startupName.toLowerCase().includes(search.toLowerCase()) ||
      opp.description.toLowerCase().includes(search.toLowerCase()) ||
      opp.requirements.toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = activeCategory === 'All' || opp.roleType === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-title-section">
          <h2 className="gradient-text">Ecosystem Opportunity Board</h2>
          <p>Browse open positions, co-founder requests, advisory roles, or investor matchings across active startups.</p>
        </div>
        <button 
          onClick={() => navigate('/startup-profile')} 
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} /> Post Opportunity
        </button>
      </div>

      {/* Categories Buttons */}
      <div className="tabs-header" style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? 'All Roles' : cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search opportunities by role title, startup name, skills..."
          style={{ width: '100%', paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
      </div>

      {/* Opportunities List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '300px' }}>
        {loading ? (
          <div className="flex-center" style={{ padding: '3rem' }}>
            <div className="pulse-loader"><div className="pulse-bubble" /></div>
          </div>
        ) : filteredOpps.length === 0 ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
            <Briefcase size={36} />
            <p>No matching positions found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredOpps.map((opp) => (
              <div key={opp.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
                <div className="flex-between">
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{opp.title}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>{opp.startupName} • {opp.startupStage} Stage</span>
                  </div>
                  <span className="badge badge-primary">{opp.roleType}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.4 }}>
                  {opp.description}
                </p>
                
                {opp.requirements && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <strong>Requirements:</strong> {opp.requirements}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--success)' }}>Equity Offer: {opp.equityRange}</span>
                  <button 
                    onClick={() => setApplyingJob(opp)} 
                    className="btn btn-primary"
                    style={{ padding: '0.38rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px' }}
                  >
                    Apply for Position
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {applyingJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-popover)', padding: '2rem' }}>
            <h3>Apply for {applyingJob.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Send your pitch details to {applyingJob.startupName}.</p>

            <form onSubmit={handleApplyJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Application Pitch / Note</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Explain why you are interested in this startup and what skills you bring..." 
                  value={pitchNotes} 
                  onChange={(e) => setPitchNotes(e.target.value)} 
                  style={{ minHeight: '100px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setApplyingJob(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : 'Send Pitch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
