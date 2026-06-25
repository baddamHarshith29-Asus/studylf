import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const ok = await register(name, email, password);
      if (ok) navigate('/');
      else setError('Registration failed. Email may already be in use.');
    } catch {
      setError('Connection error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboard-container">
      <div className="onboard-card" style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)'
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '1.6rem', margin: 0 }}>STUDLYF</h1>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Create your account</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>Start your founder journey today</p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px',
            fontSize: '0.85rem', marginBottom: '1.25rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={13} /> Full Name
            </label>
            <input
              type="text" className="form-input" placeholder="Alex Founder"
              value={name} onChange={e => setName(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={13} /> Email address
            </label>
            <input
              type="email" className="form-input" placeholder="founder@startup.io"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={13} /> Password
            </label>
            <input
              type="password" className="form-input" placeholder="Minimum 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

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
