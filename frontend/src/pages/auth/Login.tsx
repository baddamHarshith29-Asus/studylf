import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Mail, Lock, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { showToast } from '../../components/ui/Toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../../services/firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleClientId, googleLogin, verifyOtp, resendOtp, adminBypass } = useAuth();
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP Verification State
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Firebase Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        const success = await googleLogin(idToken);
        if (success) {
          showToast('Successfully signed in with Google!', 'success');
          navigate('/');
        } else {
          setError('Google authentication failed on backend.');
        }
      } else {
        showToast('Firebase Google Sign-In not configured. Bypassing with Mock User...', 'info');
        const success = await googleLogin('mock_google_token');
        if (success) {
          showToast('Bypassed with Mock Google User!', 'success');
          navigate('/');
        } else {
          setError('Bypass authentication failed.');
        }
      }
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      showToast('Firebase Google Sign-In failed. Bypassing with Mock User...', 'warning');
      try {
        const success = await googleLogin('mock_google_token');
        if (success) {
          showToast('Bypassed with Mock Google User!', 'success');
          navigate('/');
        } else {
          setError(err.message || 'Failed to authenticate with Google via Firebase.');
        }
      } catch (mockErr) {
        setError(err.message || 'Failed to authenticate with Google via Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Direct Bypass Enter
  const handleAdminBypass = async () => {
    setLoading(true);
    setError('');
    try {
      const success = await adminBypass();
      if (success) {
        showToast('Successfully entered workspace as Admin!', 'success');
        navigate('/');
      } else {
        setError('Admin direct access failed.');
      }
    } catch {
      setError('Connection error during admin access bypass.');
    } finally {
      setLoading(false);
    }
  };

  // Keep standard Google Identity Services button as dynamic fallback if Google Client ID is configured and Firebase is not
  useEffect(() => {
    if (isFirebaseConfigured) return;
    
    const googleObj = (window as any).google;
    if (googleObj && googleClientId && !showOtp) {
      try {
        googleObj.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            setLoading(true);
            setError('');
            try {
              const success = await googleLogin(response.credential);
              if (success) {
                showToast('Successfully signed in with Google!', 'success');
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
        
        const btnElem = document.getElementById('google-signin-button');
        if (btnElem) {
          googleObj.accounts.id.renderButton(btnElem, {
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
    if (!email || !password) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Successfully signed in!', 'success');
        navigate('/');
      } else if (res.requiresVerification) {
        setOtpEmail(email);
        setShowOtp(true);
        showToast('Verification required. Code sent to email.', 'warning');
      } else {
        setError(res.message || 'Invalid email or password. Please try again.');
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
        showToast('Email verified and signed in!', 'success');
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
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Welcome back</h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sign in to your founder workspace</p>
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
            {/* Direct Admin Bypass button at top of form */}
            <button
              type="button"
              className="btn btn-accent"
              style={{
                width: '100%',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                marginBottom: '1.5rem',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
              onClick={handleAdminBypass}
              disabled={loading}
            >
              <ShieldCheck size={18} /> Direct Enter Workspace (Admin)
            </button>

            <form onSubmit={handleSubmit}>
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
                  type="password" className="form-input" placeholder="••••••••" style={{ width: '100%' }}
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Signing in...' : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '1.5rem 0', gap: '1rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR SIGN IN WITH</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              {isFirebaseConfigured ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.93 5.482 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.55 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.32 0 2.505.453 3.44 1.348l2.582-2.58C13.463.893 11.426 0 9 0 5.482 0 2.438 2.07 1.057 5.061l3.007 2.332c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
                  </svg>
                  Sign In with Google
                </button>
              ) : (
                <>
                  <div id="google-signin-button" style={{ minHeight: '40px', width: '100%' }}></div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      border: '1px dashed rgba(6, 182, 212, 0.4)',
                      color: 'var(--secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    Sign In with Google (Mock / Bypass)
                  </button>
                </>
              )}
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
              {loading ? 'Verifying...' : 'Verify & Sign In'}
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
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register <ArrowRight size={12} style={{ display: 'inline' }} />
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
