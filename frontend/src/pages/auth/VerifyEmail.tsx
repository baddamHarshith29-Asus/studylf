import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, ShieldAlert, Loader2, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { showToast } from '../../components/ui/Toast';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmailLink } = useAuth();
  
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token. No token found in link.');
        return;
      }

      // Add a slight artificial delay for a premium loading animation experience
      const timer = setTimeout(async () => {
        try {
          const res = await verifyEmailLink(token);
          if (res.success) {
            setStatus('success');
            setMessage(res.message || 'Your email address has been successfully verified! Welcome to STUDLYF.');
            showToast('Email verified successfully!', 'success');
          } else {
            setStatus('error');
            setMessage(res.message || 'Failed to verify email. The link may have expired or is invalid.');
          }
        } catch (err) {
          setStatus('error');
          setMessage('A connection error occurred. Please try again.');
        }
      }, 1500);

      return () => clearTimeout(timer);
    };

    runVerification();
  }, [token]);

  return (
    <div className="onboard-container bg-grid-pattern" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="radial-glow-spot" style={{ top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(239, 43, 112, 0.04) 0%, transparent 70%)' }} />
      <div className="radial-glow-spot" style={{ bottom: '-15%', left: '-15%', background: 'radial-gradient(circle, rgba(107, 108, 255, 0.04) 0%, transparent 70%)' }} />

      <div className="onboard-card fade-in" style={{ maxWidth: '480px', position: 'relative', zIndex: 10, textAlign: 'center', padding: '3rem 2.5rem' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
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

        {status === 'verifying' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 className="spin-slow" size={64} style={{ color: 'var(--primary)', opacity: 0.8 }} />
              <div style={{
                position: 'absolute',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                animation: 'pulseGlow 1.5s infinite'
              }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Verifying Credentials</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              {message}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'scaleUp 0.4s ease-out' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--success)', boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)',
              position: 'relative'
            }}>
              <ShieldCheck size={40} />
              <Sparkles size={18} style={{ position: 'absolute', top: 5, right: 5, color: '#f59e0b', animation: 'floatEffect 2s infinite' }} />
            </div>
            
            <h2 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              {message}
            </p>
            
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              Go to Workspace <ArrowRight size={16} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', animation: 'scaleUp 0.4s ease-out' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--danger)', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)'
            }}>
              <ShieldAlert size={40} />
            </div>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--danger)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
              {message}
            </p>
            
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
