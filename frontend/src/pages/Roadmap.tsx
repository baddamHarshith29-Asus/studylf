import React, { useState, useEffect } from 'react';
import { 
  Check, BookOpen, Download, AlertCircle, Sparkles, Folder, 
  ChevronDown, ChevronUp, Plus, Trash2, Save, RefreshCw, Target, 
  X, Clipboard, ListTodo, Calendar, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

interface StoryboardSlide {
  id: number;
  title: string;
  guidance: string;
  placeholder: string;
}

interface ResourceTemplate {
  id: string;
  title: string;
  category: string;
  fileType: string;
  desc: string;
  size: string;
  downloads: number;
}

interface LocalRoadmapTask {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  guideId?: string;
  week: number;
  description: string;
  notes: string;
  subtasks: SubTask[];
  isCustom: boolean;
}

const STAGES = ["Idea", "Validation", "MVP", "Revenue", "Fundraising"];

const WEEK_THEMES: Record<string, Record<number, { title: string, subtitle: string }>> = {
  Idea: {
    1: { title: "Foundations & Value Prop", subtitle: "Define core problem, elevator pitch and customer segments" },
    2: { title: "Customer Discovery", subtitle: "Prepare script and conduct user discovery interviews" },
    3: { title: "Market & Competition", subtitle: "Map direct/indirect competitors and calculate TAM" },
    4: { title: "AI Validation Scan", subtitle: "Run Studlyf AI validation and draft final feasibility scorecards" }
  },
  Validation: {
    1: { title: "Landing Page & Copy", subtitle: "Create website layout, copy, and set up waitlist forms" },
    2: { title: "Analytics & Early Traffic", subtitle: "Integrate analytics tracking and drive first visitors" },
    3: { title: "Waitlist Distribution", subtitle: "Scale outreach on public channels to secure signups" },
    4: { title: "Monetization & Scoping", subtitle: "Run pricing analysis and scope essential MVP feature sets" }
  },
  MVP: {
    1: { title: "Stack & DB Schemas", subtitle: "Choose technologies and map system blueprints" },
    2: { title: "Core Development", subtitle: "Build basic transactional flow and set up authentication" },
    3: { title: "Deployment & Infrastructure", subtitle: "Deploy code to cloud hosting and setup production database" },
    4: { title: "Beta User Backlog", subtitle: "Onboard friendly testers, capture session feedback, and log bugs" }
  },
  Revenue: {
    1: { title: "Stripe & Checkout Grid", subtitle: "Register payment gateways and build frontend pricing tables" },
    2: { title: "Launch & Announcements", subtitle: "Publish on product directories and email waitlists" },
    3: { title: "Direct Sales Loop", subtitle: "Contact hot leads, conduct product demos, and close initial clients" },
    4: { title: "Customer Success Setup", subtitle: "Install live chat widgets and outline onboarding docs" }
  },
  Fundraising: {
    1: { title: "Legal Registration", subtitle: "Incorporate corporate entities and execute founder SHAs" },
    2: { title: "Pitch Deck Narrative", subtitle: "Draft slide outlines and construct Sequoia storyboards" },
    3: { title: "Financial Forecasting", subtitle: "Build 3-year P&L forecasts and set up secure investor drives" },
    4: { title: "Investor Pipelines", subtitle: "Map angel contacts and initiate cold outreach campaigns" }
  }
};

export default function Roadmap() {
  const { profile, fetchProfile, fetchWorkspaceData } = useAuth();
  
  // Page / Tab states
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'storyboard'>('roadmap');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ResourceTemplate[]>([]);

  // Roadmap GPS Navigation states
  const [activeStage, setActiveStage] = useState<string>(profile.stage || 'Idea');
  const [selectedStage, setSelectedStage] = useState<string>(profile.stage || 'Idea');
  const [tasks, setTasks] = useState<LocalRoadmapTask[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true, 2: true, 3: true, 4: true
  });
  
  // Task detail drawer states
  const [selectedTask, setSelectedTask] = useState<LocalRoadmapTask | null>(null);
  const [notesText, setNotesText] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Custom Task Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskWeek, setNewTaskWeek] = useState(1);
  const [newTaskCategory, setNewTaskCategory] = useState('Custom');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Pitch Storyboard states
  const [storyboard, setStoryboard] = useState<StoryboardSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(1);
  const [sbLoading, setSbLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (profile.stage) {
      setActiveStage(profile.stage);
    }
  }, [profile.stage]);

  useEffect(() => {
    fetchRoadmapData(selectedStage);
  }, [selectedStage, activeStage]);

  const fetchResources = async () => {
    try {
      const response = await apiFetch('/api/resources');
      if (response.ok) {
        setResources(await response.json());
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const fetchRoadmapData = async (stageName: string) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/roadmap?stage=${stageName}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setProgress(data.progress || 0);
        if (data.activeStage) {
          setActiveStage(data.activeStage);
        }
      }
    } catch (err) {
      console.error('Error fetching stage roadmap:', err);
      showToast('Error loading roadmap data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening the drawer when checking off a task
    
    // Optimistic UI update
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    
    // Recompute progress locally
    const completed = updatedTasks.filter(t => t.completed).length;
    setProgress(updatedTasks.length > 0 ? Math.round((completed / updatedTasks.length) * 100) : 0);

    try {
      const response = await apiFetch('/api/roadmap/toggle', {
        method: 'POST',
        body: JSON.stringify({ id: taskId })
      });
      const data = await response.json();
      if (!data.success) {
        setTasks(previousTasks);
        showToast('Failed to update task status.', 'error');
      } else {
        // Update global app state since dashboard shows progress
        await fetchWorkspaceData();
      }
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
      showToast('Connection error toggling task.', 'error');
    }
  };

  const handleSetTargetStage = async () => {
    try {
      const response = await apiFetch('/api/profile', {
        method: 'POST',
        body: JSON.stringify({ stage: selectedStage })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast(`Active GPS target updated to ${selectedStage}!`, 'success');
          setActiveStage(selectedStage);
          await fetchProfile(); // Update global auth context
          await fetchWorkspaceData();
        } else {
          showToast('Failed to update stage.', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating active stage.', 'error');
    }
  };

  // Task Details Drawer actions
  const handleOpenTaskDetails = (task: LocalRoadmapTask) => {
    setSelectedTask(task);
    setNotesText(task.notes || '');
    setSubtasks(task.subtasks || []);
    setNewSubtaskText('');
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSub: SubTask = {
      id: `st-${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  const handleSaveTaskDetails = async () => {
    if (!selectedTask) return;
    setIsSavingTask(true);
    try {
      const response = await apiFetch('/api/roadmap/task/update', {
        method: 'POST',
        body: JSON.stringify({
          id: selectedTask.id,
          notes: notesText,
          subtasks: subtasks
        })
      });
      if (response.ok) {
        showToast('Task execution plans saved successfully!', 'success');
        // Update local list
        const updated = tasks.map(t => t.id === selectedTask.id ? { ...t, notes: notesText, subtasks: subtasks } : t);
        setTasks(updated);
        setSelectedTask({ ...selectedTask, notes: notesText, subtasks: subtasks });
        await fetchWorkspaceData();
      } else {
        showToast('Failed to save task details.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving details.', 'error');
    } finally {
      setIsSavingTask(false);
    }
  };

  // Add Custom Task actions
  const handleAddCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await apiFetch('/api/roadmap/task/add', {
        method: 'POST',
        body: JSON.stringify({
          stage: selectedStage,
          week: Number(newTaskWeek),
          text: newTaskText.trim(),
          category: newTaskCategory,
          description: newTaskDescription.trim()
        })
      });
      if (response.ok) {
        showToast('Custom objective added successfully!', 'success');
        setIsAddModalOpen(false);
        setNewTaskText('');
        setNewTaskDescription('');
        setNewTaskWeek(1);
        setNewTaskCategory('Custom');
        // Refresh local tasks list
        await fetchRoadmapData(selectedStage);
        await fetchWorkspaceData();
      } else {
        showToast('Failed to add custom task.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error creating task.', 'error');
    }
  };

  // Delete Task Action
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await apiFetch('/api/roadmap/task/delete', {
        method: 'POST',
        body: JSON.stringify({ id: taskId })
      });
      if (response.ok) {
        showToast('Objective deleted successfully!', 'success');
        setSelectedTask(null);
        await fetchRoadmapData(selectedStage);
        await fetchWorkspaceData();
      } else {
        showToast('Failed to delete objective.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting task.', 'error');
    }
  };

  // Reset Playbook action
  const handleResetPlaybook = async () => {
    setIsResetConfirmOpen(false);
    setLoading(true);
    try {
      const response = await apiFetch('/api/roadmap/reset', {
        method: 'POST',
        body: JSON.stringify({ stage: selectedStage })
      });
      if (response.ok) {
        showToast(`Reset ${selectedStage} playbook to standard default outline.`, 'success');
        await fetchRoadmapData(selectedStage);
        await fetchWorkspaceData();
      } else {
        showToast('Failed to reset playbook.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error resetting playbook.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Interactive Storyboard functions
  const fetchStoryboard = async () => {
    setSbLoading(true);
    try {
      const response = await apiFetch('/api/roadmap/storyboard');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStoryboard(data.storyboard || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSbLoading(false);
    }
  };

  const handleSaveSlide = async (slideId: number, textVal: string) => {
    const updated = storyboard.map(s => s.id === slideId ? { ...s, placeholder: textVal } : s);
    setStoryboard(updated);
    try {
      await apiFetch('/api/roadmap/storyboard/save', {
        method: 'POST',
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

  const getCategoryStyle = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'validation':
        return { background: 'rgba(239, 43, 112, 0.08)', color: 'var(--primary)', border: '1px solid rgba(239, 43, 112, 0.2)' };
      case 'research':
        return { background: 'rgba(14, 165, 233, 0.08)', color: '#0ea5e9', border: '1px solid rgba(14, 165, 233, 0.2)' };
      case 'mvp':
        return { background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'growth':
        return { background: 'rgba(99, 102, 241, 0.08)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' };
      case 'finance':
        return { background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'legal':
        return { background: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' };
      case 'pitching':
        return { background: 'rgba(236, 72, 153, 0.08)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)' };
      default:
        return { background: 'rgba(100, 116, 139, 0.08)', color: '#64748b', border: '1px solid rgba(100, 116, 139, 0.2)' };
    }
  };

  const getStageAdvisoryText = (stage: string) => {
    switch (stage) {
      case 'Idea':
        return "Your main focus is customer discovery and validation. Document core customer frustrations and conduct at least 10 interviews before building code. Seek high-frequency friction patterns.";
      case 'Validation':
        return "Launch an online waitlist and collect initial analytics signals. Write high-conversion marketing copy and publish public outlines on LinkedIn or Twitter to aggregate 50-100 emails.";
      case 'MVP':
        return "Build a single-purpose interactive flow. Minimize feature bloat and provision secure cloud databases. Deploy prototype pipelines and onboard 5 friendly beta feedback testers.";
      case 'Revenue':
        return "Charge early to separate active users from casual signups. Integrate Stripe checkout tables, coordinate Product Hunt launch plans, and schedule 20 product demos directly.";
      case 'Fundraising':
        return "Legally incorporate private structures and draft SHA splits. Customize Sequoia elevator stories, compile shared data rooms, and establish angel contact pipelines.";
      default:
        return "";
    }
  };

  const toggleWeekExpand = (w: number) => {
    setExpandedWeeks(prev => ({ ...prev, [w]: !prev[w] }));
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h2 className="gradient-text">Founder GPS & Roadmap</h2>
          <p>Structured stage playbooks and weekly roadmap trackers designed to navigate your startup build workflow.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.85rem' }}>
            <Target size={12} /> Active Goal: {activeStage} Stage
          </span>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="tabs-header" style={{ marginBottom: '0.5rem' }}>
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
        <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Stage Timeline Stepper (Founder Institute Model) */}
          <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} style={{ color: 'var(--primary)' }} /> Stage Curriculum Playbooks
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Click steps to view other roadmap playbooks
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              position: 'relative', 
              margin: '0 auto 1.5rem',
              maxWidth: '850px'
            }}>
              {/* Stepper connecting line */}
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                left: '20px', 
                right: '20px', 
                height: '3px', 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-light)',
                zIndex: 1 
              }} />

              {STAGES.map((stg, idx) => {
                const isActive = stg === activeStage;
                const isSelected = stg === selectedStage;
                
                return (
                  <div 
                    key={stg} 
                    onClick={() => setSelectedStage(stg)}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      zIndex: 2,
                      width: '100px'
                    }}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                      border: isSelected 
                        ? '3px solid #fff' 
                        : isActive 
                          ? '2px solid var(--primary)' 
                          : '1px solid var(--border-light)',
                      color: isSelected ? '#fff' : isActive ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 700, 
                      fontSize: '0.9rem',
                      boxShadow: isSelected ? '0 0 15px rgba(239, 43, 112, 0.4)' : 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}>
                      {idx + 1}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: 'var(--success)',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: '2px solid #fff'
                        }} title="Your Active Target Stage" />
                      )}
                    </div>
                    <span style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.78rem', 
                      fontWeight: isSelected || isActive ? 600 : 400,
                      color: isSelected ? 'var(--text-primary)' : isActive ? 'var(--primary)' : 'var(--text-muted)'
                    }}>
                      {stg}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Active stage target updates banner */}
            {selectedStage !== activeStage && (
              <div className="fade-in" style={{
                background: 'rgba(107, 108, 255, 0.05)',
                border: '1px solid rgba(107, 108, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
                  <span>Viewing <strong>{selectedStage} playbook</strong>. Your active GPS target is set to <strong>{activeStage} Stage</strong>.</span>
                </div>
                <button 
                  onClick={handleSetTargetStage}
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderColor: 'rgba(107, 108, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Target size={12} /> Set as Active GPS Target
                </button>
              </div>
            )}
          </div>

          {/* Main Layout Area: Left Timeline, Right Advisor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'flex-start' }}>
            
            {/* Left Column: Weekly Playbook Accordions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Weekly Playbook Checklist</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Complete the structured milestones inside week milestones
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="btn btn-secondary" 
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={12} /> Reset Playbook
                  </button>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary" 
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={12} /> Custom Objective
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="glass-card flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '1rem' }}>
                  <div className="pulse-loader">
                    <div className="pulse-bubble" />
                    <div className="pulse-bubble" />
                    <div className="pulse-bubble" />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading Playbook Curriculum...</span>
                </div>
              ) : (
                [1, 2, 3, 4].map(wk => {
                  const weekTasks = tasks.filter(t => t.week === wk);
                  const completedCount = weekTasks.filter(t => t.completed).length;
                  const totalCount = weekTasks.length;
                  const weekProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const isExpanded = expandedWeeks[wk];
                  const theme = WEEK_THEMES[selectedStage]?.[wk] || { title: `Week ${wk} Objectives`, subtitle: "Focus on early stage tasks" };

                  return (
                    <div 
                      key={wk} 
                      className="glass-card" 
                      style={{ 
                        padding: 0, 
                        overflow: 'hidden',
                        border: isExpanded ? '1px solid rgba(107,108,255,0.2)' : '1px solid var(--border-light)',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      {/* Accordion Week Header */}
                      <div 
                        onClick={() => toggleWeekExpand(wk)}
                        style={{ 
                          padding: '1.25rem 1.5rem', 
                          background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingRight: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Week {wk} Milestone
                          </span>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{theme.title}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{theme.subtitle}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                          {/* Mini Progress Indicator */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                              {completedCount}/{totalCount} Completed
                            </span>
                            <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${weekProgress}%`, height: '100%', background: 'var(--success)' }} />
                            </div>
                          </div>

                          {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      </div>

                      {/* Accordion Week Content */}
                      {isExpanded && (
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {weekTasks.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              No objectives set for this week. Click "Custom Objective" to add one.
                            </div>
                          ) : (
                            weekTasks.map(t => {
                              const hasNotes = t.notes && t.notes.trim().length > 0;
                              const subCompleted = t.subtasks ? t.subtasks.filter(s => s.completed).length : 0;
                              const subTotal = t.subtasks ? t.subtasks.length : 0;
                              
                              return (
                                <div 
                                  key={t.id}
                                  onClick={() => handleOpenTaskDetails(t)}
                                  className={`task-item ${t.completed ? 'completed' : ''}`}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.85rem 1rem',
                                    background: 'rgba(255,255,255,0.01)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {/* Custom Checkbox */}
                                  <button 
                                    onClick={(e) => handleToggleTask(t.id, e)}
                                    className={`task-checkbox ${t.completed ? 'checked' : ''}`}
                                    style={{ flexShrink: 0 }}
                                  >
                                    {t.completed && <Check size={14} />}
                                  </button>

                                  <div style={{ flex: 1, marginLeft: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                      <span style={{ 
                                        fontSize: '0.88rem', 
                                        fontWeight: 500, 
                                        textDecoration: t.completed ? 'line-through' : 'none',
                                        color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)' 
                                      }}>
                                        {t.text}
                                      </span>
                                    </div>

                                    {/* Task Badges */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      
                                      {/* Subtasks checklist progress */}
                                      {subTotal > 0 && (
                                        <span style={{ 
                                          fontSize: '0.68rem', 
                                          background: 'rgba(255,255,255,0.03)', 
                                          border: '1px solid var(--border-light)',
                                          padding: '0.15rem 0.4rem', 
                                          borderRadius: '4px',
                                          color: 'var(--text-secondary)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}>
                                          <ListTodo size={10} /> {subCompleted}/{subTotal}
                                        </span>
                                      )}

                                      {/* Notes Indicator */}
                                      {hasNotes && (
                                        <span style={{ 
                                          fontSize: '0.68rem', 
                                          background: 'rgba(107, 108, 255, 0.05)', 
                                          border: '1px solid rgba(107, 108, 255, 0.2)',
                                          padding: '0.15rem 0.4rem', 
                                          borderRadius: '4px',
                                          color: 'var(--secondary)'
                                        }}>
                                          📝 Notes
                                        </span>
                                      )}

                                      {/* Custom indicator */}
                                      {t.isCustom && (
                                        <span style={{ 
                                          fontSize: '0.68rem', 
                                          background: 'rgba(245, 158, 11, 0.05)', 
                                          border: '1px solid rgba(245, 158, 11, 0.2)',
                                          padding: '0.15rem 0.4rem', 
                                          borderRadius: '4px',
                                          color: 'var(--warning)'
                                        }}>
                                          Custom
                                        </span>
                                      )}

                                      {/* File Resource Link */}
                                      {t.guideId && (
                                        <span style={{ 
                                          fontSize: '0.68rem', 
                                          background: 'rgba(6, 182, 212, 0.05)', 
                                          border: '1px solid rgba(6, 182, 212, 0.2)',
                                          padding: '0.15rem 0.4rem', 
                                          borderRadius: '4px',
                                          color: '#06b6d4',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}>
                                          <Folder size={10} /> File
                                        </span>
                                      )}

                                      <span className="badge" style={{ ...getCategoryStyle(t.category), fontSize: '0.65rem', textTransform: 'capitalize' }}>
                                        {t.category}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <button 
                            onClick={() => {
                              setNewTaskWeek(wk);
                              setIsAddModalOpen(true);
                            }}
                            style={{ 
                              padding: '0.6rem', 
                              border: '1px dashed var(--border-light)',
                              background: 'transparent',
                              borderRadius: '8px',
                              color: 'var(--text-secondary)',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              marginTop: '0.25rem',
                              transition: 'all 0.15s ease'
                            }}
                            className="task-item-add-btn"
                          >
                            <Plus size={12} /> Add custom objective to Week {wk}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Progress Dashboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Playbook Progress Card */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Playbook Progress</h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{progress}%</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>completed</span>
                </div>

                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.4s ease' }} />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Marking objectives complete raises your overall Startup Readiness index and shows investor verification tracking signals.
                </p>
              </div>

              {/* Advisory Board */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem' }}>
                  <Sparkles size={15} style={{ color: 'var(--secondary)' }} /> {selectedStage} Stage Advisor
                </h3>
                <p style={{ fontSize: '0.82rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {getStageAdvisoryText(selectedStage)}
                </p>
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(6, 182, 212, 0.05)',
                  border: '1px solid rgba(6, 182, 212, 0.15)',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)'
                }}>
                  💡 <strong>Reference Curriculum:</strong> Vetted models from Founder Institute. Focus on validation checks before building.
                </div>
              </div>

              {/* Associated templates list */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Associated Templates</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {resources.slice(0, 3).map((res) => (
                    <div 
                      key={res.id} 
                      onClick={() => {
                        const matchedTask = tasks.find(t => t.guideId === res.id);
                        if (matchedTask) {
                          handleOpenTaskDetails(matchedTask);
                        } else {
                          showToast(`Template: ${res.title}`, 'info');
                        }
                      }}
                      style={{ 
                        padding: '0.6rem 0.85rem', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                      className="task-item"
                    >
                      <div style={{ fontWeight: 600, color: 'var(--secondary)' }}>{res.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.15rem' }}>{res.category} • {res.fileType}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Sliding Task Details Drawer (Notion style) */}
          {selectedTask && (
            <div 
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
                background: 'rgba(0, 0, 0, 0.6)', zIndex: 110, display: 'flex',
                justifyContent: 'flex-end', backdropFilter: 'blur(3px)',
                animation: 'fadeIn 0.2s ease'
              }} 
              onClick={() => setSelectedTask(null)}
            >
              <div 
                className="slide-up"
                style={{
                  width: '100%', maxWidth: '520px', height: '100%',
                  background: 'var(--bg-popover)', borderLeft: '1px solid var(--border-light)',
                  padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
                  boxShadow: 'var(--shadow-premium)', overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Week {selectedTask.week}</span>
                      <span className="badge" style={{ ...getCategoryStyle(selectedTask.category), fontSize: '0.65rem' }}>{selectedTask.category}</span>
                      {selectedTask.isCustom && <span className="badge" style={{ background: 'rgba(245,158,11,0.08)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.65rem' }}>Custom</span>}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.3 }}>
                      {selectedTask.text}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Guide Context */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Objective Guide & Context
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {selectedTask.description || "Establish clear weekly execution steps to reach stage feasibility metrics."}
                  </p>
                </div>

                {/* Resource Template Widget */}
                {selectedTask.guideId && (() => {
                  const resource = resources.find(r => r.id === selectedTask.guideId);
                  if (!resource) return null;
                  return (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: '8px', 
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>
                          Linked Playbook Template
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{resource.fileType}</span>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{resource.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{resource.desc}</p>
                      </div>

                      {resource.category === 'Legal' && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          fontSize: '0.7rem',
                          color: 'var(--danger)'
                        }}>
                          ⚠️ Legal drafts should be reviewed by professional counsel prior to signing.
                        </div>
                      )}

                      <button 
                        onClick={() => {
                          showToast(`Downloading template file: ${resource.title}... Link copied.`, 'success');
                          navigator.clipboard.writeText(`Template Resource: /resources/${resource.id}`);
                        }} 
                        className="btn btn-secondary" 
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <Download size={13} /> Get Template Outline
                      </button>
                    </div>
                  );
                })()}

                {/* Notion Subtasks list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    Sub-tasks Checklist ({subtasks.filter(s => s.completed).length}/{subtasks.length})
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {subtasks.map(sub => (
                      <div 
                        key={sub.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0.5rem',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <button
                            onClick={() => handleToggleSubtask(sub.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
                          >
                            {sub.completed ? (
                              <span style={{ color: 'var(--success)', fontSize: '1.1rem', lineHeight: '1' }}>☑</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1' }}>☐</span>
                            )}
                          </button>
                          <span style={{ 
                            fontSize: '0.82rem', 
                            textDecoration: sub.completed ? 'line-through' : 'none',
                            color: sub.completed ? 'var(--text-muted)' : 'var(--text-secondary)'
                          }}>
                            {sub.text}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteSubtask(sub.id)}
                          style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Subtask box */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text"
                      className="form-textarea"
                      placeholder="Add sub-task step..."
                      style={{ flex: 1, minHeight: '34px', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      value={newSubtaskText}
                      onChange={(e) => setNewSubtaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                    />
                    <button 
                      onClick={handleAddSubtask}
                      className="btn btn-secondary"
                      style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Journal diary notes */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Execution Notes & Artifact URLs
                  </label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Draft your pitch, paste survey results, document user feedback links, or write meeting action items here..."
                    style={{ minHeight: '130px', fontSize: '0.85rem', padding: '0.75rem', lineHeight: 1.45 }}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={handleSaveTaskDetails}
                    className="btn btn-primary"
                    disabled={isSavingTask}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Save size={14} /> {isSavingTask ? "Saving Details..." : "Save Execution Changes"}
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="btn btn-secondary"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.5rem 0.85rem' }}
                    title="Delete objective"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Create Custom Objective Modal */}
          {isAddModalOpen && (
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
              background: 'rgba(0,0,0,0.6)', zIndex: 120, display: 'flex',
              alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
              animation: 'fadeIn 0.2s ease'
            }} onClick={() => setIsAddModalOpen(false)}>
              <div 
                className="glass-card slide-up"
                style={{ width: '100%', maxWidth: '440px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Create Custom Objective</h3>
                  <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddCustomTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Objective Title</label>
                    <input 
                      type="text"
                      className="form-textarea"
                      placeholder="e.g. Publish pricing questionnaire on Slack"
                      style={{ minHeight: '38px', padding: '0 0.75rem', fontSize: '0.85rem' }}
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Timeline Position</label>
                      <select 
                        className="form-textarea"
                        style={{ minHeight: '38px', padding: '0 0.5rem', fontSize: '0.85rem' }}
                        value={newTaskWeek}
                        onChange={(e) => setNewTaskWeek(Number(e.target.value))}
                      >
                        <option value={1}>Week 1</option>
                        <option value={2}>Week 2</option>
                        <option value={3}>Week 3</option>
                        <option value={4}>Week 4</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
                      <select 
                        className="form-textarea"
                        style={{ minHeight: '38px', padding: '0 0.5rem', fontSize: '0.85rem' }}
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value)}
                      >
                        <option value="Validation">Validation</option>
                        <option value="Research">Research</option>
                        <option value="MVP">MVP</option>
                        <option value="Growth">Growth</option>
                        <option value="Finance">Finance</option>
                        <option value="Legal">Legal</option>
                        <option value="Pitching">Pitching</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Instructions / Context</label>
                    <textarea 
                      className="form-textarea"
                      placeholder="Outline any key deliverables or notes for validation checkmarks..."
                      style={{ minHeight: '80px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.55rem' }}>
                      Add Objective
                    </button>
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary" style={{ flex: 1, padding: '0.55rem' }}>
                      Cancel
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {/* Confirm Reset Dialog */}
          {isResetConfirmOpen && (
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
              background: 'rgba(0,0,0,0.6)', zIndex: 120, display: 'flex',
              alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)',
              animation: 'fadeIn 0.2s ease'
            }} onClick={() => setIsResetConfirmOpen(false)}>
              <div 
                className="glass-card slide-up"
                style={{ width: '100%', maxWidth: '380px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ color: 'var(--danger)', display: 'flex', justifyContent: 'center' }}>
                  <AlertCircle size={40} />
                </div>
                
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Reset {selectedStage} Playbook?</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.45 }}>
                    This will delete all custom modifications, checklist notes, sub-tasks, and restore the initial curriculum defaults. This action cannot be undone.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={handleResetPlaybook} 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '0.55rem', background: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Reset Now
                  </button>
                  
                  <button 
                    onClick={() => setIsResetConfirmOpen(false)} 
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.55rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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
                      <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{currentSlide.title}</h3>
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
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Pitching Rule of Thumbs:</h4>
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
    </div>
  );
}
