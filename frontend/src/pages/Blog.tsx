import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Calendar, User, ArrowRight } from 'lucide-react';

export default function Blog() {
  const navigate = useNavigate();

  const posts = [
    {
      id: 1,
      title: 'How to Qualify for State-Level Startup Grants in Telangana',
      excerpt: 'Navigating government schemes like T-Hub and KSUM can be confusing. Here is a breakdown of DPIIT registration and eligibility criteria.',
      author: 'Aravind K.',
      date: 'June 18, 2026',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Mastering the AI Pitch Deck Review Checklist',
      excerpt: 'What do VCs actually look for on your slides? Discover how to present your TAM, SAM, and SOM metrics effectively to raise your Seed round.',
      author: 'Sneha Reddy',
      date: 'May 28, 2026',
      readTime: '6 min read'
    },
    {
      id: 3,
      title: 'Vite vs. Next.js: Tech Stack Selection for Non-Technical Founders',
      excerpt: 'Should you prioritize speed or SEO? In this guide, our Build Advisor breaks down realistic monthly hosting and development costs.',
      author: 'Vikram Sen',
      date: 'May 12, 2026',
      readTime: '4 min read'
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
            <Link to="/blog" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Blog</Link>
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

      {/* Main Content */}
      <main style={{ flex: 1, padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2.5rem', letterSpacing: '-1px', fontFamily: 'var(--font-heading)' }}>
          Ecosystem Blog
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {posts.map((post) => (
            <article key={post.id} className="glass-card" style={{ padding: '2.5rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {post.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> {post.author}
                </span>
                <span>{post.readTime}</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{post.title}</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{post.excerpt}</p>
              <div>
                <button className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  Read Article <ArrowRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        © 2026 StudLyf Inc. Madhapur, Hyderabad, Telangana.
      </footer>
    </div>
  );
}
