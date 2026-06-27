import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Server,
  Database,
  Cloud,
  Sparkles,
  ChevronRight,
  DollarSign,
  Rocket,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  Code2,
  Globe,
  Smartphone,
  ShoppingCart,
  BrainCircuit,
  RefreshCw,
  Clock
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';

interface BuildPhase {
  phase: string;
  duration: string;
  objectives: string;
}

interface CostEstimate {
  item: string;
  mvp: string;
  growth: string;
  scale: string;
}

interface BuildAdvisorResult {
  stack: Record<string, string>;
  phases: BuildPhase[];
  costEstimates: CostEstimate[];
}

const STARTUP_TYPES = [
  { id: 'SaaS', label: 'SaaS Platform', icon: Globe, description: 'Cloud-based software subscription service', color: '#6366f1' },
  { id: 'AI Startup', label: 'AI / ML Startup', icon: BrainCircuit, description: 'AI-powered product or intelligent automation', color: '#8b5cf6' },
  { id: 'Marketplace', label: 'Marketplace', icon: ShoppingCart, description: 'Multi-sided platform connecting buyers & sellers', color: '#06b6d4' },
  { id: 'Mobile App', label: 'Mobile App', icon: Smartphone, description: 'Native or cross-platform mobile application', color: '#f59e0b' },
];

const STACK_ICONS: Record<string, React.ElementType> = {
  frontend: Code2,
  backend: Server,
  database: Database,
  hosting: Cloud,
  ai: BrainCircuit,
  'ai provider': BrainCircuit,
  'ai/ml': BrainCircuit,
  default: Cpu,
};

function getStackIcon(key: string): React.ElementType {
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(STACK_ICONS)) {
    if (lower.includes(k)) return v;
  }
  return STACK_ICONS.default;
}

const PHASE_COLORS = ['var(--primary)', 'var(--secondary)', 'var(--success)'];
const PHASE_ICONS = [Rocket, TrendingUp, Zap];

