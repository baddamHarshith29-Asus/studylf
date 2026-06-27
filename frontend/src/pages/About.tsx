import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Heart, Award, Shield } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#111827', fontFamily: 'var(--font-sans)' }}>
      {/* Sticky Header Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#111827' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} fill="#fff" color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>STUDLYF</span>
          </Link>

          <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.92rem', fontWeight: 600 }}>
            <Link to="/about" style={{ color: 'var(--primary)', textDecoration: 'none' }}>About</Link>
            <Link to="/blog" style={{ color: '#4b5563', textDecoration: 'none' }}>Blog</Link>
            <Link to="/pricing" style={{ color: '#4b5563', textDecoration: 'none' }}>Pricing</Link>
          </nav>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '5rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-1px', fontFamily: 'var(--font-heading)' }}>
          About StudLyf
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: 1.7, marginBottom: '2rem' }}>
          StudLyf is on a mission to democratize startup execution across India. Founded in 2026, we believe that high-quality, structured support shouldn't be limited to founders in metro cities. Whether you are building in Warangal, Coimbatore, or Hyderabad, StudLyf provides the digital map and tools to guide you from initial validation to institutional funding.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Our Values</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Heart size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Founder First</h3>
              <p style={{ color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.5 }}>Every tool, template, and roadmap sequence is designed specifically to simplify workflows for startup builders, prioritizing their growth and time above all.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--secondary-glow)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Ecosystem Excellence</h3>
              <p style={{ color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.5 }}>We partner with universities, state accelerators, and investors to build a verifiable talent pipeline and unlock national opportunities.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Absolute Compliance</h3>
              <p style={{ color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.5 }}>Our tools and directories (like relationship intelligence and legal contracts) operate in strict alignment with regional security and DPDP digital protection laws.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        © 2026 StudLyf Inc. Madhapur, Hyderabad, Telangana.
      </footer>
    </div>
  );
}
