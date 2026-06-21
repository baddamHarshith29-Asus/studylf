import React, { useState, useEffect } from 'react';
import { Users, Search, Award, Activity, Calendar, Upload, MessageSquare, ArrowRight, UserCheck } from 'lucide-react';
import { showToast } from '../components/Toast';

export default function Network({ profile }) {
  const [activeTab, setActiveTab] = useState('investors');
  const [investors, setInvestors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [invSearch, setInvSearch] = useState('');
  const [menSearch, setMenSearch] = useState('');

  // Relationship Intelligence State
  const [contactsFile, setContactsFile] = useState(null);
  const [contactName, setContactName] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Mentor Booking State
  const [bookingMentor, setBookingMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const [invRes, menRes] = await Promise.all([
        fetch('/api/network/investors'),
        fetch('/api/network/mentors')
      ]);
      const invData = await invRes.json();
      const menData = await menRes.json();
      setInvestors(invData);
      setMentors(menData);
      
      if (invData.length > 0) {
        setTargetEntity(invData[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRelationshipIntelligence = async (e) => {
    e.preventDefault();
    if (!contactName || !targetEntity) return;

    setPathLoading(true);
    try {
      const response = await fetch('/api/network/relationship-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactName, targetEntity })
      });
      const data = await response.json();
      if (data.success) {
        setPathResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPathLoading(false);
    }
  };

  const handleBookMeeting = (e) => {
    e.preventDefault();
    showToast(`Meeting requested with ${bookingMentor.name} for ${bookingDate} at ${bookingTime}. They will confirm availability shortly.`, 'success');
    setBookingMentor(null);
    setBookingDate('');
    setBookingTime('');
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
          <h2 className="gradient-text">Network Hub</h2>
          <p>Search matchmaking investors, request consultations with startup mentors, and map intro routes.</p>
        </div>
      </div>

      {/* Sub tabs headers */}
      <div className="tabs-header">
        <button 
          onClick={() => setActiveTab('investors')} 
          className={`tab-btn ${activeTab === 'investors' ? 'active' : ''}`}
        >
          Investor Discovery
        </button>
        <button 
          onClick={() => setActiveTab('mentors')} 
          className={`tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
        >
          Mentor Discovery
        </button>
        <button 
          onClick={() => setActiveTab('relationship')} 
          className={`tab-btn ${activeTab === 'relationship' ? 'active' : ''}`}
        >
          Relationship Intelligence
        </button>
      </div>

      {/* Tab Contents */}
      {loading && activeTab !== 'relationship' ? (
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
              // Calculate custom matchmaking score based on profile stage & industry
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
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', block: 'block' }}>Match Rate</span>
                      <div style={{ fontSize: '1rem', fontWeight: 'bold', color: calculatedScore > 75 ? 'var(--success)' : 'var(--warning)' }}>
                        {calculatedScore}%
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{inv.matchReason}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.78rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Ticket Range:</span>
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

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', justifySelf: 'flex-end', marginTop: '0.5rem' }}>
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
                <div className="flex-center" style={{ gap: '0.75rem', alignSelf: 'flex-start' }}>
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
      ) : (
        /* Relationship Intelligence Tab */
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          {/* Path Mapping inputs */}
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
                    const file = e.target.files[0];
                    if (file) {
                      setContactsFile(file);
                      showToast(`Successfully loaded contact list file: ${file.name}`, 'success');
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

          {/* Visualized connection node graph */}
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
                
                {/* Node visualizer */}
                <div className="network-path">
                  <div className="path-node">
                    <div className="node-icon-wrapper" style={{ fontSize: '0.72rem' }}>You</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textWidth: '100px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pathResult.path[0].name}</span>
                  </div>
                  
                  <div className="path-arrow" />

                  <div className="path-node">
                    <div className="node-icon-wrapper" style={{ fontSize: '0.72rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>Contact</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textWidth: '100px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pathResult.path[1].name}</span>
                  </div>

                  <div className="path-arrow" />

                  <div className="path-node target">
                    <div className="node-icon-wrapper" style={{ fontSize: '0.72rem' }}>Target</div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textWidth: '100px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{pathResult.path[2].name}</span>
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

            <div className="flex-center" style={{ gap: '0.75rem', marginBottom: '1.25rem', alignSelf: 'flex-start' }}>
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
