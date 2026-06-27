import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Mail, Lock, User, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { showToast } from '../../components/ui/Toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleClientId, googleLogin, verifyOtp, resendOtp } = useAuth();
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Verification State
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize Google Sign-in Button
  useEffect(() => {
    const google = (window as any).google;
    if (google && googleClientId && !showOtp) {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            setLoading(true);
            setError('');
            try {
              const success = await googleLogin(response.credential);
              if (success) {
                showToast('Successfully authenticated with Google!', 'success');
                navigate('/');
              } else {
                setError('Google authentication failed. Please try again.');
              }
            } catch (err) {
              setError('Failed to authenticate with Google.');
            } finally {
              setLoading(false);
            }
          }
        });
        
        const btnElem = document.getElementById('google-signup-button');
        if (btnElem) {
          google.accounts.id.renderButton(btnElem, {
            theme: 'outline',
            size: 'large',
            width: 390,
            logo_alignment: 'center'
          });
        }
      } catch (err) {
        console.error('Error rendering Google button:', err);
      }
    }
  }, [googleClientId, showOtp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) { 
      setError('Password must be at least 6 characters.'); 
      return; 
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await register(name, email, password);
      if (res.success) {
        if (res.requiresVerification) {
          setOtpEmail(email);
          setShowOtp(true);
          showToast('Verification code sent to your email!', 'success');
        } else {
          showToast('Successfully registered!', 'success');
          navigate('/');
        }
      } else {
        setError(res.message || 'Registration failed. Email may already be in use.');
      }
    } catch {
      setError('Connection error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await verifyOtp(otpEmail, otpCode);
      if (res.success) {
        showToast('Email verified successfully!', 'success');
        navigate('/');
      } else {
        setError(res.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch {
      setError('Connection error during email verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      const res = await resendOtp(otpEmail);
      if (res.success) {
        showToast('Verification OTP code resent successfully!', 'success');
      } else {
        setError(res.message || 'Failed to resend verification code.');
      }
    } catch {
      setError('Connection error.');
    }
  };

  return (
    <div className="onboard-container bg-grid-pattern" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="radial-glow-spot" style={{ top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(239, 43, 112, 0.04) 0%, transparent 70%)' }} />
      <div className="radial-glow-spot" style={{ bottom: '-15%', left: '-15%', background: 'radial-gradient(circle, rgba(107, 108, 255, 0.04) 0%, transparent 70%)' }} />

      <div className="onboard-card fade-in" style={{ maxWidth: '440px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(239, 43, 112, 0.25)',
            position: 'relative'
          }}>
            <Zap size={22} color="#fff" fill="#fff" />
            <div style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '14px',
              border: '1px solid rgba(239, 43, 112, 0.15)',
              animation: 'glowPulse 2s infinite',
              pointerEvents: 'none'
            }} />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>STUDLYF</h1>
        </div>

        {!showOtp ? (
          <>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Create your account</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Start your founder journey today</p>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
              <ShieldCheck size={48} />
            </div>
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Verify your email</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>We've sent a 6-digit OTP code and verification link to {otpEmail}</p>
          </>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px',
            fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500,
            wordBreak: 'break-word'
          }}>{error}</div>
        )}

        {!showOtp ? (
          <>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <User size={14} style={{ color: 'var(--primary)' }} /> Full Name
                </label>
                <input
                  type="text" className="form-input" placeholder="Alex Founder" style={{ width: '100%' }}
                  value={name} onChange={e => setName(e.target.value)} required
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Mail size={14} style={{ color: 'var(--primary)' }} /> Email address
                </label>
                <input
                  type="email" className="form-input" placeholder="founder@startup.io" style={{ width: '100%' }}
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Lock size={14} style={{ color: 'var(--primary)' }} /> Password
                </label>
                <input
                  type="password" className="form-input" placeholder="Minimum 6 characters" style={{ width: '100%' }}
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Creating account...' : <><UserPlus size={16} /> Create Account</>}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '1.5rem 0', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR REGISTER WITH</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div id="google-signup-button" style={{ minHeight: '40px', width: '100%' }}></div>
            </div>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <input
                type="text"
                className="form-input"
                maxLength={6}
                placeholder="000000"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '1.8rem',
                  letterSpacing: '8px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  padding: '0.75rem'
                }}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
              />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                For local dev: check the console or log file at <code>d:\cli\otp_emails.log</code>
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.875rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={() => setShowOtp(false)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-accent"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                onClick={handleResendOtp}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In <ArrowRight size={12} style={{ display: 'inline' }} />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
