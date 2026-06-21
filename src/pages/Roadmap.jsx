import React, { useState, useEffect } from 'react';
import { Check, BookOpen, Download, AlertCircle, Sparkles, Folder, ExternalLink } from 'lucide-react';
import { showToast } from '../components/Toast';

export default function Roadmap({ profile, roadmapTasks, setRoadmapTasks, resources }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState('roadmap');
  
  // Pitch Storyboard State
  const [storyboard, setStoryboard] = useState([]);
  const [activeSlide, setActiveSlide] = useState(1);
  const [sbLoading, setSbLoading] = useState(false);

  const fetchStoryboard = async () => {
    setSbLoading(true);
    try {
      const response = await fetch('/api/roadmap/storyboard');
      const data = await response.json();
      if (data.success) {
        setStoryboard(data.storyboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSbLoading(false);
    }
  };

  const handleSaveSlide = async (slideId, textVal) => {
    const updated = storyboard.map(s => s.id === slideId ? { ...s, placeholder: textVal } : s);
    setStoryboard(updated);
    try {
      await fetch('/api/roadmap/storyboard/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyboard: updated })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyStoryboard = () => {
    const fullText = storyboard.map(s => `--- ${s.title} ---\nGuidance: ${s.guidance}\n\nDraft:\n${s.placeholder || ''}\n`).join('\n');
    navigator.clipboard.writeText(fullText);
    showToast('Storyboard outline copied to your clipboard! Ready to paste into Figma or PPT.', 'success');
  };

  useEffect(() => {
    fetchRoadmap();
  }, [profile.stage]);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roadmap');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    // Optimistic UI update
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));

    try {
      const response = await fetch('/api/roadmap/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });
      const data = await response.json();
      if (!data.success) {
        // Rollback
        setTasks(prevTasks);
      } else {
        // Refresh sidebar health metrics by updating app tasks state
        setRoadmapTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
      }
    } catch (err) {
      console.error(err);
      setTasks(prevTasks);
    }
  };

  const openTemplateDrawer = (guideId) => {
    const resource = resources.find(r => r.id === guideId);
    if (resource) {
      setSelectedTemplate(resource);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Founder GPS & Roadmap</h2>
          <p>Tackle core weekly goals configured for your startup's stage: <strong>{profile.stage} Stage</strong>.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-primary">{profile.stage} Stage</span>
        </div>
      </div>

      {/* Sub tabs headers */}
      <div className="tabs-header" style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('roadmap')} 
          className={`tab-btn ${activeSubTab === 'roadmap' ? 'active' : ''}`}
        >
          Weekly GPS Roadmap
        </button>
        <button 
          onClick={() => { setActiveSubTab('storyboard'); fetchStoryboard(); }} 
          className={`tab-btn ${activeSubTab === 'storyboard' ? 'active' : ''}`}
        >
          Interactive Sequoia Pitch Storyboard
        </button>
      </div>

      {activeSubTab === 'roadmap' ? (
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Left Side: Tasks Checklist */}
          <div className="glass-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex-between">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Objective Checklist
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Completed: {tasks.filter(t => t.completed).length} of {tasks.length}
              </span>
            </div>

            {loading ? (
              <div className="flex-center" style={{ flexDirection: 'column', flex: 1, gap: '1rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                  <div className="pulse-bubble" />
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', color: 'var(--text-muted)', gap: '0.5rem' }}>
                <AlertCircle size={32} />
                <p>No tasks configured for stage: {profile.stage}</p>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`task-item ${task.completed ? 'completed' : ''}`}
                  >
                    <button 
                      onClick={() => handleToggleTask(task.id)}
                      className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    >
                      {task.completed && <Check size={14} />}
                    </button>
                    
                    <div className="task-text">
                      <div style={{ fontWeight: 500, fontSize: '0.92rem' }}>{task.text}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', padding: '0.1rem 0.5rem', fontSize: '0.65rem' }}>
                          {task.category}
                        </span>
                        {task.guideId && (
                          <button
                            onClick={() => openTemplateDrawer(task.guideId)}
                            style={{
                              background: 'rgba(99, 102, 241, 0.08)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(99, 102, 241, 0.2)',
                              borderRadius: '4px',
                              padding: '0.1rem 0.5rem',
                              fontSize: '0.65rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Folder size={10} /> View Template
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Quick Playbook Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem' }}>
                <Sparkles size={16} style={{ color: 'var(--secondary)' }} /> Stage Advisory
              </h3>
              
              {profile.stage === 'Idea' && (
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  You are in the <strong>Idea Stage</strong>. Your main focus is customer discovery. Talk to at least 10 target clients before writing single lines of code. Validate whether the problem is painful enough that they would pay for a solution.
                </p>
              )}
              {profile.stage === 'Validation' && (
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  You are in the <strong>Validation Stage</strong>. Put up a landing page with a waitlist form. Measure conversion rates. Run ad tests or publish content on LinkedIn/Twitter to gauge initial consumer interest index.
                </p>
              )}
              {profile.stage === 'MVP' && (
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  You are in the <strong>MVP Stage</strong>. Build a lean, single-purpose product. Don't add secondary features. Get it in the hands of 5-10 friendly users who will provide brutal, actionable design feedback.
                </p>
              )}
              {profile.stage === 'Revenue' && (
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  You are in the <strong>Revenue Stage</strong>. Charge early! Setting up pricing filters out non-committed users. Find a repeatable sales script or marketing distribution loop.
                </p>
              )}
              {profile.stage === 'Fundraising' && (
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                  You are in the <strong>Fundraising Stage</strong>. Incorporate, draft clean SHAs, structure your cap tables, and prepare standard pitch rooms. Focus outreach on micro-VCs and angels matching your sector profile.
                </p>
              )}
              
              <div style={{
                padding: '0.75rem',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)'
              }}>
                💡 <strong>Tip:</strong> Marking tasks as complete updates your overall Startup Health rating and unlocks higher visibility scores for investors.
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Featured Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resources.slice(0, 3).map((res) => (
                  <div 
                    key={res.id} 
                    onClick={() => setSelectedTemplate(res)}
                    style={{ 
                      padding: '0.5rem', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                    className="task-item"
                  >
                    <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{res.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{res.category} • {res.fileType}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Pitch Storyboard Builder View (Unique Feature) */
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 280px', gap: '2rem' }}>
          
          {/* Left Column: Slide Vertical List Tabs */}
          <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignSelf: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '0.5rem', fontWeight: 600 }}>DECK OUTLINE:</span>
            {sbLoading ? (
              <div className="flex-center" style={{ height: '100px' }}>
                <div className="pulse-loader"><div className="pulse-bubble" /></div>
              </div>
            ) : (
              storyboard.map(slide => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(slide.id)}
                  className={`sidebar-link ${activeSlide === slide.id ? 'active' : ''}`}
                  style={{ 
                    width: '100%', 
                    background: 'none', 
                    border: 'none', 
                    textAlign: 'left', 
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    padding: '0.5rem 0.75rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {slide.title.substring(3)}
                </button>
              ))
            )}
          </div>

          {/* Middle Column: Current Slide Editor */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '380px' }}>
            {sbLoading ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '1rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" /><div className="pulse-bubble" /><div className="pulse-bubble" />
                </div>
              </div>
            ) : storyboard.length > 0 ? (
              (() => {
                const currentSlide = storyboard.find(s => s.id === activeSlide) || storyboard[0];
                return (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
                    <div className="flex-between">
                      <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>{currentSlide.title}</h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Slide {currentSlide.id} of 10</span>
                    </div>

                    {/* VCs advice bubble */}
                    <div style={{
                      background: 'rgba(99, 102, 241, 0.04)',
                      border: '1px solid rgba(99, 102, 241, 0.15)',
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                      color: 'var(--text-secondary)'
                    }}>
                      💡 <strong>Sequoia Guidance:</strong> {currentSlide.guidance}
                    </div>

                    {/* Text Draft editor */}
                    <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Your Slide Narrative Draft:</label>
                      <textarea
                        className="form-textarea"
                        style={{ flex: 1, minHeight: '180px', padding: '0.85rem', fontSize: '0.88rem', lineHeight: 1.45 }}
                        placeholder={currentSlide.placeholder.startsWith("Draft your") || currentSlide.placeholder.startsWith("Describe") ? currentSlide.placeholder : "Type your slide bullet points here..."}
                        value={currentSlide.placeholder.startsWith("Draft your") || currentSlide.placeholder.startsWith("Describe") ? "" : currentSlide.placeholder}
                        onChange={(e) => handleSaveSlide(currentSlide.id, e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                      <button
                        className="btn btn-secondary"
                        disabled={activeSlide === 1}
                        onClick={() => setActiveSlide(prev => Math.max(1, prev - 1))}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        Previous Slide
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={activeSlide === 10}
                        onClick={() => setActiveSlide(prev => Math.min(10, prev + 1))}
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      >
                        Next Slide
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Failed to load storyboard template.</p>
            )}
          </div>

          {/* Right Column: Outline tool actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem' }}>📋 Exporter Tools</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Consolidate your drafts into a structured outline. This copies all 10 slides to your clipboard for easy transfer.
              </p>

              <button
                onClick={handleCopyStoryboard}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                disabled={storyboard.length === 0}
              >
                <Download size={14} /> Copy Full Storyboard
              </button>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#fff' }}>Pitching Rule of Thumbs:</h4>
              <ul style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                <li>Keep slides under <strong>3-4 bullet points</strong> total.</li>
                <li>Write for high readability: VCs scan slides in <strong>3 seconds</strong>.</li>
                <li>Make sure the <strong>Problem</strong> slide clearly reflects a painful, high-frequency issue.</li>
                <li>Ground your <strong>Market Size</strong> in realistic bottom-up calculations, not top-down assumptions.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

      {/* Sliding Drawer overlay for Template details */}
      {selectedTemplate && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 110, display: 'flex',
          justifyContent: 'flex-end', backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedTemplate(null)}>
          <div 
            className="slide-up"
            style={{
              width: '100%', maxWidth: '420px', height: '100%',
              background: 'var(--bg-popover)', borderLeft: '1px solid var(--border-light)',
              padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
              boxShadow: 'var(--shadow-premium)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <span className="badge badge-primary">{selectedTemplate.category} Template</span>
              <button 
                onClick={() => setSelectedTemplate(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer' }}
              >✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>{selectedTemplate.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selectedTemplate.desc}</p>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-light)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8rem'
            }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>File Format:</span>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{selectedTemplate.fileType}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Size:</span>
                <span style={{ fontWeight: 600 }}>{selectedTemplate.size}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-secondary)' }}>Downloads:</span>
                <span style={{ fontWeight: 600 }}>{selectedTemplate.downloads} users</span>
              </div>
            </div>

            {selectedTemplate.category === 'Legal' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.72rem',
                color: 'var(--danger)',
                display: 'flex',
                gap: '6px'
              }}>
                ⚠️ <strong>Build Note:</strong> Legal documents are curated drafts. India-specific legal templates should be reviewed by professional counsel prior to signing.
              </div>
            )}

            <button 
              onClick={() => {
                showToast(`Downloading ${selectedTemplate.title}... Standard copy exported to your clipboard.`, 'success');
                navigator.clipboard.writeText(`Template Link: /resources/${selectedTemplate.id}`);
              }} 
              className="btn btn-primary" 
              style={{ marginTop: 'auto', width: '100%' }}
            >
              <Download size={16} /> Download Template File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
