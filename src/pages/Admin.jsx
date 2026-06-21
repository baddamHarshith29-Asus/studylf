import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, CheckCircle2, AlertCircle, Coins, Users, UserCheck } from 'lucide-react';
import { showToast } from '../components/Toast';

export default function Admin() {
  const [activeSec, setActiveSec] = useState('grants');
  const [schemes, setSchemes] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grant Form State
  const [gName, setGName] = useState('');
  const [gProvider, setGProvider] = useState('');
  const [gType, setGType] = useState('Grant / Debt');
  const [gDesc, setGDesc] = useState('');
  const [gAmount, setGAmount] = useState('');
  const [gEquity, setGEquity] = useState('');
  const [gDeadline, setGDeadline] = useState('');
  const [gLink, setGLink] = useState('');

  // Investor Form State
  const [iName, setIName] = useState('');
  const [iType, setIType] = useState('Venture Capital');
  const [iTicket, setITicket] = useState('');
  const [iSectors, setISectors] = useState('');
  const [iGeo, setIGeo] = useState('');
  const [iScore, setIScore] = useState(80);
  const [iEmail, setIEmail] = useState('');

  // Mentor Form State
  const [mName, setMName] = useState('');
  const [mRole, setMRole] = useState('');
  const [mExpertise, setMExpertise] = useState('');
  const [mAvail, setMAvail] = useState('');
  const [mExp, setMExp] = useState('');
  const [mGeo, setMGeo] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schRes, invRes, menRes] = await Promise.all([
        fetch('/api/funding/schemes'),
        fetch('/api/network/investors'),
        fetch('/api/network/mentors')
      ]);
      setSchemes(await schRes.json());
      setInvestors(await invRes.json());
      setMentors(await menRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrant = async (e) => {
    e.preventDefault();
    if (!gName || !gProvider) return;

    try {
      const response = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gName,
          provider: gProvider,
          type: gType,
          description: gDesc,
          amount: gAmount,
          equity: gEquity,
          deadline: gDeadline,
          applyLink: gLink,
          stages: ['Idea', 'Validation', 'MVP'],
          countries: ['India'],
          industries: ['Any']
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('New funding scheme added!', 'success');
        setSchemes([...schemes, data.scheme]);
        // Reset form
        setGName(''); setGProvider(''); setGDesc(''); setGAmount(''); setGEquity(''); setGDeadline(''); setGLink('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGrant = async (id) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      const response = await fetch(`/api/admin/grants/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSchemes(schemes.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInvestor = async (e) => {
    e.preventDefault();
    if (!iName || !iEmail) return;

    try {
      const response = await fetch('/api/admin/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: iName,
          type: iType,
          ticketSize: iTicket,
          sectors: iSectors.split(',').map(s => s.trim()),
          geography: iGeo,
          readinessScore: parseInt(iScore),
          matchReason: 'Added by Admin ops team.',
          contactEmail: iEmail,
          stages: ['Idea', 'Validation', 'MVP', 'Revenue']
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('New investor added!', 'success');
        setInvestors([...investors, data.investor]);
        // Reset Form
        setIName(''); setITicket(''); setISectors(''); setIGeo(''); setIEmail('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInvestor = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/admin/investors/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setInvestors(investors.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    if (!mName || !mRole) return;

    try {
      const response = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mName,
          role: mRole,
          expertise: mExpertise.split(',').map(ex => ex.trim()),
          availability: mAvail,
          experience: mExp,
          geography: mGeo,
          stages: ['Idea', 'Validation', 'MVP'],
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('New mentor added!', 'success');
        setMentors([...mentors, data.mentor]);
        // Reset form
        setMName(''); setMRole(''); setMExpertise(''); setMAvail(''); setMExp(''); setMGeo('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMentor = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/admin/mentors/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setMentors(mentors.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Operations Admin Panel</h2>
          <p>Maintain the database integrity. Create, delete, or modify structural schemes and listings.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
        
        {/* Left Side: Operations Submenu */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-start', padding: '1rem' }}>
          <button 
            onClick={() => setActiveSec('grants')}
            className={`sidebar-link ${activeSec === 'grants' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Coins size={16} /> Manage Grants
          </button>
          <button 
            onClick={() => setActiveSec('investors')}
            className={`sidebar-link ${activeSec === 'investors' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Users size={16} /> Manage Investors
          </button>
          <button 
            onClick={() => setActiveSec('mentors')}
            className={`sidebar-link ${activeSec === 'mentors' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <UserCheck size={16} /> Manage Mentors
          </button>
        </div>

        {/* Right Side: Configuration Forms & Tables */}
        {activeSec === 'grants' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Create Scheme */}
            <div className="glass-card">
              <h3>➕ Add New Funding Scheme</h3>
              <form onSubmit={handleAddGrant} style={{ marginTop: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Program Name</label>
                    <input type="text" className="form-input" placeholder="e.g. SISFS Tech Grant" value={gName} onChange={e => setGName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Provider Organization</label>
                    <input type="text" className="form-input" placeholder="e.g. DPIIT Hub" value={gProvider} onChange={e => setGProvider(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={gType} onChange={e => setGType(e.target.value)}>
                      <option value="Grant / Debt">Grant / Debt</option>
                      <option value="Accelerator">Accelerator</option>
                      <option value="Credits">Credits</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Support Amount</label>
                    <input type="text" className="form-input" placeholder="e.g. ₹50 Lakhs" value={gAmount} onChange={e => setGAmount(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Equity Terms</label>
                    <input type="text" className="form-input" placeholder="e.g. 0% Non-dilutive" value={gEquity} onChange={e => setGEquity(e.target.value)} />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input type="text" className="form-input" placeholder="e.g. 2026-09-30" value={gDeadline} onChange={e => setGDeadline(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Link</label>
                    <input type="text" className="form-input" placeholder="e.g. https://apply.in" value={gLink} onChange={e => setGLink(e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Detail the criteria requirements..." value={gDesc} onChange={e => setGDesc(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary">Save Scheme</button>
              </form>
            </div>

            {/* List Table */}
            <div className="glass-card">
              <h3>Active Funding Directory</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Scheme Name</th>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schemes.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.provider}</td>
                      <td><span className="badge badge-primary">{s.type}</span></td>
                      <td>{s.deadline}</td>
                      <td>
                        <button onClick={() => handleDeleteGrant(s.id)} className="btn" style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ) : activeSec === 'investors' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Create Investor */}
            <div className="glass-card">
              <h3>➕ Add New Matchmaking Investor</h3>
              <form onSubmit={handleAddInvestor} style={{ marginTop: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Investor Name / Fund</label>
                    <input type="text" className="form-input" placeholder="e.g. Peak XV" value={iName} onChange={e => setIName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input type="email" className="form-input" placeholder="e.g. contact@fund.com" value={iEmail} onChange={e => setIEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Investor Type</label>
                    <select className="form-select" value={iType} onChange={e => setIType(e.target.value)}>
                      <option value="Venture Capital">Venture Capital</option>
                      <option value="Angel Investor">Angel Investor</option>
                      <option value="Micro-VC">Micro-VC</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ticket Size Range</label>
                    <input type="text" className="form-input" placeholder="e.g. $100K - $500K" value={iTicket} onChange={e => setITicket(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Base Match Score (0-100)</label>
                    <input type="number" className="form-input" value={iScore} onChange={e => setIScore(e.target.value)} />
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Sectors (Comma separated)</label>
                    <input type="text" className="form-input" placeholder="e.g. AI, SaaS, Fintech" value={iSectors} onChange={e => setISectors(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Geography Focus</label>
                    <input type="text" className="form-input" placeholder="e.g. India" value={iGeo} onChange={e => setIGeo(e.target.value)} />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">Save Investor</button>
              </form>
            </div>

            {/* List Investors */}
            <div className="glass-card">
              <h3>Active Investors Directory</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Investor Name</th>
                    <th>Type</th>
                    <th>Ticket Size</th>
                    <th>Sectors</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investors.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.name}</td>
                      <td>{inv.type}</td>
                      <td style={{ color: 'var(--secondary)' }}>{inv.ticketSize}</td>
                      <td>{inv.sectors.join(', ')}</td>
                      <td>
                        <button onClick={() => handleDeleteInvestor(inv.id)} className="btn" style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          /* Mentors Configuration */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div className="glass-card">
              <h3>➕ Add New Mentor listing</h3>
              <form onSubmit={handleAddMentor} style={{ marginTop: '1.25rem' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="e.g. Amit Verma" value={mName} onChange={e => setMName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Current Role / Bio</label>
                    <input type="text" className="form-input" placeholder="e.g. GTM expert, Ex-BrowserStack" value={mRole} onChange={e => setMRole(e.target.value)} required />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">Expertise (Comma separated)</label>
                    <input type="text" className="form-input" placeholder="e.g. Sales, PM" value={mExpertise} onChange={e => setMExpertise(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Availability Description</label>
                    <input type="text" className="form-input" placeholder="e.g. 1 hour/week" value={mAvail} onChange={e => setMAvail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-input" placeholder="e.g. India" value={mGeo} onChange={e => setMGeo(e.target.value)} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Work Experience Summary</label>
                  <textarea className="form-textarea" placeholder="Detail history scaling startups..." value={mExp} onChange={e => setMExp(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary">Save Mentor</button>
              </form>
            </div>

            <div className="glass-card">
              <h3>Active Mentors Directory</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mentor Name</th>
                    <th>Role</th>
                    <th>Expertise</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.role}</td>
                      <td>{m.expertise.join(', ')}</td>
                      <td style={{ color: 'var(--secondary)' }}>{m.availability}</td>
                      <td>
                        <button onClick={() => handleDeleteMentor(m.id)} className="btn" style={{ padding: '0.25rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
