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
  
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [discussionTopic, setDiscussionTopic] = useState('General Advisory');

  const MOCK_DATES = [
    { label: 'Jul 1 (Wed)', val: '2026-07-01' },
    { label: 'Jul 3 (Fri)', val: '2026-07-03' },
    { label: 'Jul 6 (Mon)', val: '2026-07-06' }
  ];

  const MOCK_SLOTS = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

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
    const dateVal = MOCK_DATES[selectedDateIndex]?.val || '2026-07-01';
    showToast(`Session request submitted to ${bookingMentor.name} for ${dateVal} at ${selectedTimeSlot} (Topic: ${discussionTopic}). They will confirm shortly!`, 'success');
    setBookingMentor(null);
    setSelectedDateIndex(0);
    setSelectedTimeSlot('10:00 AM');
    setDiscussionTopic('General Advisory');
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-popover)', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>📅 Book Advisor office hours</h3>
              <button onClick={() => setBookingMentor(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Select a 30-minute office-hours slot with <strong>{bookingMentor.name}</strong> from their published availability.
            </p>

            <form onSubmit={handleBookMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Published Available Dates</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {MOCK_DATES.map((date, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDateIndex(idx)}
                      className={`btn ${selectedDateIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Available Time slots</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {MOCK_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`btn ${selectedTimeSlot === slot ? 'btn-accent' : 'btn-secondary'}`}
                      style={{ padding: '0.5rem 0.25rem', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Topic of Discussion</label>
                <select 
                  className="form-select" 
                  style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', marginTop: '0.35rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)' }}
                  value={discussionTopic}
                  onChange={(e) => setDiscussionTopic(e.target.value)}
                >
                  <option value="General Advisory">General Advisory & Gaps</option>
                  <option value="Pitch Deck Review">Pitch Deck Review</option>
                  <option value="GTM / Growth Hacks">GTM & Growth Hacking</option>
                  <option value="Tech Stack / Arch check">Tech Stack & Architecture</option>
                  <option value="Fundraising Strategies">Fundraising Strategies</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}>
                Confirm Office Hours Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
