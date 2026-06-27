import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Map, 
  Coins, 
  Users, 
  Bot, 
  Sliders, 
  Activity, 
  LogOut,
  Settings,
  Zap,
  Globe,
  Briefcase,
  ChevronRight,
  DollarSign,
  BookOpen,
  Network,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  validationReports: any[];
  roadmapTasks: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ validationReports, roadmapTasks }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Health and roadmap calculations
  const latestReport = validationReports && validationReports[0];
  const healthScore = latestReport ? latestReport.scores.overall : 60;
  
  const currentStageTasks = roadmapTasks || [];
  const completedTasks = currentStageTasks.filter(t => t.completed).length;
  const totalTasks = currentStageTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Grouped menu items
  const menuGroups = [
    {
      title: "Workspace",
      items: [
        { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'idea-analysis', path: '/idea-analysis', label: 'Idea Analyzer', icon: Cpu, badge: null, glow: true },
        { id: 'build-advisor', path: '/build-advisor', label: 'Build Advisor', icon: Briefcase, badge: null, glow: true },
        { id: 'roadmap', path: '/roadmap', label: 'Roadmap GPS', icon: Map, badge: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : null },
        { id: 'startup-profile', path: '/startup-profile', label: 'Startup Profile', icon: Sliders, badge: null },
        { id: 'directory', path: '/directory', label: 'Startup Directory', icon: Globe, badge: null }
      ]
    },
    {
      title: "Funding & Growth",
      items: [
        { id: 'funding', path: '/funding', label: 'Funding Navigator', icon: DollarSign, badge: null },
        { id: 'investors', path: '/investors', label: 'Investors', icon: Coins, badge: null },
        { id: 'mentors', path: '/mentors', label: 'Mentor Board', icon: Users, badge: null },
        { id: 'opportunities', path: '/opportunities', label: 'Opportunity Board', icon: Briefcase, badge: null }
      ]
    },
    {
      title: "Resources & Tools",
      items: [
        { id: 'network', path: '/network', label: 'Network Hub', icon: Network, badge: null },
        { id: 'playbooks', path: '/playbooks', label: 'Playbook Library', icon: BookOpen, badge: null },
        { id: 'pitch-review', path: '/pitch-review', label: 'Pitch Review', icon: Activity, badge: null },
        { id: 'copilot', path: '/copilot', label: 'AI Copilot', icon: Bot, badge: null, glow: true },
        { id: 'admin', path: '/admin', label: 'Admin Panel', icon: Sliders, badge: null }
      ]
    }
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const healthColor = healthScore > 75 ? 'var(--success)' : healthScore > 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <>
      <aside className="sidebar">
        {/* Workspace Hub Logo Selector */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.5rem 0.5rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(239, 43, 112, 0.25)',
            position: 'relative'
          }}>
            <Zap size={15} fill="#fff" color="#fff" />
            <div style={{
              position: 'absolute',
              inset: '-1px',
              borderRadius: '9px',
              border: '1px solid rgba(239, 43, 112, 0.15)',
              animation: 'glowPulse 2.5s infinite',
              pointerEvents: 'none'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.5px', fontFamily: 'var(--font-heading)' }}>
              STUDLYF HUB
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Workspace v1.0
            </span>
          </div>
        </div>

        {/* Health Progress Widget - Sleek Redesign without text headers */}
        {profile.registered && (
          <div className="health-widget fade-in" style={{
            background: 'linear-gradient(135deg, var(--primary-glow) 0%, var(--secondary-glow) 100%)',
            border: '1px solid var(--border-light)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {/* Health Meter */}
            <div>
              <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={12} style={{ color: healthColor }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>HEALTH</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: healthColor, fontWeight: 700 }}>
                  {healthScore}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${healthScore}%`, background: healthColor, borderRadius: '9999px' }} />
              </div>
            </div>

            {/* Roadmap Meter */}
            <div>
              <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Map size={12} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>ROADMAP</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                  {completionPct}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '9999px' }} />
              </div>
            </div>
          </div>
        )}

        {/* Grouped Sidebar Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {/* Sleek Line Separator with marker dot instead of heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0.5rem' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: gIdx === 0 ? 'var(--primary)' : gIdx === 1 ? 'var(--secondary)' : 'var(--border-glow)',
                  boxShadow: `0 0 6px ${gIdx === 0 ? 'var(--primary)' : gIdx === 1 ? 'var(--secondary)' : 'var(--border-glow)'}`,
                  flexShrink: 0
                }} />
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-light), transparent)' }} />
              </div>
              
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => navigate(item.path)}
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                        style={{ 
                          width: '100%', 
                          background: 'none', 
                          border: 'none',
                          textAlign: 'left',
                          position: 'relative'
                        }}
                      >
                        <Icon size={17} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge && (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--primary-glow)',
                            color: isActive ? '#fff' : 'var(--primary)',
                            border: isActive ? 'none' : '1px solid rgba(239, 43, 112, 0.15)',
                          }}>{item.badge}</span>
                        )}
                        {item.glow && !isActive && (
                          <span style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: 'var(--secondary)',
                            boxShadow: '0 0 6px var(--secondary)',
                            animation: 'glowPulse 2s infinite'
                          }} />
                        )}
                        {isActive && <ChevronRight size={14} style={{ color: 'var(--secondary)', opacity: 0.8 }} />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        {profile.registered && (
          <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
              <button 
                onClick={() => navigate('/settings')}
                className="sidebar-link"
                style={{ 
                  flex: 1, background: 'none', border: '1px solid var(--border-light)', textAlign: 'center',
                  fontSize: '0.78rem',
                  padding: '0.45rem',
                  color: 'var(--text-secondary)',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                title="Settings"
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>

              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="sidebar-link"
                style={{ 
                  flex: 1, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', textAlign: 'center',
                  fontSize: '0.78rem',
                  padding: '0.45rem',
                  color: 'var(--danger)',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                title="Sign Out"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.65rem', 
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.01)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{profile.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.startupName}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 5, 12, 0.75)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-card slide-up" style={{
            width: '100%', maxWidth: '360px',
            background: 'var(--bg-popover)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--danger)'
            }}>
              <LogOut size={20} />
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sign Out</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              Are you sure you want to end your active workspace session?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.55rem' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn"
                style={{ 
                  flex: 1,
                  padding: '0.55rem',
                  background: 'var(--danger)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.2)'
                }}
              >
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
