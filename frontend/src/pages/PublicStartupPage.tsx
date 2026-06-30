import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Globe, ArrowLeft, Briefcase, Mail, Building, MapPin } from 'lucide-react';
import { showToast } from '../components/ui/Toast';

interface PublicProfile {
  startupName: string;
  description: string;
  industry: string;
  country: string;
  stage: string;
  avatar: string;
  slug: string;
  founderName: string;
  founderEmail: string;
}

interface Opportunity {
  id: string;
  title: string;
  roleType: string;
  description: string;
  requirements: string;
  equityRange: string;
}

export default function PublicStartupPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingOpp, setApplyingOpp] = useState<Opportunity | null>(null);
  const [pitchNotes, setPitchNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    fetchPublicProfile();
  }, [slug]);

  const fetchPublicProfile = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/public/startup/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          // fetch opportunities and filter
          const oppRes = await apiFetch('/api/opportunities');
          if (oppRes.ok) {
            const oppData = await oppRes.json();
            const matchingOpps = oppData.filter((opp: any) => opp.startupName === data.profile.startupName);
            setOpps(matchingOpps);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingOpp) return;
    setApplyLoading(true);
    try {
      const res = await apiFetch('/api/opportunities/apply', {
        method: 'POST',
        body: JSON.stringify({
          opportunityId: applyingOpp.id,
          pitchNotes
        })
      });
      if (res.ok) {
        showToast(`Successfully applied to the ${applyingOpp.title} role!`, 'success');
        setApplyingOpp(null);
        setPitchNotes('');
      } else {
        showToast('You must be logged in as a founder/user to apply for positions.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error submitting job application.', 'error');
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="pulse-loader"><div className="pulse-bubble" /></div>
        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card" style={{ maxWidth: '480px', margin: '3rem auto', textAlign: 'center', padding: '3rem' }}>
        <Globe size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', justifySelf: 'center' }} />
        <h3>Profile Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          This startup profile does not exist or has been configured as private.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Navbar / Go Back */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-outline" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>
      </div>

      {/* Main card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '3rem 2.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(99,102,241,0.02) 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Startup Intro details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
          <img 
            src={profile.avatar} 
            alt={profile.startupName} 
            style={{ width: '96px', height: '96px', borderRadius: '24px', border: '2px solid rgba(255,255,255,0.1)', objectFit: 'cover' }} 
          />
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>{profile.startupName}</h2>
              <span className="badge badge-primary">{profile.stage} Stage</span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} /> {profile.industry}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {profile.country}</span>
            </div>
          </div>
          <div>
            <a 
              href={`mailto:${profile.founderEmail}`} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <Mail size={16} /> Contact Founder
            </a>
          </div>
        </div>

        {/* Detailed description */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>About the Company</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>
            {profile.description || 'This company has not configured an about statement yet.'}
          </p>
        </div>

        {/* Founder Bio */}
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FOUNDER PROFILE</span>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{profile.founderName}</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Interested in joining our team or co-investing? Feel free to reach out to the founder directly.</p>
        </div>

        {/* Active Open Positions */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.15rem', marginBottom: '1.25rem' }}>
            <Briefcase size={18} style={{ color: 'var(--secondary)' }} /> Active Positions & Opportunities
          </h3>
          
          {opps.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No open opportunities currently listed by this startup.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {opps.map((opp) => (
                <div key={opp.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
                  <div className="flex-between">
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{opp.title}</h4>
                    <span className="badge badge-secondary">{opp.roleType}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    {opp.description}
                  </p>
                  {opp.requirements && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      <strong>Requirements:</strong> {opp.requirements}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Equity Offering: {opp.equityRange}</span>
                    <button 
                      onClick={() => setApplyingOpp(opp)} 
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Apply Modal */}
      {applyingOpp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-popover)', padding: '2rem' }}>
            <h3>Apply for {applyingOpp.title}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Send a direct application pitch notes to {profile.startupName}.</p>

            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Application Pitch / Cover Note</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Explain why you are the perfect fit for this position in 2-3 sentences..." 
                  value={pitchNotes} 
                  onChange={(e) => setPitchNotes(e.target.value)} 
                  style={{ minHeight: '100px' }}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setApplyingOpp(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
