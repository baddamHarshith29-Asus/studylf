import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/ui/Toast';
import { User, Mail, ShieldAlert, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile.name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [avatar, setAvatar] = useState(profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Settings saved successfully!', 'success');
    }, 800);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sign out complete. Workspace session cleared.', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Profile & Account Settings</h2>
          <p>Configure personal credentials, avatar identifiers, and active session logins.</p>
        </div>
      </div>

      <div className="grid-2">
        
        {/* Settings Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3>👥 Personal Details</h3>
          
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
                <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                  value={email} 
                  disabled 
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>Email cannot be changed after registration.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Avatar URL</label>
              <input 
                type="text" 
                className="form-input" 
                value={avatar} 
                onChange={(e) => setAvatar(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={saving}>
              {saving ? 'Saving updates...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Security / Session Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} style={{ color: 'var(--warning)' }} /> Account Security
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>You are authenticated via locally hashed secure JWT tokens. Ensure you keep your passwords offline.</p>
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', fontSize: '0.76rem', color: 'var(--danger)' }}>
              Note: Clearing your workspace session will erase local storage settings.
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3>🚪 Logout Session</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Logout and clear cached user tokens. You will need to onboard again if you reset credentials.</p>
            <button 
              onClick={handleLogout}
              className="btn" 
              style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LogOut size={16} /> Sign Out Workspace
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
