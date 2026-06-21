import React, { useState } from 'react';
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
  ChevronRight,
  Zap
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, profile, validationReports, roadmapTasks, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Compute dynamic startup health score
  const latestReport = validationReports && validationReports[0];
  const healthScore = latestReport ? latestReport.scores.overall : 60;

  // Compute roadmap completion percentage
  const currentStageTasks = roadmapTasks || [];
  const completedTasks = currentStageTasks.filter(t => t.completed).length;
  const totalTasks = currentStageTasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'roadmap', label: 'Roadmap', icon: Map, badge: totalTasks > 0 ? `${completedTasks}/${totalTasks}` : null },
    { id: 'funding', label: 'Funding & Radar', icon: Coins, badge: null },
    { id: 'network', label: 'Network Hub', icon: Users, badge: null },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: null, glow: true },
    { id: 'admin', label: 'Admin Panel', icon: Sliders, badge: null },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      if (onLogout) onLogout();
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
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
          }}>
            <Zap size={18} />
          </div>
          <h1>STUDLYF</h1>
        </div>

        {/* Health Widget */}
        {profile.registered && (
          <div className="health-widget fade-in" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(6, 182, 212, 0.06) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.12)'
          }}>
            <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Startup Health</span>
              <span style={{ fontSize: '0.82rem', color: healthColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={13} /> {healthScore}
              </span>
            </div>
            <div className="health-bar-container" style={{ height: '5px' }}>
              <div 
                className="health-bar" 
                style={{ 
                  width: `${healthScore}%`, 
                  background: `linear-gradient(90deg, ${healthColor}, ${healthScore > 75 ? '#22d3ee' : healthColor})`,
                  boxShadow: `0 0 8px ${healthColor}`
                }}
              />
            </div>

            <div className="flex-between" style={{ marginTop: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Roadmap</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                {completionPct}%
              </span>
            </div>
            <div className="health-bar-container" style={{ height: '5px' }}>
              <div 
                className="health-bar" 
                style={{ 
                  width: `${completionPct}%`, 
                  background: 'linear-gradient(90deg, var(--primary), var(--accent-purple))',
                  boxShadow: '0 0 8px var(--primary)'
                }}
              />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    border: 'none', 
                    textAlign: 'left',
                    position: 'relative'
                  }}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '6px',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--primary-glow)',
                      color: isActive ? '#fff' : 'var(--primary)',
                      border: isActive ? 'none' : '1px solid rgba(99, 102, 241, 0.2)',
                    }}>{item.badge}</span>
                  )}
                  {item.glow && !isActive && (
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--secondary)',
                      boxShadow: '0 0 6px var(--secondary)',
                      animation: 'glowPulse 2s infinite'
                    }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Profile Footer */}
        {profile.registered && (
          <div className="sidebar-footer">
            {/* Quick Settings Link */}
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="sidebar-link"
              style={{ 
                width: '100%', background: 'none', border: 'none', textAlign: 'left',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
                padding: '0.5rem 1rem',
                color: 'var(--text-muted)'
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.75rem', 
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0
              }}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.startupName}</span>
              </div>
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                style={{ 
                  padding: '0.4rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '6px',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-card slide-up" style={{
            width: '100%', maxWidth: '380px',
            background: 'var(--bg-popover)',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: 'var(--danger)'
            }}>
              <LogOut size={22} />
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Sign Out</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              This will reset your workspace session and clear all onboarding data. Are you sure?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn"
                style={{ 
                  flex: 1,
                  background: 'var(--danger)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
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
}
