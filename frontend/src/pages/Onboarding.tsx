import React, { useState } from 'react';
import { Upload, ArrowRight, Check, Sparkles } from 'lucide-react';
import { showToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';

const Onboarding: React.FC = () => {
  const { onboard } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [startupName, setStartupName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('AI & SaaS');
  const [country, setCountry] = useState('India');
  const [stage, setStage] = useState('Idea');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await apiFetch('/api/auth/parse-resume', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name })
      });
      const res = await response.json();
      if (res.success) {
        // Pre-fill profile fields based on mock parsing
        setName(res.data.name || '');
        setEmail(res.data.email || '');
        setStartupName(res.data.startupName || '');
        setDescription(res.data.description || '');
        setIndustry(res.data.industry || 'AI & SaaS');
        setCountry(res.data.country || 'India');
        setStage(res.data.stage || 'Idea');
        
        showToast(`Profile imported for ${res.data.name}!`, 'success');
        setStep(2); // Auto advance to review profile details
      } else {
        showToast(res.error || 'Failed to parse document.', 'error');
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      showToast('Error uploading resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (!email || !name)) {
      showToast('Please fill out your Name and Email to proceed.', 'warning');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupName) {
      showToast('Please provide your Startup Name.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const ok = await onboard({
        email,
        name,
        startupName,
        description,
        industry,
        country,
        stage
      });
      if (ok) {
        showToast('Onboarding completed successfully!', 'success');
      } else {
        showToast('Onboarding failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Onboarding failed:', error);
      showToast('Connection error during onboarding.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboard-container fade-in">
      <div className="onboard-card">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            marginBottom: '1rem',
            color: '#fff',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Empower Your Startup Journey</h2>
          <p>Let's configure your STUDLYF workspace in a couple of steps.</p>
        </div>

        {/* Step Indicator */}
        <div className="onboard-step-dots">
          <div className={`onboard-step-dot ${step === 1 ? 'active' : ''}`} />
          <div className={`onboard-step-dot ${step === 2 ? 'active' : ''}`} />
        </div>

        {loading ? (
          <div className="flex-center" style={{ flexDirection: 'column', height: '240px', gap: '1rem' }}>
            <div className="pulse-loader">
              <div className="pulse-bubble" />
              <div className="pulse-bubble" />
              <div className="pulse-bubble" />
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Processing credentials and setting up workspace...</span>
          </div>
        ) : step === 1 ? (
          /* Step 1: Create Account */
          <form onSubmit={handleNextStep} className="slide-up">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Step 1: Create Your Account</h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Sarah Connor" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="sarah@skynet.io" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Resume Upload / LinkedIn Import Box */}
            <div style={{
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              marginBottom: '2rem',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  opacity: 0, cursor: 'pointer'
                }}
              />
              <Upload size={28} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Auto-Fill Profile</h4>
              <p style={{ fontSize: '0.78rem' }}>Upload your resume or LinkedIn profile PDF to instantly pre-fill all startup fields.</p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Next: Startup Info <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* Step 2: Create Startup Profile */
          <form onSubmit={handleSubmit} className="slide-up">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Step 2: Startup Profile</h3>

            <div className="form-group">
              <label className="form-label">Startup Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Skynet Defender" 
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Startup Description</label>
              <textarea 
                className="form-textarea" 
                placeholder="Briefly describe what your startup builds..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry Sector</label>
                <select 
                  className="form-select" 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="AI & SaaS">AI & SaaS</option>
                  <option value="Fintech">Fintech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="EdTech">EdTech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="DeepTech">DeepTech</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Country</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="India" 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Current Venture Stage</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
                {['Idea', 'Validation', 'MVP', 'Revenue', 'Fundraising'].map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setStage(stg)}
                    className={`btn ${stage === stg ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      padding: '0.45rem 0.25rem', 
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '6px'
                    }}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="btn btn-accent" 
                style={{ flex: 2 }}
                disabled={loading}
              >
                Launch Workspace <Check size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
