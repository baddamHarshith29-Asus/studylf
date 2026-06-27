import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowRight, Sparkles, Map, DollarSign, Users, Cpu, ChevronDown, Check, Star, Quote, MessageSquare } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const audiences = [
    {
      title: 'Founders & Early Teams',
      badge: 'Build Fast',
      desc: 'Formulate, check viability, and iterate from day zero with automated toolsets.',
      bullets: ['Competitive SWOT & GAP scans', 'AI cofounder milestone roadmaps', 'Corporate legal template catalog']
    },
    {
      title: 'Student Entrepreneurs',
      badge: 'Learn & Launch',
      desc: 'Bridge academic milestones and start building scalable products in college.',
      bullets: ['Step-by-step business guides', 'National hackathon trackers', 'Direct peer build-groups']
    },
    {
      title: 'Pre-Incubators',
      badge: 'Structure Ideas',
      desc: 'Structure early pipeline programs and validate student ideas at scale.',
      bullets: ['Automated cohort tracking', 'Early validation rubrics', 'Student team directories']
    },
    {
      title: 'Incubators & Accelerators',
      badge: 'Manage Cohorts',
      desc: 'Ditch spreadsheets. Run application cycles, milestones, and grading rules.',
      bullets: ['Custom application builder', 'Incubator cohort progress tracking', 'Cal.com-style calendar syncs']
    },
    {
      title: 'Mentors & Coaches',
      badge: 'Guide Teams',
      desc: 'Provide targeted feedback and manage session bookings with students.',
      bullets: ['Profile discovery page', 'Milestone-based feedback logs', 'One-click meeting bookings']
    },
    {
      title: 'Agencies & Consultants',
      badge: 'Deliver Services',
      desc: 'Offer professional design, legal, or development services directly to startups.',
      bullets: ['Verified provider badge', 'Client engagement dashboard', 'Secure contract templates']
    },
    {
      title: 'Investors & VCs',
      badge: 'Find Dealflow',
      desc: 'Monitor high-potential student startups and review pitch deck pipelines.',
      bullets: ['Custom metrics tracking', 'Direct startup chat channels', 'Curated pipeline index reports']
    },
    {
      title: 'University Innovation Labs',
      badge: 'Track Impact',
      desc: 'Manage and display state-level compliance reports, patents, and grants.',
      bullets: ['DPIIT registry synchronization', 'QR-verifiable certificates', 'Annual report aggregators']
    }
  ];

  const testimonials = [
    {
      initials: 'SK',
      name: 'Sandeep Kumar',
      role: 'Founder, PaySpeed',
      quote: 'StudLyf completely changed how we approached our seed pitch. The AI pitch deck review saved us weeks of formatting mistakes and directly led to our first institutional investment.'
    },
    {
      initials: 'AM',
      name: 'Dr. Anjali Mehta',
      role: 'Director, TechHub Incubator',
      quote: 'Managing student startups used to be a spreadsheet nightmare. With StudLyf, we can easily track cohort milestones, invite external mentors, and issue certified awards automatically.'
    },
    {
      initials: 'RV',
      name: 'Rohan Verma',
      role: 'Student, IIT Madras',
      quote: 'The week-by-week roadmap is like a GPS. I always knew what I had to do next to qualify for state-level student entrepreneur grants, and we actually won our first grant last month!'
    }
  ];

  const faqs = [
    {
      q: 'How does the AI validation engine search for competitors?',
      a: 'The validation engine performs parallel real-time searches across databases and search index APIs to compile live competitor SWOT analysis and market sizing estimates tailored to your startup concept.'
    },
    {
      q: 'Can our college incubator run custom hackathons here?',
      a: 'Yes. The institutional suite offers direct cohort dashboard setups, customized grading rubrics, peer reviews, and cryptographically verified certificate distributions via QR codes.'
    },
    {
      q: 'How does the LinkedIn connections CSV recommender work?',
      a: 'You can export your connections as a CSV directly from LinkedIn and drop it into our secure reader. We parse local nodes to locate and rank prospective technical advisors, mentors, or initial angel investors near you.'
    },
    {
      q: 'Is there a limit to how many roadmaps I can create?',
      a: 'Free accounts can customize 1 active week-by-week stage-appropriate roadmap. Pro users unlock unlimited active roadmap timelines, grant calendars, and continuous AI mock interviews.'
    },
    {
      q: 'Are the resources and legal templates legally vetted?',
      a: 'Yes, our template directories contain standard cofounder agreements, NDAs, and articles of association reviewed for current regulatory compliance under regional Indian corporate guidelines.'
    },
    {
      q: 'How can I redeem a startup mentor discount coupon?',
      a: 'Incubator directors can issue program coupon codes. You can apply these codes during the ₹0 checkouts in the billing page to access premium features immediately.'
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#111827', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      
      {/* Sticky Glassmorphism Header Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', padding: '1rem 2.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: '#111827' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} fill="#fff" color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>STUDLYF</span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '2rem', fontSize: '0.92rem', fontWeight: 600, alignItems: 'center' }}>
            <a href="#hero" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }} className="nav-hover-link">Live Demo</a>
            <Link to="/about" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }} className="nav-hover-link">About Us</Link>
            
            {/* Solutions Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowSolutions(!showSolutions); setShowTools(false); }}
                style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                Solutions <ChevronDown size={14} />
              </button>
              {showSolutions && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem', width: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <a href="#audiences" onClick={() => setShowSolutions(false)} style={{ padding: '0.5rem', color: '#111827', textDecoration: 'none', fontSize: '0.88rem', borderRadius: '4px' }} className="dropdown-item-hover">For Founders</a>
                  <a href="#audiences" onClick={() => setShowSolutions(false)} style={{ padding: '0.5rem', color: '#111827', textDecoration: 'none', fontSize: '0.88rem', borderRadius: '4px' }} className="dropdown-item-hover">For Incubators</a>
                  <a href="#audiences" onClick={() => setShowSolutions(false)} style={{ padding: '0.5rem', color: '#111827', textDecoration: 'none', fontSize: '0.88rem', borderRadius: '4px' }} className="dropdown-item-hover">For VCs & Mentors</a>
                </div>
              )}
            </div>

            {/* Free Tools Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowTools(!showTools); setShowSolutions(false); }}
                style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '0.92rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
              >
                Free Tools <ChevronDown size={14} />
              </button>
              {showTools && (
                <div style={{ position: 'absolute', top: '100%', left: 0, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0.5rem', width: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <span style={{ padding: '0.5rem', color: '#111827', fontSize: '0.88rem', cursor: 'default' }}>AI Validation Scan</span>
                  <span style={{ padding: '0.5rem', color: '#111827', fontSize: '0.88rem', cursor: 'default' }}>Grants Calendar Preview</span>
                  <span style={{ padding: '0.5rem', color: '#111827', fontSize: '0.88rem', cursor: 'default' }}>Cofounder Equity Splitter</span>
                </div>
              )}
            </div>

            <Link to="/pricing" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }} className="nav-hover-link">Pricing</Link>
          </nav>

          {/* Auth Actions */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <Link to="/login" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.92rem', fontWeight: 600 }}>Login</Link>
            <button 
              onClick={() => navigate('/register')} 
              className="btn btn-primary premium-hover-scale" 
              style={{ padding: '0.6rem 1.4rem', fontSize: '0.88rem', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Get started for free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" style={{ padding: '7rem 2rem 6rem', borderBottom: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
        {/* Colorful gradient background blobs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239, 43, 112, 0.035) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-15%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107, 108, 255, 0.035) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          {/* Trust Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '0.4rem 1.1rem', borderRadius: '99px', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>5/5 from 1,068 customers</span>
          </div>

          <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 43, 112, 0.05)', border: '1px solid rgba(239, 43, 112, 0.12)', padding: '0.4rem 1rem', borderRadius: '99px', marginBottom: '2rem' }}>
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>THE STUDLYF STARTUP GPS</span>
          </div>

          <h1 style={{ fontSize: '3.75rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1.8px', fontFamily: 'var(--font-heading)' }}>
            The GPS for Building a <span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Startup in India</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '750px', margin: '0 auto 3rem', lineHeight: 1.65, fontWeight: 450 }}>
            Where you are, what you should do next, and how to get where you want to go. We combine AI validation, week-by-week roadmaps, grant calendars, and relationship networks in one ecosystem.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '4.5rem' }}>
            <button 
              onClick={() => navigate('/register')} 
              className="btn btn-primary premium-hover-scale" 
              style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, border: 'none', background: 'var(--primary)', color: '#fff' }}
            >
              Get started. It's Free <ArrowRight size={18} />
            </button>
            
            <button 
              onClick={() => navigate('/login')} 
              className="premium-hover-scale"
              style={{ padding: '1rem 2.25rem', fontSize: '1.05rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, background: '#ffffff', border: '1px solid #d1d5db', color: 'var(--secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
            >
              Live Demo
            </button>
          </div>

          {/* Grayscale partner logos */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#9ca3af', fontWeight: 700, marginBottom: '1.5rem' }}>
              PROUDLY ASSOCIATED WITH
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3.5rem', flexWrap: 'wrap', opacity: 0.65 }}>
              {/* Google for Startups */}
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4b5563', letterSpacing: '-0.5px' }}>Google Cloud</span>
              {/* Microsoft */}
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4b5563', letterSpacing: '-0.5px' }}>Microsoft Startups</span>
              {/* Y Combinator */}
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e05315', fontFamily: 'monospace' }}>Y Combinator</span>
              {/* AWS */}
              <span style={{ fontSize: '1.1rem', fontWeight: 850, color: '#4b5563' }}>AWS Activate</span>
              {/* T-Hub */}
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4b5563', letterSpacing: '0.5px' }}>T-HUB HQ</span>
            </div>
          </div>

        </div>
      </section>

      {/* Expanded Target Audiences (8 Grid Cards) */}
      <section id="audiences" style={{ padding: '6rem 2rem', background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Who Uses StudLyf?</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.5rem', letterSpacing: '-0.9px', fontFamily: 'var(--font-heading)' }}>
              From Founders to VCs — The Collaborative Network
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#4b5563', maxWidth: '600px', margin: '0.75rem auto 0', lineHeight: 1.5 }}>
              We connect student builders, incubation programs, service providers, and venture capitalists in a structured digital workspace.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '2rem' }}>
            {audiences.map((aud, index) => (
              <div key={index} className="glass-card" style={{ padding: '2rem 1.75rem', border: '1px solid #e5e7eb', background: '#ffffff', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.62rem', padding: '0.15rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>{aud.badge}</span>
                  <span style={{ fontSize: '1.25rem' }}>🎯</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{aud.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5, minHeight: '40px' }}>{aud.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {aud.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#4b5563' }}>
                      <Check size={12} style={{ color: 'var(--secondary)' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Success stories */}
      <section style={{ padding: '6rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Testimonials</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.5rem', letterSpacing: '-0.9px', fontFamily: 'var(--font-heading)' }}>
              Built by Founders, Trusted by Ecosystems
            </h2>
          </div>

          <div className="grid-3" style={{ gap: '2rem' }}>
            {testimonials.map((test, index) => (
              <div key={index} className="glass-card" style={{ padding: '2.5rem 2rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Quote size={24} style={{ color: 'var(--primary)', opacity: 0.3 }} />
                <p style={{ fontSize: '0.92rem', color: '#4b5563', lineHeight: 1.6, fontStyle: 'italic', flex: 1 }}>
                  "{test.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {test.initials}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0 }}>{test.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ padding: '6rem 2rem', background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>FAQs</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginTop: '0.5rem', letterSpacing: '-0.9px', fontFamily: 'var(--font-heading)' }}>
              Frequently Asked Questions
            </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} style={{
                  background: '#ffffff', border: '1px solid #e5e7eb',
                  borderRadius: '10px', overflow: 'hidden', transition: 'all 0.2s',
                  boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.02)' : 'none'
                }}>
                  <button
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '1.35rem 1.75rem', textAlign: 'left', cursor: 'pointer',
                      fontSize: '1rem', fontWeight: 700, color: '#111827', gap: '1.5rem'
                    }}
                  >
                    <span style={{ flex: 1 }}>{faq.q}</span>
                    <span style={{ 
                      fontSize: '1.4rem', color: 'var(--primary)', fontWeight: 'bold',
                      transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s'
                    }}>+</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 1.75rem 1.5rem', fontSize: '0.92rem', color: '#4b5563', lineHeight: 1.65, borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ padding: '6rem 2rem', background: '#ffffff', borderBottom: '1px solid #e5e7eb', textAlign: 'center', position: 'relative' }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(239, 43, 112, 0.02) 0%, rgba(107, 108, 255, 0.02) 100%)',
          border: '1px solid #e5e7eb', borderRadius: '24px', padding: '5rem 3rem', position: 'relative', overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '-1px', fontFamily: 'var(--font-heading)' }}>
            StudLyf: Your Startup Best Friend
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Ready to track your milestones, review your pitch decks, and validate your business ideas? Launch your workspace in less than 2 minutes.
          </p>
          <button 
            onClick={() => navigate('/register')} 
            className="btn btn-primary premium-hover-scale" 
            style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Get started for free
          </button>
        </div>
      </section>

      {/* Detailed Footer */}
      <footer style={{ padding: '5rem 2.5rem 3rem', background: '#ffffff', fontSize: '0.88rem', color: '#4b5563', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: '3rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            
            {/* Logo, Bio & Socials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Zap size={14} fill="#fff" color="#fff" />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', fontFamily: 'var(--font-heading)' }}>STUDLYF</span>
              </div>
              <p style={{ lineHeight: 1.5, color: '#6b7280', maxWidth: '280px' }}>
                India's first student startup stage navigator. Providing digital GPS roadmaps, mentor bookings, and AI validations.
              </p>
              
              {/* Social icons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none' }} className="social-icon-hover">In</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none' }} className="social-icon-hover">Yt</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none' }} className="social-icon-hover">𝕏</a>
              </div>
            </div>

            {/* Offices Hyderabad */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 700, color: '#111827', letterSpacing: '0.5px' }}>Hyderabad HQ</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#6b7280', lineHeight: 1.4 }}>
                <span>T-Hub Campus, Madhapur</span>
                <span>Hyderabad, Telangana</span>
                <span>500081, India</span>
                <span style={{ color: 'var(--primary)', fontWeight: 500 }}>info@studlyf.in</span>
              </div>
            </div>

            {/* Offices SF */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 700, color: '#111827', letterSpacing: '0.5px' }}>San Francisco</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#6b7280', lineHeight: 1.4 }}>
                <span>44 Tehama St</span>
                <span>San Francisco, CA</span>
                <span>94105, USA</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 500 }}>sf@studlyf.com</span>
              </div>
            </div>

            {/* Platform Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 700, color: '#111827', letterSpacing: '0.5px' }}>Ecosystem Links</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontWeight: 500 }}>
                <Link to="/about" style={{ color: '#4b5563', textDecoration: 'none' }} className="nav-hover-link">About Us</Link>
                <Link to="/blog" style={{ color: '#4b5563', textDecoration: 'none' }} className="nav-hover-link">Blog & News</Link>
                <Link to="/pricing" style={{ color: '#4b5563', textDecoration: 'none' }} className="nav-hover-link">Pricing Plans</Link>
                <span style={{ color: '#9ca3af', cursor: 'default' }}>Terms of Service</span>
                <span style={{ color: '#9ca3af', cursor: 'default' }}>Privacy Policy</span>
              </div>
            </div>

          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '2rem 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
            <span>© 2026 StudLyf Inc. All rights reserved.</span>
            <span>Made with ❤️ for Indian Builders.</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
