import React, { useState, useEffect } from 'react';
import { Search, Globe, Filter, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface StartupCompany {
  id: number;
  startupName: string;
  description: string;
  industry: string;
  country: string;
  stage: string;
  avatar: string;
  founderName: string;
  founderEmail: string;
}

export default function StartupDirectory() {
  const { profile, setProfile } = useAuth();
  const [startups, setStartups] = useState<StartupCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  
  // Toggling local visibility state
  const [isPublic, setIsPublic] = useState(profile.is_public || false);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    fetchDirectory();
  }, [isPublic]);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/startups/directory');
      if (response.ok) {
        setStartups(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    setToggleLoading(true);
    const nextState = !isPublic;
    try {
      const response = await apiFetch('/api/startups/toggle-public', {
        method: 'POST',
        body: JSON.stringify({ is_public: nextState })
      });
      const data = await response.json();
      if (data.success) {
        setIsPublic(data.is_public);
        // Sync global profile state
        setProfile(prev => ({ ...prev, is_public: data.is_public }));
        showToast(
          data.is_public 
            ? 'Startup profile is now PUBLIC in the directory!' 
            : 'Startup profile has been set to private.',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating visibility setting.', 'error');
    } finally {
      setToggleLoading(false);
    }
  };

  const filteredStartups = startups.filter(s => {
    const matchesSearch = s.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.founderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'All' || s.industry === sectorFilter;
    const matchesStage = stageFilter === 'All' || s.stage === stageFilter;
    
    return matchesSearch && matchesSector && matchesStage;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="page-title-section">
          <h2 className="gradient-text">YC-Style Startup Directory</h2>
          <p>Browse active ventures, discover collaborators, and inspect sector metrics.</p>
        </div>

        {/* Public visibility toggle card */}
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', border: '1px solid var(--border-glow)', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(6, 182, 212, 0.03)' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block' }}>Directory Visibility</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Showcase my company profile publicly</span>
          </div>
          <button 
            onClick={handleTogglePublic} 
            disabled={toggleLoading}
            className={`btn ${isPublic ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            {toggleLoading ? 'Updating...' : isPublic ? 'Publicly Listed' : 'Go Public'}
          </button>
        </div>
      </div>

      {/* Directory filters */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="grid-3" style={{ gap: '1rem' }}>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search startup name, mission, founder..."
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sector:</span>
            <select 
              className="form-select" 
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="All">All Sectors</option>
              <option value="AI & SaaS">AI & SaaS</option>
              <option value="Fintech">Fintech</option>
              <option value="E-commerce">E-commerce</option>
              <option value="EdTech">EdTech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="DeepTech">DeepTech</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Stage:</span>
            <select 
              className="form-select" 
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="All">All Stages</option>
              <option value="Idea">Idea</option>
              <option value="Validation">Validation</option>
              <option value="MVP">MVP</option>
              <option value="Revenue">Revenue</option>
              <option value="Fundraising">Fundraising</option>
            </select>
          </div>

        </div>
      </div>

      {/* Directory list grid */}
      {loading ? (
        <div className="flex-center" style={{ padding: '4rem' }}>
          <div className="pulse-loader">
            <div className="pulse-bubble" />
            <div className="pulse-bubble" />
            <div className="pulse-bubble" />
          </div>
        </div>
      ) : filteredStartups.length === 0 ? (
        <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column', color: 'var(--text-secondary)' }}>
          <Globe size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>No public startups match your filter criteria.</p>
        </div>
      ) : (
        <div className="grid-3 slide-up" style={{ gap: '1.5rem' }}>
          {filteredStartups.map(s => (
            <div 
              key={s.id} 
              className="glass-card animate-glow" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.85rem',
                border: s.startupName === profile.startupName ? '1px solid var(--secondary)' : '1px solid var(--border-light)' 
              }}
            >
              <div className="flex-center" style={{ gap: '0.75rem', alignSelf: 'flex-start', justifyContent: 'flex-start' }}>
                <img 
                  src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={s.startupName} 
                  style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    {s.startupName}
                    {s.startupName === profile.startupName && (
                      <span className="badge badge-secondary" style={{ marginLeft: '6px', fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>Mine</span>
                    )}
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HQ: {s.country}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, minHeight: '60px' }}>
                {s.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{s.industry}</span>
                <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{s.stage} Stage</span>
              </div>

              <div style={{ 
                marginTop: 'auto', 
                borderTop: '1px solid var(--border-light)', 
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Founder:</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{s.founderName}</span>
                </div>
                <a 
                  href={`mailto:${s.founderEmail}`} 
                  className="btn btn-outline" 
                  style={{ 
                    fontSize: '0.72rem', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    textDecoration: 'none'
                  }}
                >
                  Connect <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
