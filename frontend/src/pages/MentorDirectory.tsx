import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { Search, Calendar, Users, X } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  role: string;
  experience: string;
  expertise: string[];
  availability: string;
  image: string;
}

export default function MentorDirectory() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Booking session modal
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/network/mentors');
      if (res.ok) {
        setMentors(await res.json());
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading mentor directory.', 'error');
    } finally {
      setLoading(false);
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

  const filteredMentors = mentors.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase()) ||
      m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Ecosystem Mentors & Advisors</h2>
          <p>Book 1-on-1 office hours sessions with active entrepreneurs, product leaders, and B2B growth consultants.</p>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search mentors by name or skills expertise (e.g. Sales, SEO, Scale)..."
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
      ) : filteredMentors.length === 0 ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
          <Users size={36} />
          <p>No advisors found matching your query.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="glass-card animate-glow" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex-center" style={{ gap: '0.75rem', alignSelf: 'flex-start', justifyContent: 'flex-start' }}>
                <img 
                  src={mentor.image} 
                  alt={mentor.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                />
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#fff' }}>{mentor.name}</h4>
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
      )}

      {/* Booking Modal */}
      {bookingMentor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-popover)', padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3>Book Advisor Session</h3>
              <button onClick={() => setBookingMentor(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Schedule a 30-minute matching slot with <strong>{bookingMentor.name}</strong>.
            </p>

            <form onSubmit={handleBookMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select Time Slot</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={bookingTime} 
                  onChange={(e) => setBookingTime(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Submit Booking Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
