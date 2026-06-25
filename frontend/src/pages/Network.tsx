import React, { useState, useEffect } from 'react';
import { Search, Calendar, Upload, Users, Briefcase, Plus, Send, Activity, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

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

interface Mentor {
  id: string;
  name: string;
  role: string;
  experience: string;
  expertise: string[];
  availability: string;
  image: string;
}

interface RelationshipPathNode {
  name: string;
  type: string;
}

interface RelationshipPathResult {
  success: boolean;
  path: RelationshipPathNode[];
  strength: string;
  advice: string;
}

interface NetworkRecommendation {
  name: string;
  company: string;
  recommendedRole: string;
  matchReason: string;
}

interface JobOpportunity {
  id: string;
  startupId: number;
  startupName: string;
  startupIndustry: string;
  startupStage: string;
  title: string;
  roleType: string;
  description: string;
  requirements: string;
  equityRange: string;
}

interface JobApplication {
  id: string;
  opportunityTitle: string;
  roleType: string;
  applicantName: string;
  applicantEmail: string;
  pitchNotes: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  appliedAt: string;
}

export default function Network() {
  const { profile } = useAuth();
  
  // Navigation active tabs
  const [activeTab, setActiveTab] = useState<'investors' | 'mentors' | 'relationship' | 'recommendations' | 'opportunities'>('investors');
  
  // Base State Lists
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [invSearch, setInvSearch] = useState('');
  const [menSearch, setMenSearch] = useState('');

  // Relationship Intelligence State
  const [contactsFile, setContactsFile] = useState<File | null>(null);
  const [contactName, setContactName] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [pathResult, setPathResult] = useState<RelationshipPathResult | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Mentor Booking State
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  // Rava AI Professional Advisor state
  const [startupIdea, setStartupIdea] = useState(profile.description || '');
  const [networkRecs, setNetworkRecs] = useState<NetworkRecommendation[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Wellfound Jobs Board state
  const [jobsList, setJobsList] = useState<JobOpportunity[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyingJob, setApplyingJob] = useState<JobOpportunity | null>(null);
  
  // Admin Job Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postRoleType, setPostRoleType] = useState('Team Member');
  const [postDesc, setPostDesc] = useState('');
  const [postReqs, setPostReqs] = useState('');
  const [postEquity, setPostEquity] = useState('1.0% - 2.0%');
  const [postLoading, setPostLoading] = useState(false);

  // Applicant Pitch notes
  const [pitchNotes, setPitchNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Received Applications list for startup admins
  const [receivedApps, setReceivedApps] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  useEffect(() => {
    fetchNetworkData();
    fetchOpportunities();
    fetchReceivedApplications();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const [invRes, menRes] = await Promise.all([
        apiFetch('/api/network/investors'),
        apiFetch('/api/network/mentors')
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvestors(invData);
        if (invData.length > 0) {
          setTargetEntity(invData[0].name);
        }
      }
      if (menRes.ok) {
        setMentors(await menRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    setJobsLoading(true);
    try {
      const response = await apiFetch('/api/opportunities/list');
      if (response.ok) {
        setJobsList(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchReceivedApplications = async () => {
    setAppsLoading(true);
    try {
      const response = await apiFetch('/api/opportunities/applications');
      if (response.ok) {
        setReceivedApps(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleRelationshipIntelligence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !targetEntity) return;

    setPathLoading(true);
    try {
      const response = await apiFetch('/api/network/relationship-path', {
        method: 'POST',
        body: JSON.stringify({ contactName, targetEntity })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPathResult(data);
          showToast('Connection path mapped successfully!', 'success');
        } else {
          showToast(data.error || 'Failed to determine path.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error mapping relationship path.', 'error');
    } finally {
      setPathLoading(false);
    }
  };

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;
    showToast(`Meeting requested with ${bookingMentor.name} for ${bookingDate} at ${bookingTime}. They will confirm availability shortly.`, 'success');
    setBookingMentor(null);
    setBookingDate('');
    setBookingTime('');
  };

  const runNetworkAnalysis = async (ideaText: string) => {
    setRecsLoading(true);
    try {
      const response = await apiFetch('/api/network/analyze-linkedin', {
        method: 'POST',
        body: JSON.stringify({ startupIdea: ideaText })
      });
      const data = await response.json();
      if (data.success) {
        setNetworkRecs(data.recommendations || []);
      } else {
        showToast(data.error || 'Failed to calculate network matches.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to advisor.', 'error');
    } finally {
      setRecsLoading(false);
    }
  };

  const handleCSVUpload = async (file: File, autoTriggerAnalysis = false) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      if (!csvContent) return;
      
      try {
        const response = await apiFetch('/api/network/import-csv', {
          method: 'POST',
          body: JSON.stringify({ csvContent })
        });
        const data = await response.json();
        if (response.ok && data.success) {
          showToast(`Successfully imported ${data.count} contacts from ${file.name}!`, 'success');
          if (autoTriggerAnalysis) {
            await runNetworkAnalysis(startupIdea);
            showToast('AI analyzed your connection list and matched startup roles!', 'success');
          }
        } else {
          showToast(data.error || 'Failed to import contacts.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Error uploading contacts CSV.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleMatchNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    await runNetworkAnalysis(startupIdea);
    showToast('AI analyzed connection lists and matched startup roles!', 'success');
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
      const data = await response.json();
      if (data.success) {
        showToast('New opportunity listing posted successfully!', 'success');
        setJobsList([data.opportunity, ...jobsList]);
        setPostTitle('');
        setPostDesc('');
        setPostReqs('');
        setShowPostModal(false);
      } else {
        showToast(data.error || 'Failed to post role.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error posting role.', 'error');
    } finally {
      setPostLoading(false);
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
      const data = await response.json();
      if (data.success) {
        showToast(`Successfully applied for the ${applyingJob.title} position!`, 'success');
        setApplyingJob(null);
        setPitchNotes('');
      } else {
        showToast(data.error || 'Failed to submit application.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error submitting application.', 'error');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleDecideApplication = async (appId: string, decision: 'Accepted' | 'Rejected') => {
    try {
      const response = await apiFetch(`/api/opportunities/applications/${appId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: decision })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showToast(`Application successfully ${decision.toLowerCase()}!`, 'success');
        fetchReceivedApplications();
      } else {
        showToast(data.error || 'Failed to update decision.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating decision.', 'error');
    }
  };

  const filteredInvestors = investors.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(invSearch.toLowerCase()) || 
                        i.sectors.some(s => s.toLowerCase().includes(invSearch.toLowerCase()));
    return matchSearch;
  });

  const filteredMentors = mentors.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(menSearch.toLowerCase()) || 
                        m.expertise.some(e => e.toLowerCase().includes(menSearch.toLowerCase()));
    return matchSearch;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Network & Talent Hub</h2>
          <p>Search matchmaking investors, request advisor bookings, map introduction paths, and hire founding team members.</p>
        </div>
      </div>

      {/* Sub tabs headers */}
      <div className="tabs-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        <button onClick={() => setActiveTab('investors')} className={`tab-btn ${activeTab === 'investors' ? 'active' : ''}`}>
          Investor Discovery
        </button>
        <button onClick={() => setActiveTab('mentors')} className={`tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}>
          Mentor Discovery
        </button>
        <button onClick={() => setActiveTab('relationship')} className={`tab-btn ${activeTab === 'relationship' ? 'active' : ''}`}>
          Relationship Intelligence
        </button>
        <button onClick={() => setActiveTab('recommendations')} className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}>
          AI Network Advisor (Rava AI)
        </button>
        <button onClick={() => setActiveTab('opportunities')} className={`tab-btn ${activeTab === 'opportunities' ? 'active' : ''}`}>
          Opportunities Board (Wellfound)
        </button>
      </div>

      {/* Tab Contents */}
      {loading && activeTab !== 'relationship' && activeTab !== 'recommendations' && activeTab !== 'opportunities' ? (
        <div className="flex-center" style={{ padding: '3rem' }}>
          <div className="pulse-loader">
            <div className="pulse-bubble" />
            <div className="pulse-bubble" />
            <div className="pulse-bubble" />
          </div>
        </div>
      ) : activeTab === 'investors' ? (
        /* Investor Discovery Tab */
        <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search investors by name or sector target (e.g. AI, SaaS)..."
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              value={invSearch}
              onChange={(e) => setInvSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          </div>

          <div className="grid-2">
            {filteredInvestors.map(inv => {
              const matchesStage = inv.stages.includes(profile.stage);
              const matchesSector = inv.sectors.some(s => profile.industry.toLowerCase().includes(s.toLowerCase()));
              let calculatedScore = inv.readinessScore;
              if (!matchesStage) calculatedScore -= 20;
              if (!matchesSector) calculatedScore -= 15;
              calculatedScore = Math.max(40, calculatedScore);

              return (
                <div key={inv.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="flex-between">
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{inv.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.type}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Match Rate</span>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: calculatedScore > 75 ? 'var(--success)' : 'var(--warning)' }}>
                        {calculatedScore}%
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{inv.matchReason}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Ticket Size:</span>
                      <span style={{ fontWeight: 600 }}>{inv.ticketSize}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Geography:</span>
                      <span style={{ fontWeight: 600 }}>{inv.geography}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                    {inv.sectors.map((sec, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{sec}</span>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', justifySelf: 'flex-end', marginTop: 'auto' }}>
                    <a 
                      href={`mailto:${inv.contactEmail}`}
                      className="btn btn-outline" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', width: '100%', textDecoration: 'none', textAlign: 'center' }}
                    >
                      Request Pitch Intro
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'mentors' ? (
        /* Mentor Discovery Tab */
        <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search mentors by name or expertise (e.g. Sales, PM, Product)..."
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              value={menSearch}
              onChange={(e) => setMenSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
          </div>

          <div className="grid-3">
            {filteredMentors.map(mentor => (
              <div key={mentor.id} className="glass-card animate-glow" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="flex-center" style={{ gap: '0.75rem', alignSelf: 'flex-start', justifyContent: 'flex-start' }}>
                  <img 
                    src={mentor.image} 
                    alt={mentor.name} 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                  />
                  <div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 600 }}>{mentor.name}</h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', display: 'block' }}>{mentor.role}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{mentor.experience}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                  {mentor.expertise.map((exp, idx) => (
                    <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>{exp}</span>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avail: {mentor.availability}</span>
                  <button 
                    onClick={() => setBookingMentor(mentor)}
                    className="btn btn-primary" 
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'relationship' ? (
        /* Relationship Intelligence Tab */
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3>🔗 Warm Introduction Finder</h3>
            <p style={{ fontSize: '0.85rem' }}>STUDLYF maps secure paths to target investors using only your uploaded connections, avoiding third-party scrapers.</p>
            
            <form onSubmit={handleRelationshipIntelligence}>
              <div style={{ border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', marginBottom: '1.25rem', cursor: 'pointer', position: 'relative' }}>
                <input 
                  type="file" 
                  accept=".csv,.xlsx" 
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setContactsFile(file);
                      handleCSVUpload(file);
                    }
                  }}
                />
                <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.4rem' }} />
                <h4 style={{ fontSize: '0.85rem' }}>Upload Contacts CSV</h4>
                <p style={{ fontSize: '0.72rem' }}>{contactsFile ? contactsFile.name : 'Upload Google Contacts or LinkedIn connection exports.'}</p>
              </div>

              <div className="form-group">
                <label className="form-label">Name of Mutual Connection</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Vikram Malhotra" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Target Investor / VC firm</label>
                {investors.length > 0 ? (
                  <select 
                    className="form-select" 
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                  >
                    {investors.map(inv => (
                      <option key={inv.id} value={inv.name}>{inv.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Peak XV Partners"
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                  />
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={pathLoading || !contactName}
              >
                {pathLoading ? 'Querying networks...' : 'Identify Intro Path'}
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '340px' }}>
            <h3>📊 Connection Path Graph</h3>

            {pathLoading ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '0.5rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                </div>
              </div>
            ) : pathResult ? (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
                
                <div className="network-path">
                  <div className="path-node">
                    <div className="node-icon-wrapper" style={{ fontSize: '0.72rem' }}>You</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pathResult.path[0]?.name}</span>
                  </div>
                  
                  <div className="path-arrow" />

                  <div className="path-node">
                    <div className="node-icon-wrapper" style={{ fontSize: '0.72rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>Contact</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pathResult.path[1]?.name}</span>
                  </div>

                  <div className="path-arrow" />

                  <div className="path-node target">
                    <div className="node-icon-wrapper" style={{ fontSize: '0.72rem' }}>Target</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pathResult.path[2]?.name}</span>
                  </div>
                </div>

                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-light)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Connection Index: </span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{pathResult.strength}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tactical Advice: </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.4, marginTop: '0.2rem' }}>{pathResult.advice}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', color: 'var(--text-muted)', gap: '0.5rem', textAlign: 'center' }}>
                <Users size={32} />
                <p style={{ fontSize: '0.78rem' }}>Enter introduction data on the left to map target connection routes.</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'recommendations' ? (
        /* AI Network Recommendation Advisor (Rava AI Model) */
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          
          {/* Idea Input and CSV trigger */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--secondary)' }} /> LinkedIn Co-founder & Advisor Finder
            </h3>
            <p style={{ fontSize: '0.85rem' }}>
              Analyze your startup concept against your professional network. Studio matching recommends who in your contacts list can serve as co-founders, CTOs, advisors, or key investors.
            </p>

            <form onSubmit={handleMatchNetwork}>
              <div className="form-group">
                <label className="form-label">Active Startup Idea / Description</label>
                <textarea 
                  className="form-textarea"
                  value={startupIdea}
                  onChange={e => setStartupIdea(e.target.value)}
                  placeholder="Detail your product value proposal and target sector..."
                  style={{ minHeight: '100px' }}
                  required
                />
              </div>

              <div style={{ border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', marginBottom: '1.25rem', cursor: 'pointer', position: 'relative' }}>
                <input 
                  type="file" 
                  accept=".csv,.xlsx" 
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleCSVUpload(file, true);
                    }
                  }}
                />
                <Upload size={24} style={{ color: 'var(--primary)', marginBottom: '0.4rem' }} />
                <h4 style={{ fontSize: '0.85rem' }}>Connect LinkedIn Profile / Export CSV</h4>
                <p style={{ fontSize: '0.72rem' }}>Upload LinkedIn connections export or resume lists to read contacts.</p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                disabled={recsLoading}
              >
                {recsLoading ? 'Analyzing networks...' : <><Send size={14} /> Calculate Network Recommendations</>}
              </button>
            </form>
          </div>

          {/* Matches Output List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '380px' }}>
            <h3>👥 Recommended Allies</h3>

            {recsLoading ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '0.75rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" /><div className="pulse-bubble" /><div className="pulse-bubble" />
                </div>
              </div>
            ) : networkRecs.length > 0 ? (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '420px' }}>
                {networkRecs.map((rec, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                    <div className="flex-between">
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{rec.name}</h4>
                      <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{rec.recommendedRole}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>{rec.company}</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rec.matchReason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', color: 'var(--text-muted)', gap: '0.5rem', textAlign: 'center' }}>
                <Users size={32} />
                <p style={{ fontSize: '0.78rem' }}>AI suggestions will display here based on matching connection profiles.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Opportunities Board (Wellfound/HR Board) */
        <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Post Opportunities for Admins */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>💼 Wellfound-Style Opportunities Board</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Search support roles at startups, or post open requests for developers, mentors, or funding rounds.</p>
            </div>
            <button 
              onClick={() => setShowPostModal(true)} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Post Opportunity
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            
            {/* Opportunities List Card */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '400px' }}>
              <h3>🔍 Startup Job Postings</h3>
              
              {jobsLoading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                  <div className="pulse-loader">
                    <div className="pulse-bubble" />
                  </div>
                </div>
              ) : jobsList.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No roles posted yet. Be the first to post!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {jobsList.map((job) => (
                    <div key={job.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                      <div className="flex-between">
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{job.title}</h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--secondary)' }}>{job.startupName} • {job.startupStage} Stage</span>
                        </div>
                        <span className="badge badge-primary">{job.roleType}</span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.65rem', lineHeight: 1.4 }}>
                        {job.description}
                      </p>
                      
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        <strong>Requirements:</strong> {job.requirements}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.65rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--success)' }}>Equity Offer: {job.equityRange}</span>
                        <button 
                          onClick={() => setApplyingJob(job)} 
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '4px' }}
                        >
                          Apply to Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin View: Applications submitted to my startup */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={18} style={{ color: 'var(--secondary)' }} /> Applications Received
              </h3>
              <p style={{ fontSize: '0.78rem' }}>Manage messages submitted by founders seeking roles in your venture.</p>
              
              {appsLoading ? (
                <div className="flex-center" style={{ height: '100px' }}><div className="pulse-loader"><div className="pulse-bubble" /></div></div>
              ) : receivedApps.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 1rem' }}>No applications received for your posted opportunities yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto', maxHeight: '400px' }}>
                  {receivedApps.map((a) => (
                    <div key={a.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                      <div className="flex-between">
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Role: {a.opportunityTitle}</span>
                        {a.status && a.status !== 'Pending' ? (
                          <span className={`badge ${a.status === 'Accepted' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                            {a.status}
                          </span>
                        ) : (
                          <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Pending</span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem' }}>{a.applicantName}</h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', display: 'block' }}>{a.applicantEmail}</span>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                        "{a.pitchNotes}"
                      </p>
                      {(!a.status || a.status === 'Pending') && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button 
                            onClick={() => handleDecideApplication(a.id, 'Accepted')}
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', flex: 1 }}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleDecideApplication(a.id, 'Rejected')}
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* MODAL: Post Opportunity Form */}
          {showPostModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 120, backdropFilter: 'blur(8px)',
              padding: '1rem'
            }}>
              <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '480px', background: 'var(--bg-popover)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                  <h3>💼 Post New Opportunity</h3>
                  <button 
                    onClick={() => setShowPostModal(false)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
                  >✕</button>
                </div>

                <form onSubmit={handlePostOpportunity}>
                  <div className="form-group">
                    <label className="form-label">Position / Role Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Founding Fullstack Engineer"
                      value={postTitle}
                      onChange={e => setPostTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Role Category</label>
                      <select 
                        className="form-select" 
                        value={postRoleType}
                        onChange={e => setPostRoleType(e.target.value)}
                      >
                        <option value="Team Member">Team Member</option>
                        <option value="Co-founder">Co-founder</option>
                        <option value="Mentor">Mentor / Advisor</option>
                        <option value="Investor">Investor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Equity Offer Range</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. 1.0% - 2.5%"
                        value={postEquity}
                        onChange={e => setPostEquity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description of Responsibilities</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Detail what tasks this role will execute..."
                      value={postDesc}
                      onChange={e => setPostDesc(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Skill Requirements</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Python, React, AWS hosting experience"
                      value={postReqs}
                      onChange={e => setPostReqs(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowPostModal(false)}
                      className="btn btn-secondary" 
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ flex: 2 }}
                      disabled={postLoading}
                    >
                      {postLoading ? 'Saving...' : 'Post Listing'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: Apply to Role Form */}
          {applyingJob && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', zIndex: 120, backdropFilter: 'blur(8px)',
              padding: '1rem'
            }}>
              <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-popover)' }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                  <h3>Apply to Startup Role</h3>
                  <button 
                    onClick={() => setApplyingJob(null)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
                  >✕</button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>{applyingJob.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>At {applyingJob.startupName}</p>
                </div>

                <form onSubmit={handleApplyJob}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Brief pitch / cover note to founder:</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder="Explain how your background fits this role and why you'd like to support them..."
                      value={pitchNotes}
                      onChange={e => setPitchNotes(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setApplyingJob(null)}
                      className="btn btn-secondary" 
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ flex: 2 }}
                      disabled={applyLoading}
                    >
                      {applyLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Booking Modal */}
      {bookingMentor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)',
          padding: '1rem'
        }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-popover)' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Book Consultation Session
              </h3>
              <button 
                onClick={() => setBookingMentor(null)}
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}
              >✕</button>
            </div>

            <div className="flex-center" style={{ gap: '0.75rem', marginBottom: '1.25rem', alignSelf: 'flex-start', justifyContent: 'flex-start' }}>
              <img 
                src={bookingMentor.image} 
                alt={bookingMentor.name} 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{bookingMentor.name}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{bookingMentor.role}</p>
              </div>
            </div>

            <form onSubmit={handleBookMeeting}>
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Preferred Time Slot</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setBookingMentor(null)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                >
                  Submit Booking Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
