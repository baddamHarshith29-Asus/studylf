import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { Search, Download, BookOpen, FileText, Upload, X } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  category: string;
  desc: string;
  fileType: string;
  size: string;
  downloads: number;
}

export default function ResourcesLibrary() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Legal');
  const [newFileType, setNewFileType] = useState('PDF');
  const [newSize, setNewSize] = useState('1.0 MB');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/resources');
      if (res.ok) {
        setResources(await res.json());
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading resources.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id: string, title: string) => {
    // Increment download mock count locally and trigger mock download
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r));
    showToast(`Downloading template: ${title}...`, 'success');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast('Please fill out Title and Description.', 'error');
      return;
    }
    setUploading(true);
    try {
      const response = await apiFetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          desc: newDesc,
          fileType: newFileType,
          size: newSize
        })
      });
      if (response.ok) {
        showToast('Resource uploaded successfully!', 'success');
        setShowUploadModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchResources(); // Refresh list
      } else {
        showToast('Error uploading resource.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading resource.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const categories = ['All', 'Legal', 'Financial', 'Pitching', 'Guides'];

  const filteredResources = resources.filter(res => {
    const matchesSearch = 
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-title-section">
          <h2 className="gradient-text">Startup Playbook Library</h2>
          <p>Download legal agreements, financial forecasting spreadsheets, pitch frameworks, and scale playbooks vetted by YC mentors.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Upload size={16} /> Upload Template
        </button>
      </div>

      {/* Category selector */}
      <div className="tabs-header" style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? 'All Resources' : `${cat} Templates`}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search resources by template name, format, or vertical tags..."
          style={{ width: '100%', paddingLeft: '2.5rem' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
      </div>

      {/* List Grid */}
      {loading ? (
        <div className="flex-center" style={{ padding: '3rem' }}>
          <div className="pulse-loader"><div className="pulse-bubble" /></div>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '0.5rem', padding: '3rem', color: 'var(--text-muted)' }}>
          <BookOpen size={36} />
          <p>No playbooks found matching your search.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredResources.map((res) => (
            <div key={res.id} className="glass-card animate-glow" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex-center" style={{ gap: '0.65rem', alignSelf: 'flex-start', justifyContent: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{res.title}</h4>
                  <span className="badge badge-secondary" style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>{res.category}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{res.desc}</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Format: {res.fileType} • {res.size}</span>
                <button 
                  onClick={() => handleDownload(res.id, res.title)}
                  className="btn btn-outline" 
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Download size={12} /> {res.downloads}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-popover)', padding: '2rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3>Upload Playbook Template</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Template Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Simple Agreement for Future Equity (SAFE)"
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select" 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Legal">Legal</option>
                    <option value="Financial">Financial</option>
                    <option value="Pitching">Pitching</option>
                    <option value="Guides">Guides</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">File Type</label>
                  <select 
                    className="form-select" 
                    value={newFileType} 
                    onChange={(e) => setNewFileType(e.target.value)}
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="ZIP">ZIP</option>
                    <option value="PPTX">PPTX</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated File Size (e.g. 1.2 MB)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newSize} 
                  onChange={(e) => setNewSize(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Summarize what this playbook or template includes..."
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
