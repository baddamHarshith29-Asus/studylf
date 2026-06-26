import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { Shield, Settings, Briefcase, Plus, UserCheck, Eye, EyeOff } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  roleType: string;
  description: string;
  requirements: string;
  equityRange: string;
}

interface Application {
  id: string;
  opportunityTitle: string;
  roleType: string;
  applicantName: string;
  applicantEmail: string;
  pitchNotes: string;
  appliedAt: string;
}

export default function StartupProfile() {
  const { profile, setProfile } = useAuth();
  const [startupName, setStartupName] = useState(profile.startupName || '');
  const [description, setDescription] = useState(profile.description || '');
  const [industry, setIndustry] = useState(profile.industry || 'AI & SaaS');
  const [country, setCountry] = useState(profile.country || 'India');
  const [stage, setStage] = useState(profile.stage || 'Idea');
  const [isPublic, setIsPublic] = useState(profile.is_public || false);
  const [updating, setUpdating] = useState(false);

  // Opportunity state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postRoleType, setPostRoleType] = useState('Team Member');
  const [postDesc, setPostDesc] = useState('');
  const [postReqs, setPostReqs] = useState('');
  const [postEquity, setPostEquity] = useState('1.0% - 2.5%');
  const [postLoading, setPostLoading] = useState(false);
  const [loadingOpps, setLoadingOpps] = useState(false);

  useEffect(() => {
    fetchStartupOpportunities();
  }, []);

  const fetchStartupOpportunities = async () => {
    setLoadingOpps(true);
    try {
      const oppRes = await apiFetch('/api/opportunities/list');
      if (oppRes.ok) {
        const oppData = await oppRes.json();
        // filter opportunities belonging to my startup
        const myOpps = oppData.filter((opp: any) => opp.startupName === profile.startupName);
        setOpportunities(myOpps);
      }
      
      const appRes = await apiFetch('/api/opportunities/applications');
      if (appRes.ok) {
        setApplications(await appRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOpps(false);
    }
  };


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await apiFetch('/api/startups/profile', {
        method: 'POST',
        body: JSON.stringify({
          startupName,
          description,
          industry,
          country,
          stage,
          is_public: isPublic
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          showToast('Startup profile updated successfully!', 'success');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating startup profile.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePublic = async (val: boolean) => {
    setIsPublic(val);
    try {
      const res = await apiFetch('/api/startups/toggle-public', {
        method: 'POST',
        body: JSON.stringify({ is_public: val })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showToast(`Startup directory visibility set to: ${val ? 'Public' : 'Private'}`, 'success');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postDesc) return;
    setPostLoading(true);
    try {
      const response = await apiFetch('/api/opportunities/post', {
        method: 'POST',
        body: JSON.stringify({
          title: postTitle,
          roleType: postRoleType,
          description: postDesc,
          requirements: postReqs,
          equityRange: postEquity
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast('New position posted successfully!', 'success');
          setPostTitle('');
          setPostDesc('');
          setPostReqs('');
          setShowPostModal(false);
          fetchStartupOpportunities();
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error posting position.', 'error');
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Startup Company Profile</h2>
          <p>Configure company details, manage public directory listing, and list hiring opportunities.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Profile Settings */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex-between">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} style={{ color: 'var(--primary)' }} /> Profile Information
            </h3>
            <button 
              type="button" 
              onClick={() => handleTogglePublic(!isPublic)}
              className={`btn ${isPublic ? 'btn-success' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              {isPublic ? <><Eye size={14} /> Directory Public</> : <><EyeOff size={14} /> Directory Private</>}
            </button>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Startup Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={startupName} 
                onChange={(e) => setStartupName(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description / Elevator Pitch</label>
              <textarea 
                className="form-textarea" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={{ minHeight: '80px' }}
                required 
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="AI & SaaS">AI & SaaS</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Healthtech">Healthtech</option>
                  <option value="Edtech">Edtech</option>
                  <option value="Deep Tech">Deep Tech</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stage</label>
                <select className="form-select" value={stage} onChange={(e) => setStage(e.target.value)}>
                  <option value="Idea">Idea Stage</option>
                  <option value="Validation">Validation Stage</option>
                  <option value="MVP">MVP Phase</option>
                  <option value="Revenue">Early Revenue</option>
                  <option value="Fundraising">Fundraising</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Market / Country</label>
              <input 
                type="text" 
                className="form-input" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                required 
              />
            </div>

            {isPublic && (
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.15)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--primary-glow)' }}>
                Your public profile URL: <strong>/startup/{profile.slug || 'generating...'}</strong>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={updating}>
              {updating ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Opportunity Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="flex-between">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} style={{ color: 'var(--secondary)' }} /> Hiring & Opportunities
              </h3>
              <button onClick={() => setShowPostModal(true)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Role
              </button>
            </div>

            {loadingOpps ? (
              <div className="pulse-loader" style={{ padding: '1.5rem' }} />
            ) : opportunities.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You haven't listed any opportunities yet. Post positions to hire co-founders, advisors, or engineers.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {opportunities.map((opp) => (
                  <div key={opp.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                    <div className="flex-between">
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600 }}>{opp.title}</h4>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{opp.roleType}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>{opp.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--success)', marginTop: '0.4rem' }}>
                      <span>Eq: {opp.equityRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} style={{ color: 'var(--success)' }} /> Applications Received
            </h3>
            
            {applications.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No applications received yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {applications.map((app) => (
                  <div key={app.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Role: {app.opportunityTitle}</span>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem' }}>{app.applicantName}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', display: 'block' }}>{app.applicantEmail}</span>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontStyle: 'italic' }}>
                      "{app.pitchNotes}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Post Opportunity Modal */}
      {showPostModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-popover)', padding: '2rem' }}>
            <h3>Create Opportunity Post</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Advertise positions to find builders or match with VC mentors.</p>

            <form onSubmit={handlePostOpportunity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Position Title</label>
                <input type="text" className="form-input" placeholder="e.g. Lead AI Engineer" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Role Category</label>
                <select className="form-select" value={postRoleType} onChange={(e) => setPostRoleType(e.target.value)}>
                  <option value="Team Member">Founding Member / Dev</option>
                  <option value="Mentor">Advisor / B2B Consultant</option>
                  <option value="Collaborator">Co-founder Partnership</option>
                  <option value="Investor">Angel Syndicate Partner</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role Description</label>
                <textarea className="form-textarea" placeholder="Detail the duties and roadmap of the position..." value={postDesc} onChange={(e) => setPostDesc(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Core Skills Requirements</label>
                <input type="text" className="form-input" placeholder="e.g. 3+ yrs Python, PyMongo, React design" value={postReqs} onChange={(e) => setPostReqs(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Equity Offering / Range</label>
                <input type="text" className="form-input" placeholder="e.g. 1.0% - 2.5% or Advisory allocation" value={postEquity} onChange={(e) => setPostEquity(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowPostModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={postLoading}>
                  {postLoading ? 'Posting...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
