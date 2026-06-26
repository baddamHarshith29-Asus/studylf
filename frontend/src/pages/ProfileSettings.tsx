import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { User, Mail, ShieldAlert, LogOut, Save, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { profile, setProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile.name || '');
  const [email] = useState(profile.email || '');
  const [avatar, setAvatar] = useState(profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), avatar: avatar.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local profile state
        setProfile(prev => ({
          ...prev,
          name: data.name || name,
          avatar: data.avatar || avatar
        }));
        showToast('Profile settings saved successfully!', 'success');
      } else {
        showToast(data.detail || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
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
          <h2 className="gradient-text">Profile &amp; Account Settings</h2>
          <p>Configure personal credentials, avatar identifiers, and active session logins.</p>
        </div>
      </div>

      <div className="grid-2">
        
        {/* Settings Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3>👥 Personal Details</h3>
          
          {/* Avatar Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatar}
                alt={name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
                }}
              />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Camera size={10} color="#fff" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>{name || 'Your Name'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{email}</div>
            </div>
          </div>

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
                  placeholder="Your full name"
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
                  style={{ width: '100%', paddingLeft: '2.5rem', opacity: 0.6 }} 
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
                placeholder="https://... (image URL)"
                required 
              />
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>Paste a public image URL or Unsplash photo link.</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} disabled={saving}>
              {saving ? 'Saving updates...' : <><Save size={15} /> Save Settings</>}
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
            <h3>🔑 Active Session</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Logged in as</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{profile.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Startup</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{profile.startupName || 'Not set'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Stage</span>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{profile.stage}</span>
              </div>
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
