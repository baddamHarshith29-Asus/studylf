import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Activity, Settings, LogOut, ChevronDown, User } from 'lucide-react';

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout, validationReports } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const latestReport = validationReports && validationReports[0];
  const healthScore = latestReport ? latestReport.scores.overall : 60;
  const healthColor = healthScore > 75 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444';

  const menuItems = [
    { id: 'hub', path: '/', label: 'Workspace Hub' },
    { id: 'solutions', path: '/#solutions', label: 'Solutions' },
    { id: 'tools', path: '/#tools', label: 'Workspace Tools' },
    { id: 'playbooks', path: '/playbooks', label: 'Resource Playbooks' }
  ];

  return (
    <>
      <header className="top-navbar-workspace">
        <div className="top-navbar-inner">
          
          {/* Left Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#111827' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={14} fill="#fff" color="#fff" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>STUDLYF HUB</span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="top-navbar-links">
            {menuItems.map((item) => {
              const isMainHub = location.pathname === '/' || location.pathname === '/dashboard';
              const isActive = (item.id === 'hub' && isMainHub) || 
                               (item.id === 'solutions' && isMainHub && location.hash === '#solutions') ||
                               (item.id === 'tools' && isMainHub && location.hash === '#tools') ||
                               (item.id === 'playbooks' && location.pathname === '/playbooks');
              
              // Handle hash changes on the main hub
              const handleNavClick = (e: React.MouseEvent) => {
                if (item.path.startsWith('/#')) {
                  e.preventDefault();
                  const hash = item.path.split('#')[1];
                  navigate('/', { replace: true });
                  // Add hash manually to trigger tab swap
                  window.location.hash = hash;
                }
              };

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`top-navbar-item ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right User Actions & Mini Health */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            
            {/* Mini Health Activity Badge */}
            {profile.registered && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 0, 0, 0.02)', border: '1px solid var(--border-light)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                <Activity size={12} style={{ color: healthColor }} />
                <span style={{ color: 'var(--text-secondary)' }}>Health:</span>
                <span style={{ color: healthColor, fontWeight: 700 }}>{healthScore}%</span>
              </div>
            )}

            {/* Profile Avatar Dropdown Trigger */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '0.25rem' }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 750, fontSize: '0.85rem'
                }}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>

              {showDropdown && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0,
                  background: '#ffffff', border: '1px solid var(--border-light)',
                  borderRadius: '12px', padding: '0.75rem', width: '220px',
                  boxShadow: 'var(--shadow-premium)', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                  zIndex: 200, animation: 'slideUp 0.2s ease'
                }}>
                  <div style={{ padding: '0.25rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {profile.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {profile.startupName || 'StudLyf Founder'}
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowDropdown(false); navigate('/settings'); }}
                    style={{ background: 'none', border: 'none', width: '100%', padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                    className="dropdown-item-hover"
                  >
                    <Settings size={14} /> Profile Settings
                  </button>

                  <button
                    onClick={() => { setShowDropdown(false); setShowLogoutConfirm(true); }}
                    style={{ background: 'none', border: 'none', width: '100%', padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                    className="dropdown-item-hover"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 5, 12, 0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-card slide-up" style={{
            width: '100%', maxWidth: '360px', background: '#ffffff',
            border: '1px solid var(--border-light)', borderRadius: '16px',
            textAlign: 'center', padding: '2.5rem 2rem'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', color: 'var(--danger)'
            }}>
              <LogOut size={22} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sign Out</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
              Are you sure you want to end your active workspace session?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn"
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: '8px',
                  background: 'var(--danger)', color: '#fff', fontWeight: 600,
                  border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
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