export default function BuildAdvisor() {
  const { profile } = useAuth();
  const [startupType, setStartupType] = useState('SaaS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuildAdvisorResult | null>(null);
  const [activePhase, setActivePhase] = useState(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await apiFetch('/api/build-advisor', {
        method: 'POST',
        body: JSON.stringify({ startupType })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
        showToast('Technical build plan generated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to generate build advice.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setActivePhase(0);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      {/* Background accents */}
      <div className="radial-glow-spot" style={{ top: '-8%', right: '-12%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 60%)' }} />
      <div className="radial-glow-spot" style={{ bottom: '10%', left: '-10%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 65%)' }} />

      {/* Page Header */}
      <div className="page-header" style={{ position: 'relative', zIndex: 5 }}>
        <div className="page-title-section">
          <h2 className="gradient-text" style={{ fontSize: '1.85rem' }}>AI Build Advisor</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Get a personalized tech stack, phased development roadmap, and cost breakdown for your startup type.
          </p>
        </div>
        {result && (
          <button onClick={handleReset} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={15} /> New Analysis
          </button>
        )}
      </div>

      {/* Startup Type Selector — shown when no result */}
      {!result && !loading && (
        <div className="glass-card" style={{ padding: '2rem', position: 'relative', zIndex: 5 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.05rem', marginBottom: '0.5rem', fontWeight: 700 }}>
            <Layers size={18} style={{ color: 'var(--secondary)' }} /> Select Your Startup Architecture
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
            Choose the product type that best matches your startup. The AI will recommend the optimal tech stack, development phases, and cost estimates.
          </p>

          <form onSubmit={handleGenerate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {STARTUP_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = startupType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setStartupType(type.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${type.color}` : '1.5px solid var(--border-light)',
                      background: isSelected ? `${type.color}08` : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: isSelected ? `0 0 20px ${type.color}15` : 'none',
                    }}
                  >
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: '0.65rem', right: '0.65rem',
                      }}>
                        <CheckCircle size={16} style={{ color: type.color }} />
                      </div>
                    )}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: `${type.color}15`,
                      border: `1px solid ${type.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={20} style={{ color: type.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {type.label}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {type.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Context info */}
            {profile.startupName && (
              <div style={{
                padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-glow)', border: '1px solid var(--border-light)',
                marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem'
              }}>
                <Sparkles size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  The advisor will personalize recommendations for <strong style={{ color: 'var(--text-primary)' }}>{profile.startupName}</strong>
                  {profile.industry ? <> in the <strong style={{ color: 'var(--text-primary)' }}>{profile.industry}</strong> sector</> : ''}.
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}>
              <Rocket size={17} /> Generate Build Plan
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-card" style={{ padding: '4rem 2rem' }}>
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'glowPulse 2s infinite',
              boxShadow: '0 8px 32px rgba(239, 43, 112, 0.3)'
            }}>
              <Cpu size={28} color="#fff" />
            </div>
            <div className="pulse-loader">
              <div className="pulse-bubble" />
              <div className="pulse-bubble" />
              <div className="pulse-bubble" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Analyzing Architecture Profile
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Synthesizing {startupType} stack configurations, development timelines, and cost models...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Selected Type Banner */}
          <div className="glass-card" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)',
            border: '1px solid var(--border-glow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {(() => {
                const typeInfo = STARTUP_TYPES.find(t => t.id === startupType);
                const Icon = typeInfo?.icon || Layers;
                return (
                  <>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: `${typeInfo?.color || 'var(--primary)'}18`,
                      border: `1px solid ${typeInfo?.color || 'var(--primary)'}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={20} style={{ color: typeInfo?.color || 'var(--primary)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {typeInfo?.label || startupType} Build Plan
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {profile.startupName ? `Personalized for ${profile.startupName}` : 'AI-generated technical architecture'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div style={{
              padding: '0.35rem 0.75rem', borderRadius: '6px',
              background: 'var(--success)', color: '#fff',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px'
            }}>
              GENERATED
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              fontSize: '1.05rem', marginBottom: '1.25rem', fontWeight: 700
            }}>
              <Code2 size={18} style={{ color: 'var(--secondary)' }} /> Recommended Tech Stack
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              {Object.entries(result.stack).map(([layer, tech], idx) => {
                const Icon = getStackIcon(layer);
                const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981'];
                const color = colors[idx % colors.length];
                return (
                  <div key={layer} style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-md)',
                    background: `${color}06`,
                    border: `1px solid ${color}18`,
                    display: 'flex', flexDirection: 'column', gap: '0.65rem',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={17} style={{ color }} />
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '0.2rem'
                      }}>
                        {layer}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color }}>
                        {tech}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phased Development Roadmap */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              fontSize: '1.05rem', marginBottom: '1.25rem', fontWeight: 700
            }}>
              <Rocket size={18} style={{ color: 'var(--primary)' }} /> Phased Development Roadmap
            </h3>

            {/* Phase Timeline Navigation */}
            <div style={{
              display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
              padding: '0.35rem', background: 'rgba(0,0,0,0.02)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)'
            }}>
              {result.phases.map((ph, idx) => {
                const isActive = activePhase === idx;
                const PhaseIcon = PHASE_ICONS[idx % PHASE_ICONS.length];
                return (
                  <button
                    key={idx}
                    onClick={() => setActivePhase(idx)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                      fontSize: '0.8rem', fontWeight: isActive ? 700 : 500,
                      background: isActive ? PHASE_COLORS[idx % PHASE_COLORS.length] : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? `0 4px 14px ${PHASE_COLORS[idx % PHASE_COLORS.length]}40` : 'none',
                    }}
                  >
                    <PhaseIcon size={14} />
                    Phase {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Active Phase Card */}
            {result.phases[activePhase] && (
              <div className="fade-in" style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                background: `${PHASE_COLORS[activePhase % PHASE_COLORS.length]}06`,
                border: `1px solid ${PHASE_COLORS[activePhase % PHASE_COLORS.length]}18`,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <div style={{
                      fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      {result.phases[activePhase].phase}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      fontSize: '0.72rem', fontWeight: 600,
                      padding: '0.2rem 0.6rem', borderRadius: '4px',
                      background: `${PHASE_COLORS[activePhase % PHASE_COLORS.length]}12`,
                      color: PHASE_COLORS[activePhase % PHASE_COLORS.length],
                    }}>
                      <Clock size={11} /> {result.phases[activePhase].duration}
                    </div>
                  </div>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: PHASE_COLORS[activePhase % PHASE_COLORS.length],
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9rem',
                    boxShadow: `0 4px 12px ${PHASE_COLORS[activePhase % PHASE_COLORS.length]}40`
                  }}>
                    {activePhase + 1}
                  </div>
                </div>
                <p style={{
                  fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-secondary)',
                }}>
                  {result.phases[activePhase].objectives}
                </p>

                {/* Phase navigation arrows */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                  <button
                    onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                    disabled={activePhase === 0}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', opacity: activePhase === 0 ? 0.4 : 1 }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setActivePhase(Math.min(result.phases.length - 1, activePhase + 1))}
                    disabled={activePhase === result.phases.length - 1}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', opacity: activePhase === result.phases.length - 1 ? 0.4 : 1 }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* All phases timeline dots */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', marginTop: '1.25rem'
            }}>
              {result.phases.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhase(idx)}
                  style={{
                    width: activePhase === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activePhase === idx
                      ? PHASE_COLORS[idx % PHASE_COLORS.length]
                      : 'var(--border-light)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Cost Estimator */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              fontSize: '1.05rem', marginBottom: '0.5rem', fontWeight: 700
            }}>
              <DollarSign size={18} style={{ color: 'var(--success)' }} /> Cost Estimator
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Estimated monthly costs across development stages. All estimates are based on current market pricing.
            </p>

            {/* Cost Table */}
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', fontSize: '0.82rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ color: 'var(--text-secondary)', padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--border-light)' }}>
                      Infrastructure
                    </th>
                    <th style={{ color: 'var(--primary)', padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <Rocket size={13} /> MVP
                      </div>
                    </th>
                    <th style={{ color: 'var(--secondary)', padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <TrendingUp size={13} /> Growth
                      </div>
                    </th>
                    <th style={{ color: 'var(--success)', padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <Zap size={13} /> Scale
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.costEstimates.map((c, idx) => (
                    <tr key={idx} style={{
                      borderBottom: idx < result.costEstimates.length - 1 ? '1px solid var(--border-light)' : 'none',
                      transition: 'background 0.15s ease',
                    }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.item}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: 'var(--primary-glow)', fontSize: '0.78rem', fontWeight: 600
                        }}>
                          {c.mvp}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: 'var(--secondary)' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: 'var(--secondary-glow)', fontSize: '0.78rem', fontWeight: 600
                        }}>
                          {c.growth}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: 'var(--success)' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.08)', fontSize: '0.78rem', fontWeight: 600
                        }}>
                          {c.scale}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cost Disclaimer */}
            <div style={{
              marginTop: '1rem', padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.15)',
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
            }}>
              <Sparkles size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Costs are estimated based on current market pricing for hosting, AI APIs, and development tools. 
                Actual costs may vary based on usage, team size, and vendor negotiations.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-card" style={{
            padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Want to explore a different architecture?
            </span>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={handleReset} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={14} /> Reconfigure
              </button>
              <button onClick={() => window.location.href = '/roadmap'} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Go to Roadmap <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
