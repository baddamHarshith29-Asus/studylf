import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Globe, Briefcase, Award, Cpu, DollarSign, Activity, Bot, Share2, BookOpen, ArrowRight, Sparkles, Check, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function WorkspaceHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'solutions' | 'tools'>('solutions');

  // Sync tab with URL hash if present
  useEffect(() => {
    if (location.hash === '#solutions') {
      setActiveTab('solutions');
    } else if (location.hash === '#tools') {
      setActiveTab('tools');
    }
  }, [location.hash]);

  const handleTabChange = (tab: 'solutions' | 'tools') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const solutions = [
    {
      title: 'Student Founders Workspace',
      desc: 'Follow your personalized milestone checklists and structure your student venture systematically.',
      icon: Map,
      badge: 'Founder GPS',
      link: '/roadmap',
      bullets: ['Week-by-week checklists', 'Milestone progress mapping', 'Task allocations']
    },
    {
      title: 'Startup Directory Index',
      desc: 'Search, discover, and collaborate with student startup teams across cohorts and regions.',
      icon: Globe,
      badge: 'Global Search',
      link: '/directory',
      bullets: ['Cohort filtering options', 'Direct founder contact channels', 'Pitch deck sharing']
    },
    {
      title: 'Opportunities Board',
      desc: 'Browse fellowships, incubator cohorts, hackathons, and state-sponsored pitch events.',
      icon: Briefcase,
      badge: 'Growth Programs',
      link: '/opportunities',
      bullets: ['Incubator application calendars', 'Grants calendar synchronizer', 'Direct submit flows']
    },
    {
      title: 'University Innovation Hub',
      desc: 'Institutional suite for cohort advisors, blind submissions grading, and certificate releases.',
      icon: Award,
      badge: 'Incubator Suite',
      link: '/admin',
      bullets: ['Manual evaluation rubrics', 'Judges invitation panel', 'QR-verifiable certificate builder']
    }
  ];

  const tools = [
    {
      title: 'AI Startup Validation',
      desc: 'Run SWOT reviews, competitive matrix checks, and target market sizing scans backed by live web sweeps.',
      icon: Cpu,
      badge: 'Validation Engine',
      link: '/idea-analysis',
      bullets: ['SWOT report generator', 'Competitor live search scans', '4-Part validation scorecard']
    },
    {
      title: 'AI Build Advisor',
      desc: 'Get personalized tech stack recommendations, phased development roadmaps, and cost estimates for your startup type.',
      icon: Layers,
      badge: 'Tech Architect',
      link: '/build-advisor',
      bullets: ['Stack recommendations (SaaS, AI, Marketplace, Mobile)', 'MVP → Growth → Scale phased roadmap', 'Infrastructure cost estimator']
    },
    {
      title: 'Funding Navigator',
      desc: 'Filter national government schemes, fellowship allowances, and state venture grant programs.',
      icon: DollarSign,
      badge: 'Grants Tracker',
      link: '/funding',
      bullets: ['National grant directories', 'Alert calendars', 'Deadline check-off notes']
    },
    {
      title: 'AI Pitch Deck Critique',
      desc: 'Submit your deck slides to check visual clarity, market sizing math, and overall financial consistency.',
      icon: Activity,
      badge: 'Pitch Evaluator',
      link: '/pitch-review',
      bullets: ['Slide structural analysis', 'VC assessment reports', 'Voice mock-pitch practice']
    },
    {
      title: 'AI Cofounder Copilot',
      desc: 'Consult your 24/7 AI mentor trained on Indian corporate laws, pitch scripts, and product models.',
      icon: Bot,
      badge: 'Interactive Mentor',
      link: '/copilot',
      bullets: ['Regulatory checks', 'Pitch script practice sessions', 'Competitor analysis chat']
    },
    {
      title: 'Network Relationship Hub',
      desc: 'Upload LinkedIn CSV contacts to map second-degree connections to active investor panels.',
      icon: Share2,
      badge: 'Network Matcher',
      link: '/network',
      bullets: ['Connection data filtering', 'Investor matching filters', 'Intro email templates']
    },
    {
      title: 'Playbook Template Library',
      desc: 'Download vetted NDAs, cofounder equity calculators, and basic employment agreements.',
      icon: BookOpen,
      badge: 'Legal Templates',
      link: '/playbooks',
      bullets: ['Standard corporate agreements', 'DPDP compliant templates', 'Seed equity calculators']
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-glow)', padding: '0.35rem 0.85rem', borderRadius: '20px', width: 'fit-content', marginBottom: '0.5rem' }}>
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workspace Launchpad</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.75px', fontFamily: 'var(--font-heading)', margin: 0 }}>
            Welcome back, {profile.name || 'Founder'}!
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Workspace GPS for <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{profile.startupName || 'your startup venture'}</span>
          </p>
        </div>
      </div>

      {/* Segmented Switcher Tab */}
      <div className="segmented-tabs-container">
        <button
          onClick={() => handleTabChange('solutions')}
          className={`segmented-tab-button ${activeTab === 'solutions' ? 'active' : ''}`}
        >
          Solutions Hub
        </button>
        <button
          onClick={() => handleTabChange('tools')}
          className={`segmented-tab-button ${activeTab === 'tools' ? 'active' : ''}`}
        >
          Workspace Tools
        </button>
      </div>

      {/* Grid Content */}
      <div className="hub-card-container">
        {activeTab === 'solutions' ? (
          solutions.map((sol, index) => {
            const Icon = sol.icon;
            return (
              <div key={index} className="hub-card-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="hub-card-icon-box">
                    <Icon size={20} />
                  </div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.62rem', padding: '0.15rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {sol.badge}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{sol.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '54px' }}>
                    {sol.desc}
                  </p>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: 0, margin: 0 }}>
                  {sol.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <Check size={12} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(sol.link)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 'auto' }}
                >
                  Enter Workspace <ArrowRight size={14} />
                </button>
              </div>
            );
          })
        ) : (
          tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div key={index} className="hub-card-item" style={{ borderLeft: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="hub-card-icon-box" style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
                    <Icon size={20} />
                  </div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.62rem', padding: '0.15rem 0.5rem', fontWeight: 700, color: 'var(--secondary)' }}>
                    {tool.badge}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{tool.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '54px' }}>
                    {tool.desc}
                  </p>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: 0, margin: 0 }}>
                  {tool.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <Check size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate(tool.link)}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: 'auto' }}
                >
                  Launch Tool <ArrowRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
