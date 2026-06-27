import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Check } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Creator',
      price: '₹0',
      period: 'Forever Free',
      desc: 'Perfect for student founders validating their first startup idea.',
      features: [
        'AI Startup Validation (3 scans/mo)',
        'Founder Roadmap GPS checklists',
        'Standard Tech Build Advisor',
        'Resources template library access'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '₹0',
      period: 'Billed monthly (Demo mode)',
      desc: 'For active startups seeking funding, accelerators, and network discovery.',
      features: [
        'Unlimited AI validation reports',
        'Full Funding Navigator & calendar alerts',
        'Investor directory filtering & readiness quiz',
        'Cal.com-style calendar mentor bookings',
        '3-Round AI Mock Interview assessments'
      ],
      cta: 'Start Pro Free Trial',
      popular: true
    },
    {
      name: 'Pro Plus',
      price: '₹0',
      period: 'Billed monthly (Demo mode)',
      desc: 'Tailored for campus incubators managing multiple startup teams.',
      features: [
        'All Pro founder features included',
        'Institutional hackathon management dashboard',
        'Blind rubrics judging panel invitations',
        'Manual coding evaluation dashboards',
        'Automated QR-verifiable certificate builder'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

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
            <Link to="/about" style={{ color: '#4b5563', textDecoration: 'none' }}>About</Link>
            <Link to="/blog" style={{ color: '#4b5563', textDecoration: 'none' }}>Blog</Link>
            <Link to="/pricing" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Pricing</Link>
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

      {/* Main Content */}
      <main style={{ flex: 1, padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-1.5px', fontFamily: 'var(--font-heading)' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
            Demo billing is currently set to ₹0. Explore all platform capabilities with absolute ease.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '2rem', alignItems: 'stretch' }}>
          {plans.map((plan, index) => (
            <div key={index} className="glass-card" style={{
              padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
              border: plan.popular ? '2px solid var(--primary)' : '1px solid #e5e7eb',
              borderRadius: '16px', background: '#ffffff', position: 'relative'
            }}>
              {plan.popular && (
                <span style={{
                  position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                  padding: '0.25rem 0.75rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>Most Popular</span>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{plan.name}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.88rem', minHeight: '40px' }}>{plan.desc}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{plan.price}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>/ {plan.period}</span>
              </div>

              <button
                onClick={() => navigate('/register')}
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px' }}
              >
                {plan.cta}
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb' }} />

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {plan.features.map((feat, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.4 }}>
                    <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        © 2026 StudLyf Inc. Madhapur, Hyderabad, Telangana.
      </footer>
    </div>
  );
}
