import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';
import { 
  Search, 
  Download, 
  BookOpen, 
  FileText, 
  Upload, 
  X, 
  Clipboard, 
  Check, 
  Calculator, 
  FileCheck, 
  ArrowRight,
  Shield,
  Eye,
  Bookmark,
  Video,
  ChevronRight,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Chapter {
  title: string;
  timestamp: string;
}

interface Resource {
  id: string;
  title: string;
  category: string;
  desc: string;
  fileType: string;
  size: string;
  downloads: number;
  type: 'document' | 'video';
  url?: string;
  videoUrl?: string;
  duration?: string;
  author?: string;
  readTime?: string;
  content?: string;
  chapters?: Chapter[];
  transcript?: string;
  views: number;
  bookmarked: boolean;
}

export default function ResourcesLibrary() {
  const { profile } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMediaType, setActiveMediaType] = useState('All');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  
  // View mode for Startup Library: 'home' (YC playlist sections) or 'archive' (sidebar filter view)
  const [libraryMode, setLibraryMode] = useState<'home' | 'archive'>('home');

  // Library Tabs
  const [activeTab, setActiveTab] = useState<'library' | 'safe' | 'equity'>('library');

  // Immersive Details Modal State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Custom video playback start second
  const [videoStartSec, setVideoStartSec] = useState<number>(0);

  // SAFE Generator Form State
  const [startupName, setStartupName] = useState(profile?.startupName || 'Studlyf AI');
  const [incorporationState, setIncorporationState] = useState(profile?.country === 'India' ? 'Karnataka' : 'Delaware');
  const [investorName, setInvestorName] = useState('Peak XV Partners');
  const [investmentAmount, setInvestmentAmount] = useState('100000');
  const [valuationCap, setValuationCap] = useState('6000000');
  const [safeType, setSafeType] = useState('cap_only');
  const [copiedSafe, setCopiedSafe] = useState(false);

  // Cofounder Equity Splitter State
  const [sliderQ1, setSliderQ1] = useState(50); // Concept & IP
  const [sliderQ2, setSliderQ2] = useState(50); // Code & Engineering
  const [sliderQ3, setSliderQ3] = useState(50); // Efforts & Hours
  const [sliderQ4, setSliderQ4] = useState(50); // BD & Raising
  const [sliderQ5, setSliderQ5] = useState(50); // Experience & Exits

  // Detailed Publish Resource Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pubType, setPubType] = useState<'document' | 'video'>('document');
  const [pubTitle, setPubTitle] = useState('');
  const [pubDesc, setPubDesc] = useState('');
  const [pubCategory, setPubCategory] = useState('Fundraising');
  const [pubAuthor, setPubAuthor] = useState('');
  
  // Document fields
  const [pubFileType, setPubFileType] = useState('PDF');
  const [pubSize, setPubSize] = useState('1.0 MB');
  const [pubReadTime, setPubReadTime] = useState('5 min');
  const [pubDocUrl, setPubDocUrl] = useState('');
  const [pubContent, setPubContent] = useState('');

  // Video fields
  const [pubVideoUrl, setPubVideoUrl] = useState('');
  const [pubDuration, setPubDuration] = useState('10:00');
  const [pubChaptersText, setPubChaptersText] = useState('');
  const [pubTranscript, setPubTranscript] = useState('');
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
    setResources(prev => prev.map(r => r.id === id ? { ...r, downloads: r.downloads + 1 } : r));
    showToast(`Downloading template: ${title}...`, 'success');
  };

  // Toggle Bookmark in Backend
  const handleToggleBookmark = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await apiFetch(`/api/resources/${id}/bookmark`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setResources(prev => prev.map(r => r.id === id ? { ...r, bookmarked: data.bookmarked } : r));
        if (selectedResource && selectedResource.id === id) {
          setSelectedResource(prev => prev ? { ...prev, bookmarked: data.bookmarked } : null);
        }
        showToast(data.bookmarked ? 'Resource bookmarked!' : 'Bookmark removed.', 'success');
      } else {
        showToast('Authentication required to bookmark resources.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Error bookmarking resource.', 'error');
    }
  };

  // Increment view counter on backend and local state
  const handleOpenResource = async (res: Resource) => {
    setSelectedResource(res);
    setVideoStartSec(0); // Reset video position
    // Increment view immediately in local state
    setResources(prev => prev.map(r => r.id === res.id ? { ...r, views: r.views + 1 } : r));
    try {
      await apiFetch(`/api/resources/${res.id}/view`, { method: 'POST' });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  // Parse custom chapters text block to Chapters list
  const parseChapters = (text: string): Chapter[] => {
    if (!text.trim()) return [];
    return text.split('\n').map(line => {
      const parts = line.split('-');
      if (parts.length >= 2) {
        return {
          timestamp: parts[0].trim(),
          title: parts.slice(1).join('-').trim()
        };
      }
      return { timestamp: '0:00', title: line.trim() };
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pubTitle.trim() || !pubDesc.trim()) {
      showToast('Please fill out Title and Description.', 'error');
      return;
    }
    setUploading(true);
    try {
      const bodyPayload = {
        title: pubTitle,
        category: pubCategory,
        desc: pubDesc,
        type: pubType,
        author: pubAuthor || 'Studlyf Contributor',
        fileType: pubType === 'video' ? 'Video' : pubFileType,
        size: pubType === 'video' ? pubDuration : pubSize,
        url: pubDocUrl || null,
        videoUrl: pubVideoUrl || null,
        duration: pubType === 'video' ? pubDuration : null,
        readTime: pubType === 'document' ? pubReadTime : null,
        content: pubType === 'document' ? pubContent : null,
        chapters: pubType === 'video' ? parseChapters(pubChaptersText) : [],
        transcript: pubType === 'video' ? pubTranscript : null
      };

      const response = await apiFetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (response.ok) {
        showToast('Resource published successfully!', 'success');
        setShowUploadModal(false);
        // Reset form fields
        setPubTitle('');
        setPubDesc('');
        setPubAuthor('');
        setPubDocUrl('');
        setPubContent('');
        setPubVideoUrl('');
        setPubChaptersText('');
        setPubTranscript('');
        fetchResources();
      } else {
        showToast('Error publishing resource.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error publishing resource.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Convert "01:30" or "0:45" to seconds for YouTube embed start time
  const parseTimestampToSeconds = (ts: string) => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  // Simple custom Markdown renderer to present structured essays without package bloat
  const renderMarkdownContent = (text?: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        const title = trimmed.replace('# ', '');
        return <h1 key={i} id={title.replace(/\s+/g, '-').toLowerCase()} className="text-xl font-extrabold mt-6 mb-3 text-white border-b border-gray-800 pb-2" style={{ letterSpacing: '-0.3px' }}>{title}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        const title = trimmed.replace('## ', '');
        return <h2 key={i} id={title.replace(/\s+/g, '-').toLowerCase()} className="text-lg font-bold mt-5 mb-2 text-white">{title}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace('### ', '');
        return <h3 key={i} id={title.replace(/\s+/g, '-').toLowerCase()} className="text-md font-semibold mt-4 mb-2 text-gray-200">{title}</h3>;
      }
      if (trimmed.startsWith('* ')) {
        return <li key={i} className="ml-5 list-disc text-sm text-gray-300 my-1">{trimmed.replace('* ', '')}</li>;
      }
      if (trimmed === '---') {
        return <hr key={i} className="my-5 border-gray-800" />;
      }
      if (trimmed === '') {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="text-sm text-gray-300 leading-relaxed my-2">{line}</p>;
    });
  };

  // Live SAFE generation logic
  const generateSafeDocumentText = () => {
    const amountFormatted = Number(investmentAmount).toLocaleString();
    const capFormatted = Number(valuationCap).toLocaleString();
    
    let typeName = "Valuation Cap Only";
    let conversionText = `Valuation Cap: $${capFormatted}. Under this type of SAFE, the investment amount will convert into Preferred Stock in the next priced round based on either the Valuation Cap or the round price per share, whichever is lower.`;
    
    if (safeType === 'mfn_only') {
      typeName = "Most Favored Nation (MFN) Only";
      conversionText = `Most Favored Nation (MFN) Status. Under this type of SAFE, there is no valuation cap or discount rate. Instead, this SAFE inherits the valuation cap and discount rate of any subsequent SAFE or convertible debt issued by the Company that has more favorable terms.`;
    } else if (safeType === 'cap_and_discount') {
      typeName = "Valuation Cap and Discount Rate";
      conversionText = `Valuation Cap: $${capFormatted} and Discount Rate: 80% (20% discount). Under this type of SAFE, the investment amount will convert based on either the Valuation Cap or an 80% discount applied to the price per share of the next equity financing round.`;
    }

    return `SIMPLE AGREEMENT FOR FUTURE EQUITY
(SAFE - Type: ${typeName})

THIS CERTIFIES THAT in exchange for the payment by ${investorName} (the "Investor") of $${amountFormatted} (the "Purchase Amount") on or about June 29, 2026, ${startupName}, a Private Limited Startup incorporated in ${incorporationState} (the "Company"), hereby issues to the Investor the right to certain shares of the Company's Capital Stock, subject to the terms set forth below.

1. Event-based Conversions
(a) Equity Financing. If there is an Equity Financing before the expiration or termination of this instrument, the Company will automatically issue to the Investor a number of shares of SAFE Preferred Stock equal to the Purchase Amount divided by the Conversion Price.
- ${conversionText}

(b) Liquidity Event. If there is a Liquidity Event (e.g. Acquisition or IPO) before the expiration of this SAFE, the Investor will, at its option, either (i) receive a cash payment equal to the Purchase Amount or (ii) receive a number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price.

(c) Dissolution Event. If there is a Dissolution Event before this instrument expires or terminates, the Company will pay an amount equal to the Purchase Amount, operating on parity with other SAFEs.

2. Company Representations
(a) The Company is a validly existing entity in good standing under the laws of ${incorporationState}, and has the power to execute this transaction.
(b) The execution, delivery and performance by the Company of this instrument has been duly authorized by all necessary corporate actions.

3. Miscellaneous
This SAFE is one of the series of SAFEs issued by the Company. All SAFEs in this series are pari passu in liquidation.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

COMPANY:
By: _______________________________
Name: ${profile?.name || 'Founder Representative'}
Title: Co-founder & CEO, ${startupName}

INVESTOR:
By: _______________________________
Name: Authorized Partner, ${investorName}
`;
  };

  const handleCopySafe = () => {
    navigator.clipboard.writeText(generateSafeDocumentText());
    setCopiedSafe(true);
    showToast('Custom SAFE legal agreement copied to clipboard!', 'success');
    setTimeout(() => setCopiedSafe(false), 2000);
  };

  // Cofounder Equity Splitter logic
  const calculateEquitySplit = () => {
    const totalPoints = sliderQ1 + sliderQ2 + sliderQ3 + sliderQ4 + sliderQ5;
    const maxPossiblePoints = 500;
    
    // Calculate A's percentage, B's is the remaining
    const percentA = Math.max(10, Math.min(90, Math.round((totalPoints / maxPossiblePoints) * 100)));
    const percentB = 100 - percentA;
    
    let advice = "A standard 50-50 split is recommended if both cofounders are bringing equal weight and working full-time without pay.";
    if (percentA > 55) {
      advice = `Cofounder A is recommended to take a larger share (${percentA}%) because they are providing more critical early value (IP creation, core engineering input, or full-time effort) compared to Cofounder B.`;
    } else if (percentB > 55) {
      advice = `Cofounder B is recommended to take a larger share (${percentB}%) because they are driving major execution channels (fundraising leadership, product development, or committing more full-time hours).`;
    }

    return { a: percentA, b: percentB, advice };
  };

  const splitResult = calculateEquitySplit();

  // Resource Categories & Filtering
  const categories = ['All', 'Becoming a Founder', 'Product & MVP', 'Fundraising', 'Legal', 'Financial Models', 'Guides'];
  const mediaTypes = ['All', 'video', 'document'];

  // Apply filters
  const filteredResources = resources.filter(res => {
    const matchesSearch = 
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.desc.toLowerCase().includes(search.toLowerCase()) ||
      (res.author && res.author.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = activeCategory === 'All' || res.category === activeCategory;
    const matchesMediaType = activeMediaType === 'All' || res.type === activeMediaType;
    const matchesBookmarked = !showBookmarkedOnly || res.bookmarked;

    return matchesSearch && matchesCategory && matchesMediaType && matchesBookmarked;
  });

  // Separate resources into YC Collections for home mode
  const founderResources = resources.filter(r => r.category === 'Becoming a Founder');
  const mvpResources = resources.filter(r => r.category === 'Product & MVP');
  const fundraisingResources = resources.filter(r => r.category === 'Fundraising');
  const legalResources = resources.filter(r => r.category === 'Legal' || r.category === 'Financial Models' || r.category === 'Guides');

  // Trigger search view when typing
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (val && libraryMode === 'home') {
      setLibraryMode('archive');
    }
  };

  // Reset all filters in sidebar
  const handleClearFilters = () => {
    setActiveCategory('All');
    setActiveMediaType('All');
    setShowBookmarkedOnly(false);
    setSearch('');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
        <div className="page-title-section">
          <h2 className="gradient-text">YC Startup Library</h2>
          <p>Explore lectures, founder playbook templates, funding generators, and split metrics from Y Combinator advice.</p>
        </div>
        
        {activeTab === 'library' && (
          <button 
            onClick={() => setShowUploadModal(true)} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Upload size={16} /> Publish Resource
          </button>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="segmented-tabs-container">
        <button
          onClick={() => setActiveTab('library')}
          className={`segmented-tab-button ${activeTab === 'library' ? 'active' : ''}`}
        >
          📚 Startup Library
        </button>
        <button
          onClick={() => setActiveTab('safe')}
          className={`segmented-tab-button ${activeTab === 'safe' ? 'active' : ''}`}
        >
          📄 SAFE Document Generator
        </button>
        <button
          onClick={() => setActiveTab('equity')}
          className={`segmented-tab-button ${activeTab === 'equity' ? 'active' : ''}`}
        >
          ⚖️ Cofounder Equity Splitter
        </button>
      </div>

      {/* RENDER LIBRARY HUB */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Central Search Bar */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search lectures, essays, legal codes, and templates..."
                style={{ width: '100%', paddingLeft: '2.75rem', height: '48px', fontSize: '0.92rem', borderRadius: '8px' }}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
            </div>

            {/* Toggle View Mode Button */}
            <button 
              onClick={() => setLibraryMode(libraryMode === 'home' ? 'archive' : 'home')}
              className="btn btn-outline"
              style={{ height: '48px', padding: '0 1.25rem', whiteSpace: 'nowrap', borderRadius: '8px' }}
            >
              {libraryMode === 'home' ? '📂 Browse Archive' : '🏠 Collections View'}
            </button>
          </div>

          {/* MODE 1: featured carousels */}
          {libraryMode === 'home' && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Banner Collection YC */}
              <div 
                className="glass-card" 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(242,101,34,0.06) 0%, rgba(30,41,59,0.4) 100%)', 
                  border: '1px solid rgba(242,101,34,0.15)',
                  padding: '2.5rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '2rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '65%' }}>
                  <span className="badge badge-secondary" style={{ width: 'fit-content', background: 'rgba(242,101,34,0.15)', color: '#f26522', fontWeight: 700 }}>Featured Collection</span>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>Startup School: Essential Advice</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Access YC’s most critical lectures and essays covering the launch phase, building MVPs, validation strategies, and pitch guidelines. Curated directly for startup founders.
                  </p>
                  <button 
                    onClick={() => { setLibraryMode('archive'); handleClearFilters(); }} 
                    className="btn btn-primary"
                    style={{ background: '#f26522', borderColor: '#f26522', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginTop: '0.5rem' }}
                  >
                    View All Library Templates <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ width: '100px', height: '100px', background: 'rgba(242, 101, 34, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f26522', flexShrink: 0 }}>
                  <BookOpen size={48} />
                </div>
              </div>

              {/* Playlist 1: Becoming a Founder */}
              {founderResources.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="flex-between">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={18} style={{ color: '#f26522' }} /> Becoming a Founder
                    </h3>
                    <button onClick={() => { setLibraryMode('archive'); setActiveCategory('Becoming a Founder'); }} className="btn btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                      See all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                    {founderResources.map(res => (
                      <div 
                        key={res.id} 
                        className="glass-card animate-glow" 
                        onClick={() => handleOpenResource(res)}
                        style={{ minWidth: '320px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)' }}>
                            {res.type === 'video' ? '🎥 Lecture Video' : '📄 Essay / Template'}
                          </span>
                          <button onClick={(e) => handleToggleBookmark(e, res.id)} style={{ background: 'none', border: 'none', color: res.bookmarked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                            <Bookmark size={16} fill={res.bookmarked ? 'var(--primary)' : 'none'} />
                          </button>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{res.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: 1.4 }}>{res.desc}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>By {res.author}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {res.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlist 2: Product & MVP */}
              {mvpResources.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="flex-between">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={18} style={{ color: 'var(--secondary)' }} /> Product & MVP Development
                    </h3>
                    <button onClick={() => { setLibraryMode('archive'); setActiveCategory('Product & MVP'); }} className="btn btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                      See all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                    {mvpResources.map(res => (
                      <div 
                        key={res.id} 
                        className="glass-card animate-glow" 
                        onClick={() => handleOpenResource(res)}
                        style={{ minWidth: '320px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)' }}>
                            {res.type === 'video' ? '🎥 Lecture Video' : '📄 Essay / Template'}
                          </span>
                          <button onClick={(e) => handleToggleBookmark(e, res.id)} style={{ background: 'none', border: 'none', color: res.bookmarked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                            <Bookmark size={16} fill={res.bookmarked ? 'var(--primary)' : 'none'} />
                          </button>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{res.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: 1.4 }}>{res.desc}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>By {res.author}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {res.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlist 3: Fundraising */}
              {fundraisingResources.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="flex-between">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Play size={18} style={{ color: 'var(--primary)' }} /> Fundraising & Capital
                    </h3>
                    <button onClick={() => { setLibraryMode('archive'); setActiveCategory('Fundraising'); }} className="btn btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                      See all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                    {fundraisingResources.map(res => (
                      <div 
                        key={res.id} 
                        className="glass-card animate-glow" 
                        onClick={() => handleOpenResource(res)}
                        style={{ minWidth: '320px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)' }}>
                            {res.type === 'video' ? '🎥 Lecture Video' : '📄 Essay / Template'}
                          </span>
                          <button onClick={(e) => handleToggleBookmark(e, res.id)} style={{ background: 'none', border: 'none', color: res.bookmarked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                            <Bookmark size={16} fill={res.bookmarked ? 'var(--primary)' : 'none'} />
                          </button>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{res.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: 1.4 }}>{res.desc}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>By {res.author}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {res.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Playlist 4: Legal & Operations */}
              {legalResources.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="flex-between">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} style={{ color: '#06b6d4' }} /> Legal & Operations Templates
                    </h3>
                    <button onClick={() => { setLibraryMode('archive'); setActiveCategory('Legal'); }} className="btn btn-outline" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
                      See all <ChevronRight size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                    {legalResources.map(res => (
                      <div 
                        key={res.id} 
                        className="glass-card animate-glow" 
                        onClick={() => handleOpenResource(res)}
                        style={{ minWidth: '320px', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                          <span className="badge badge-secondary" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)' }}>
                            {res.type === 'video' ? '🎥 Lecture Video' : '📄 Essay / Template'}
                          </span>
                          <button onClick={(e) => handleToggleBookmark(e, res.id)} style={{ background: 'none', border: 'none', color: res.bookmarked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                            <Bookmark size={16} fill={res.bookmarked ? 'var(--primary)' : 'none'} />
                          </button>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{res.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px', lineHeight: 1.4 }}>{res.desc}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>By {res.author}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {res.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* MODE 2: sidebar filter archive view */}
          {libraryMode === 'archive' && (
            <div style={{ display: 'flex', gap: '2rem', flex: 1, position: 'relative' }}>
              
              {/* Sidebar Filters */}
              <div 
                style={{ 
                  width: '260px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1.5rem', 
                  flexShrink: 0,
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                  paddingRight: '1.5rem'
                }}
              >
                <div className="flex-between">
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filters</h4>
                  <button onClick={handleClearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>Reset All</button>
                </div>

                {/* Media Type Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Format</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {mediaTypes.map(m => (
                      <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="mediaType" 
                          checked={activeMediaType === m}
                          onChange={() => setActiveMediaType(m)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        {m === 'All' ? 'All Formats' : m === 'video' ? 'Videos Only' : 'Essays & Templates'}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category List Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Topic Categories</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {categories.map(cat => {
                      const count = resources.filter(r => cat === 'All' || r.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'none',
                            border: 'none',
                            color: activeCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            cursor: 'pointer',
                            padding: '4px 0',
                            fontWeight: activeCategory === cat ? 700 : 400
                          }}
                        >
                          <span>{cat}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '4px' }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bookmarks Toggle */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={showBookmarkedOnly}
                      onChange={(e) => setShowBookmarkedOnly(e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>⭐ Bookmarked Resources</span>
                  </label>
                </div>
              </div>

              {/* Right Side Cards Area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Result Info & Active Badges */}
                <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Showing <strong>{filteredResources.length}</strong> resources in library
                  </span>
                  
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {activeCategory !== 'All' && (
                      <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                        Topic: {activeCategory} <X size={10} style={{ cursor: 'pointer' }} onClick={() => setActiveCategory('All')} />
                      </span>
                    )}
                    {activeMediaType !== 'All' && (
                      <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                        Type: {activeMediaType} <X size={10} style={{ cursor: 'pointer' }} onClick={() => setActiveMediaType('All')} />
                      </span>
                    )}
                    {showBookmarkedOnly && (
                      <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                        ⭐ Bookmarked <X size={10} style={{ cursor: 'pointer' }} onClick={() => setShowBookmarkedOnly(false)} />
                      </span>
                    )}
                  </div>
                </div>

                {/* List Grid */}
                {loading ? (
                  <div className="flex-center" style={{ padding: '4rem' }}>
                    <div className="pulse-loader"><div className="pulse-bubble" /></div>
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    <BookOpen size={42} />
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>No startup resources found</h4>
                    <p style={{ fontSize: '0.8rem', maxWidth: '300px' }}>Try clearing filters or running a new search query.</p>
                  </div>
                ) : (
                  <div className="grid-3" style={{ gap: '1rem' }}>
                    {filteredResources.map((res) => (
                      <div 
                        key={res.id} 
                        className="glass-card animate-glow" 
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', cursor: 'pointer' }}
                        onClick={() => handleOpenResource(res)}
                      >
                        <div className="flex-between">
                          <span className="badge badge-secondary" style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.06)' }}>
                            {res.type === 'video' ? '🎥 Lecture Video' : '📄 Essay / Template'}
                          </span>
                          <button onClick={(e) => handleToggleBookmark(e, res.id)} style={{ background: 'none', border: 'none', color: res.bookmarked ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                            <Bookmark size={15} fill={res.bookmarked ? 'var(--primary)' : 'none'} />
                          </button>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.25rem' }}>{res.title}</h4>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By {res.author} • {res.category}</span>
                        </div>

                        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{res.desc}</p>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>Size: {res.size}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> {res.views}</span>
                            {res.type === 'document' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDownload(res.id, res.title); }}
                                className="btn btn-outline" 
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Download size={11} /> {res.downloads}
                              </button>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* RENDER SAFE Generator */}
      {activeTab === 'safe' && (
        <div className="grid-2" style={{ gap: '2rem', flex: 1 }}>
          {/* SAFE Controls Form */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <FileCheck size={20} style={{ color: 'var(--secondary)' }} /> YC SAFE Legal parameters
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Fill in your investment details to compile a standard Simple Agreement for Future Equity document customized for your entity.</p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Startup Company Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={startupName}
                  onChange={(e) => setStartupName(e.target.value)}
                />
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Incorporation State</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={incorporationState}
                    onChange={(e) => setIncorporationState(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Investor Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={investorName}
                    onChange={(e) => setInvestorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Investment Amount ($)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valuation Cap ($)</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={valuationCap}
                    onChange={(e) => setValuationCap(e.target.value)}
                    disabled={safeType === 'mfn_only'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">SAFE Instrument Type</label>
                <select 
                  className="form-select"
                  value={safeType}
                  onChange={(e) => setSafeType(e.target.value)}
                >
                  <option value="cap_only">Valuation Cap Only</option>
                  <option value="cap_and_discount">Valuation Cap and Discount Rate</option>
                  <option value="mfn_only">Most Favored Nation (MFN) Only</option>
                </select>
              </div>
            </form>
          </div>

          {/* SAFE Document Preview Pane */}
          <div className="glass-card active-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#0e1526', border: '1px solid var(--border-glow)' }}>
            <div className="flex-between">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Document Preview</span>
              <button 
                onClick={handleCopySafe}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedSafe ? <Check size={14} /> : <Clipboard size={14} />} {copiedSafe ? 'Copied!' : 'Copy Draft'}
              </button>
            </div>

            <textarea 
              readOnly
              className="form-textarea"
              style={{ 
                flex: 1, 
                fontFamily: 'monospace', 
                fontSize: '0.72rem', 
                background: 'rgba(0,0,0,0.2)', 
                color: '#b3c4d9', 
                padding: '1rem', 
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.05)',
                resize: 'none',
                minHeight: '380px',
                lineHeight: 1.5
              }}
              value={generateSafeDocumentText()}
            />
          </div>
        </div>
      )}

      {/* RENDER Cofounder Equity Splitter */}
      {activeTab === 'equity' && (
        <div className="grid-2" style={{ gap: '2rem', flex: 1 }}>
          {/* Question Survey Sliders */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <Calculator size={20} style={{ color: 'var(--primary)' }} /> Equity survey metrics
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Adjust the sliders to reflect the relative strategic weights between Cofounder A (Left/Low) and Cofounder B (Right/High) for each category.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>💡 1. Initial Concept & Intellectual Property</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{sliderQ1 < 45 ? 'Cofounder A' : sliderQ1 > 55 ? 'Cofounder B' : 'Equal Split'}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="90" 
                  value={sliderQ1} 
                  onChange={(e) => setSliderQ1(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>💻 2. Technical Codebase & Platform Engineering</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{sliderQ2 < 45 ? 'Cofounder A' : sliderQ2 > 55 ? 'Cofounder B' : 'Equal Split'}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="90" 
                  value={sliderQ2} 
                  onChange={(e) => setSliderQ2(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>⏰ 3. Commitment, Effort & Daily Hours</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{sliderQ3 < 45 ? 'Cofounder A' : sliderQ3 > 55 ? 'Cofounder B' : 'Equal Split'}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="90" 
                  value={sliderQ3} 
                  onChange={(e) => setSliderQ3(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>📢 4. Fundraising Pitches & Business Development</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{sliderQ4 < 45 ? 'Cofounder A' : sliderQ4 > 55 ? 'Cofounder B' : 'Equal Split'}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="90" 
                  value={sliderQ4} 
                  onChange={(e) => setSliderQ4(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600 }}>🚀 5. Domain Expertise, Connections & Prior Exits</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{sliderQ5 < 45 ? 'Cofounder A' : sliderQ5 > 55 ? 'Cofounder B' : 'Equal Split'}</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="90" 
                  value={sliderQ5} 
                  onChange={(e) => setSliderQ5(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Equity Split visual outcome */}
          <div className="glass-card active-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', textAlign: 'center', fontWeight: 700 }}>Recommended Shares Split</h3>
            
            {/* Visual Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  <span>Cofounder A Share</span>
                  <span>{splitResult.a}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${splitResult.a}%`, height: '100%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '6px' }} />
                </div>
              </div>

              <div>
                <div className="flex-between" style={{ marginBottom: '0.35rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  <span>Cofounder B Share</span>
                  <span>{splitResult.b}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${splitResult.b}%`, height: '100%', background: 'linear-gradient(135deg, var(--secondary) 0%, #06b6d4 100%)', borderRadius: '6px' }} />
                </div>
              </div>
            </div>

            {/* Strategic Advice Text */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Decision Guidance</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{splitResult.advice}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* IMMERSIVE MEDIA DETAIL VIEWER MODAL */}
      {selectedResource && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(8px)' }}>
          
          {selectedResource.type === 'video' ? (
            /* VIDEO MODAL */
            <div 
              className="glass-card slide-up" 
              style={{ 
                width: '94%', 
                maxWidth: '1000px', 
                background: 'var(--bg-popover)', 
                padding: '2rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.25rem', 
                maxHeight: '92vh', 
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {/* Modal Top Header */}
              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 className="gradient-text" style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedResource.title}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {selectedResource.author} • Category: {selectedResource.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={(e) => handleToggleBookmark(e, selectedResource.id)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    <Bookmark size={14} fill={selectedResource.bookmarked ? 'var(--primary)' : 'none'} style={{ color: selectedResource.bookmarked ? 'var(--primary)' : 'var(--text-muted)' }} />
                    {selectedResource.bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button 
                    onClick={() => setSelectedResource(null)} 
                    className="btn btn-outline"
                    style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Video Player + Chapters Layout */}
              <div className="grid-2" style={{ gap: '1.5rem', gridTemplateColumns: '2fr 1fr' }}>
                
                {/* Left Side: Video Player Embed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ width: '100%', paddingBottom: '56.25%', position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <iframe
                      src={`${selectedResource.videoUrl}?start=${videoStartSec}&autoplay=1`}
                      title={selectedResource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                </div>

                {/* Right Side: Interactive Chapters */}
                <div 
                  className="glass-card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.75rem', 
                    background: 'rgba(0,0,0,0.15)',
                    padding: '1rem',
                    maxHeight: '380px',
                    overflowY: 'auto'
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <Play size={14} style={{ color: 'var(--primary)' }} /> Video Chapters
                  </h4>
                  {selectedResource.chapters && selectedResource.chapters.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedResource.chapters.map((ch, idx) => (
                        <button
                          key={idx}
                          onClick={() => setVideoStartSec(parseTimestampToSeconds(ch.timestamp))}
                          style={{
                            display: 'flex',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            color: 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>{ch.timestamp}</span>
                          <span style={{ color: 'var(--text-primary)' }}>{ch.title}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No chapters available for this lecture.</span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Transcript & Details */}
              <div className="grid-2" style={{ gap: '1.5rem', gridTemplateColumns: '2.3fr 0.7fr' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Lecture Transcript</h4>
                  <div 
                    style={{ 
                      maxHeight: '220px', 
                      overflowY: 'auto', 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '1rem', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.82rem',
                      lineHeight: 1.5,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedResource.transcript || 'No transcript text available.'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Meta Stats</h4>
                  <div className="glass-card" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', fontSize: '0.78rem' }}>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Total Views:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedResource.views} views</span>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedResource.duration}</span>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Author:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedResource.author}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* ESSAY / DOCUMENT MODAL */
            <div 
              className="glass-card slide-up" 
              style={{ 
                width: '94%', 
                maxWidth: '1100px', 
                background: 'var(--bg-popover)', 
                padding: '2.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.5rem', 
                maxHeight: '92vh', 
                overflowY: 'auto',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              
              {/* Top Action Header */}
              <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.85rem' }}>
                <div>
                  <h3 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.3px' }}>{selectedResource.title}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>By {selectedResource.author} • Category: {selectedResource.category} • {selectedResource.readTime || '5 min'} read</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button onClick={(e) => handleToggleBookmark(e, selectedResource.id)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                    <Bookmark size={14} fill={selectedResource.bookmarked ? 'var(--primary)' : 'none'} style={{ color: selectedResource.bookmarked ? 'var(--primary)' : 'var(--text-muted)' }} />
                    {selectedResource.bookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button 
                    onClick={() => { handleDownload(selectedResource.id, selectedResource.title); }}
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Download size={14} /> Download {selectedResource.fileType}
                  </button>
                  <button 
                    onClick={() => setSelectedResource(null)} 
                    className="btn btn-outline"
                    style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Document Reading View: Left Outline, Center Article */}
              <div className="grid-3" style={{ gap: '2rem', gridTemplateColumns: '0.7fr 2.3fr' }}>
                
                {/* Left Panel: Dynamic Table of Contents */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 0, height: 'fit-content' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Document Outline</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '0.75rem' }}>
                    {selectedResource.content?.split('\n').filter(line => line.trim().startsWith('# ') || line.trim().startsWith('## ')).map((line, idx) => {
                      const isH1 = line.trim().startsWith('# ');
                      const headingText = line.replace(/^(#|##)\s+/, '').trim();
                      const slug = headingText.replace(/\s+/g, '-').toLowerCase();
                      return (
                        <a
                          key={idx}
                          href={`#${slug}`}
                          style={{
                            display: 'block',
                            fontSize: isH1 ? '0.78rem' : '0.72rem',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            paddingLeft: isH1 ? 0 : '0.5rem',
                            fontWeight: isH1 ? 700 : 400,
                            padding: '3px 0'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {headingText}
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Center Panel: Beautiful scrollable article column */}
                <div 
                  style={{ 
                    maxHeight: '60vh', 
                    overflowY: 'auto', 
                    paddingRight: '1rem',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    padding: '1.5rem',
                    borderRadius: '8px'
                  }}
                >
                  {renderMarkdownContent(selectedResource.content)}
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* DETAILED PUBLISH/UPLOAD MODAL */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div className="glass-card slide-up" style={{ width: '94%', maxWidth: '650px', background: 'var(--bg-popover)', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Publish to Startup Resource Library</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Select Type */}
              <div className="form-group">
                <label className="form-label">Resource Type</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setPubType('document')}
                    className={`btn ${pubType === 'document' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                  >
                    📄 Document / Essay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPubType('video')}
                    className={`btn ${pubType === 'video' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1 }}
                  >
                    🎥 Lecture Video
                  </button>
                </div>
              </div>

              {/* Title & Author */}
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Resource Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Garry Tan: Pitch Deck Review"
                    value={pubTitle} 
                    onChange={(e) => setPubTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author / Host Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Paul Graham"
                    value={pubAuthor} 
                    onChange={(e) => setPubAuthor(e.target.value)} 
                  />
                </div>
              </div>

              {/* Category & Details */}
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select" 
                    value={pubCategory} 
                    onChange={(e) => setPubCategory(e.target.value)}
                  >
                    <option value="Becoming a Founder">Becoming a Founder</option>
                    <option value="Product & MVP">Product & MVP</option>
                    <option value="Fundraising">Fundraising</option>
                    <option value="Legal">Legal</option>
                    <option value="Financial Models">Financial Models</option>
                    <option value="Guides">Guides</option>
                  </select>
                </div>

                {pubType === 'document' ? (
                  <div className="form-group">
                    <label className="form-label">File Format (e.g. PDF/Markdown)</label>
                    <select 
                      className="form-select" 
                      value={pubFileType} 
                      onChange={(e) => setPubFileType(e.target.value)}
                    >
                      <option value="PDF">PDF</option>
                      <option value="Essay">Essay</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLSX">XLSX</option>
                      <option value="Figma Outline">Figma Outline</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Video Duration (e.g. 12:45)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pubDuration}
                      onChange={(e) => setPubDuration(e.target.value)}
                      placeholder="e.g. 14:20"
                    />
                  </div>
                )}
              </div>

              {/* Format Details or Video Details */}
              {pubType === 'document' ? (
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">File Size (e.g. 1.2 MB)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={pubSize} 
                      onChange={(e) => setPubSize(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Read Time (e.g. 5 min)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={pubReadTime} 
                      onChange={(e) => setPubReadTime(e.target.value)} 
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">YouTube Embed URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="e.g. https://www.youtube.com/embed/S2p-y-X-50g"
                    value={pubVideoUrl} 
                    onChange={(e) => setPubVideoUrl(e.target.value)} 
                    required={pubType === 'video'}
                  />
                </div>
              )}

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea 
                  className="form-textarea" 
                  style={{ height: '70px' }}
                  placeholder="Summarize what this resource is about..."
                  value={pubDesc} 
                  onChange={(e) => setPubDesc(e.target.value)} 
                  required 
                />
              </div>

              {/* Conditional Large Fields: Essay Content OR Chapters/Transcript */}
              {pubType === 'document' ? (
                <div className="form-group">
                  <label className="form-label">Document URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="e.g. https://example.com/file.pdf"
                    value={pubDocUrl}
                    onChange={(e) => setPubDocUrl(e.target.value)}
                  />
                  <div style={{ height: '0.5rem' }} />
                  <label className="form-label">Full Essay Content (supports #, ## headers & bullet lists)</label>
                  <textarea 
                    className="form-textarea" 
                    style={{ height: '180px', fontFamily: 'monospace', fontSize: '0.78rem' }}
                    placeholder="# Section Title&#10;&#10;Use standard markdown tags to structure the reading layout outline."
                    value={pubContent} 
                    onChange={(e) => setPubContent(e.target.value)} 
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Video Chapters (Format: `MM:SS - Chapter Title`, one per line)</label>
                    <textarea 
                      className="form-textarea" 
                      style={{ height: '90px', fontFamily: 'monospace', fontSize: '0.78rem' }}
                      placeholder="0:00 - Introduction&#10;1:15 - Core Concepts&#10;8:40 - Summary"
                      value={pubChaptersText} 
                      onChange={(e) => setPubChaptersText(e.target.value)} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Video Transcript Text</label>
                    <textarea 
                      className="form-textarea" 
                      style={{ height: '120px', fontSize: '0.8rem' }}
                      placeholder="Paste the audio transcript here..."
                      value={pubTranscript} 
                      onChange={(e) => setPubTranscript(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
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
                  {uploading ? 'Publishing...' : 'Publish to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
