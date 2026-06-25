import React, { useState, useEffect } from 'react';
import { Trash2, Coins, Users, UserCheck, Bot } from 'lucide-react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface FundingScheme {
  id: string;
  name: string;
  provider: string;
  type: string;
  description: string;
  amount: string;
  equity: string;
  deadline: string;
  stages: string[];
  countries: string[];
  industries: string[];
}

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
  geography: string;
  stages: string[];
  image: string;
}

export default function Admin() {
  const [activeSec, setActiveSec] = useState<'grants' | 'investors' | 'mentors' | 'ai'>('grants');
  const [schemes, setSchemes] = useState<FundingScheme[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
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

  // AI Settings State
  const [aiPrimary, setAiPrimary] = useState('groq');
  const [aiSecondary, setAiSecondary] = useState('gemini');
  const [aiFallback, setAiFallback] = useState('ollama');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [aiStatus, setAiStatus] = useState<Record<string, string>>({});
  const [aiAnalytics, setAiAnalytics] = useState<Record<string, any>>({});
  const [aiTesting, setAiTesting] = useState<Record<string, boolean>>({});
  const [aiTestResults, setAiTestResults] = useState<Record<string, any>>({});
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schRes, invRes, menRes, aiRes, statusRes] = await Promise.all([
        apiFetch('/api/funding/schemes'),
        apiFetch('/api/network/investors'),
        apiFetch('/api/network/mentors'),
        apiFetch('/api/admin/ai/settings'),
        apiFetch('/api/admin/ai/status')
      ]);
      if (schRes.ok) setSchemes(await schRes.json());
      if (invRes.ok) setInvestors(await invRes.json());
      if (menRes.ok) setMentors(await menRes.json());
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.success) {
          setAiPrimary(aiData.settings.primary);
          setAiSecondary(aiData.settings.secondary);
          setAiFallback(aiData.settings.fallback);
          setOllamaModel(aiData.settings.ollama_model || 'llama3');
          setAiAnalytics(aiData.analytics);
        }
      }
      if (statusRes.ok) {
        setAiStatus(await statusRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName || !gProvider) return;

    try {
      const response = await apiFetch('/api/admin/grants', {
        method: 'POST',
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
      } else {
        showToast(data.error || 'Failed to add grant.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error adding grant.', 'error');
    }
  };

  const handleDeleteGrant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      const response = await apiFetch(`/api/admin/grants/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSchemes(schemes.filter(s => s.id !== id));
        showToast('Funding scheme deleted.', 'success');
      } else {
        showToast(data.error || 'Failed to delete grant.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error deleting grant.', 'error');
    }
  };

  const handleAddInvestor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iName || !iEmail) return;

    try {
      const response = await apiFetch('/api/admin/investors', {
        method: 'POST',
        body: JSON.stringify({
          name: iName,
          type: iType,
          ticketSize: iTicket,
          sectors: iSectors.split(',').map(s => s.trim()),
          geography: iGeo,
          readinessScore: Number(iScore),
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
      } else {
        showToast(data.error || 'Failed to add investor.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error adding investor.', 'error');
    }
  };

  const handleDeleteInvestor = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await apiFetch(`/api/admin/investors/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setInvestors(investors.filter(i => i.id !== id));
        showToast('Investor deleted.', 'success');
      } else {
        showToast(data.error || 'Failed to delete investor.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error deleting investor.', 'error');
    }
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName || !mRole) return;

    try {
      const response = await apiFetch('/api/admin/mentors', {
        method: 'POST',
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
      } else {
        showToast(data.error || 'Failed to add mentor.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error adding mentor.', 'error');
    }
  };

  const handleDeleteMentor = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await apiFetch(`/api/admin/mentors/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setMentors(mentors.filter(m => m.id !== id));
        showToast('Mentor deleted.', 'success');
      } else {
        showToast(data.error || 'Failed to delete mentor.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error deleting mentor.', 'error');
    }
  };

  const handleSaveAISettings = async () => {
    setSaveLoading(true);
    try {
      const response = await apiFetch('/api/admin/ai/settings', {
        method: 'POST',
        body: JSON.stringify({
          primary: aiPrimary,
          secondary: aiSecondary,
          fallback: aiFallback
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('AI priorities saved successfully!', 'success');
        const aiRes = await apiFetch('/api/admin/ai/settings');
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiAnalytics(aiData.analytics);
        }
      } else {
        showToast(data.error || 'Failed to save AI priorities.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error saving AI priorities.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOllamaModelChange = async (newModel: string) => {
    setOllamaModel(newModel);
    try {
      const response = await apiFetch('/api/admin/ai/model', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'ollama',
          model: newModel
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Ollama model switched to ${newModel}`, 'success');
      } else {
        showToast(data.error || 'Failed to switch Ollama model.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error switching Ollama model.', 'error');
    }
  };

  const handleTestProvider = async (provider: string) => {
    setAiTesting(prev => ({ ...prev, [provider]: true }));
    try {
      const response = await apiFetch(`/api/admin/ai/test/${provider}`, {
        method: 'POST'
      });
      const data = await response.json();
      setAiTestResults(prev => ({ ...prev, [provider]: data }));
      
      const [aiRes, statusRes] = await Promise.all([
        apiFetch('/api/admin/ai/settings'),
        apiFetch('/api/admin/ai/status')
      ]);
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setAiAnalytics(aiData.analytics);
      }
      if (statusRes.ok) {
        setAiStatus(await statusRes.json());
      }
      
      if (data.success) {
        showToast(`${provider.toUpperCase()} tested successfully!`, 'success');
      } else {
        showToast(`${provider.toUpperCase()} test failed. Check details.`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(`Connection error testing ${provider}.`, 'error');
    } finally {
      setAiTesting(prev => ({ ...prev, [provider]: false }));
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
          <button 
            onClick={() => setActiveSec('ai')}
            className={`sidebar-link ${activeSec === 'ai' ? 'active' : ''}`}
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          >
            <Bot size={16} /> AI Provider Settings
          </button>
        </div>

        {/* Right Side: Configuration Forms & Tables */}
        {loading ? (
          <div className="flex-center" style={{ padding: '3rem' }}>
            <div className="pulse-loader">
              <div className="pulse-bubble" />
              <div className="pulse-bubble" />
              <div className="pulse-bubble" />
            </div>
          </div>
        ) : activeSec === 'grants' ? (
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
        ) : activeSec === 'ai' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Provider Configuration */}
            <div className="glass-card">
              <h3>🤖 AI Provider Priority Routing</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Configure primary, secondary, and fallback providers. In case of API errors, rate limits, or quota limits, the system will dynamically failover down the priority list in real-time.
              </p>
              
              <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Primary AI Provider</label>
                  <select 
                    className="form-select" 
                    value={aiPrimary} 
                    onChange={e => setAiPrimary(e.target.value)}
                  >
                    <option value="groq">Groq (Llama 3.3)</option>
                    <option value="gemini">Gemini (2.5 Flash)</option>
                    <option value="ollama">Ollama (Local Models)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary AI Provider</label>
                  <select 
                    className="form-select" 
                    value={aiSecondary} 
                    onChange={e => setAiSecondary(e.target.value)}
                  >
                    <option value="groq">Groq (Llama 3.3)</option>
                    <option value="gemini">Gemini (2.5 Flash)</option>
                    <option value="ollama">Ollama (Local Models)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fallback AI Provider</label>
                  <select 
                    className="form-select" 
                    value={aiFallback} 
                    onChange={e => setAiFallback(e.target.value)}
                  >
                    <option value="groq">Groq (Llama 3.3)</option>
                    <option value="gemini">Gemini (2.5 Flash)</option>
                    <option value="ollama">Ollama (Local Models)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ollama Model (Local)</label>
                  <select 
                    className="form-select" 
                    value={ollamaModel} 
                    onChange={e => handleOllamaModelChange(e.target.value)}
                  >
                    <option value="llama3">Llama 3</option>
                    <option value="llama3.1">Llama 3.1</option>
                    <option value="qwen3">Qwen 3</option>
                    <option value="deepseek-r1">DeepSeek R1</option>
                    <option value="mistral">Mistral</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleSaveAISettings} 
                className="btn btn-primary"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save AI Priorities'}
              </button>
            </div>

            {/* Provider Status & Testing */}
            <div className="glass-card">
              <h3>🔌 Provider Status & Connection Testing</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Test connection integrity of individual model APIs. Real-time checks verify model availability.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {['groq', 'gemini', 'ollama'].map(prov => {
                  const status = aiStatus[prov] || 'checking';
                  const testRes = aiTestResults[prov];
                  const testing = aiTesting[prov];
                  
                  let badgeStyle = { 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    background: 'rgba(245, 158, 11, 0.1)', 
                    color: '#f59e0b', 
                    border: '1px solid rgba(245, 158, 11, 0.2)' 
                  };
                  if (status === 'online') {
                    badgeStyle = {
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: 600, 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      color: '#10b981', 
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    };
                  } else if (status === 'offline') {
                    badgeStyle = {
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.7rem', 
                      fontWeight: 600, 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: '#ef4444', 
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    };
                  }
                  
                  return (
                    <div 
                      key={prov} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem', 
                        padding: '1rem', 
                        borderRadius: '6px', 
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{prov}</span>
                          <span style={badgeStyle}>
                            {status === 'online' ? 'Online' : status === 'offline' ? 'Offline' : 'Checking...'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleTestProvider(prov)}
                          className="btn"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                          disabled={testing}
                        >
                          {testing ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                      
                      {testRes && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          padding: '0.5rem', 
                          borderRadius: '4px',
                          background: testRes.success ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.03)',
                          border: `1px solid ${testRes.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                        }}>
                          {testRes.success ? (
                            <div>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Success</span> ({testRes.responseTime}s):
                              <p style={{ marginTop: '0.25rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{testRes.response}"</p>
                            </div>
                          ) : (
                            <div>
                              <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ Failed</span>:
                              <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>{testRes.error}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Provider Analytics */}
            <div className="glass-card">
              <h3>📊 AI Provider Performance Analytics</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Usage Count</th>
                    <th>Average Latency</th>
                    <th>Failures</th>
                    <th>Fallback Triggers</th>
                    <th>Last Active Request</th>
                  </tr>
                </thead>
                <tbody>
                  {['groq', 'gemini', 'ollama'].map(prov => {
                    const stats = aiAnalytics[prov] || { usageCount: 0, averageResponseTime: 0.0, failureCount: 0, fallbackCount: 0, lastRequestTime: 'Never' };
                    return (
                      <tr key={prov}>
                        <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{prov}</td>
                        <td>{stats.usageCount} requests</td>
                        <td style={{ color: 'var(--secondary)' }}>{stats.averageResponseTime}s</td>
                        <td style={{ color: stats.failureCount > 0 ? '#ef4444' : 'inherit' }}>{stats.failureCount}</td>
                        <td style={{ color: stats.fallbackCount > 0 ? '#f59e0b' : 'inherit' }}>{stats.fallbackCount}</td>
                        <td>{stats.lastRequestTime}</td>
                      </tr>
                    );
                  })}
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
                    <input type="number" className="form-input" value={iScore} onChange={e => setIScore(Number(e.target.value))} />
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
