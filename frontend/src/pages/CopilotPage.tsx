import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Database, Globe, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import { showToast } from '../components/ui/Toast';

interface Source {
  title: string;
  link?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  error?: boolean;
}

interface PitchQuestion {
  text: string;
  tips: string;
}

interface PitchEvaluation {
  success: boolean;
  score: number;
  critique: string;
  tips: string;
}

export default function CopilotPage() {
  const { profile } = useAuth();
  
  const initialGreeting: ChatMessage = {
    role: 'assistant',
    content: `Hello ${profile.name}! I am your AI Founder Copilot. Ask me anything about funding schemes, development advisors, or legal documents. I draw answers from our verified internal databases (grants, investors, templates) or my general knowledge.`,
    sources: []
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sub-tabs State
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'simulator'>('chat');

  // VC Pitch Simulator State
  const [pitchQuestions, setPitchQuestions] = useState<PitchQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<PitchEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<number[]>([]);
  const [simulatorActive, setSimulatorActive] = useState(false);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const response = await apiFetch('/api/copilot/chat');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setMessages([initialGreeting, ...data]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadChatHistory();
  }, []);

  const startPitchSimulator = async () => {
    setEvalLoading(true);
    setSimulatorActive(true);
    setEvaluation(null);
    setAnswer('');
    try {
      const response = await apiFetch('/api/copilot/pitch-simulator/questions', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setPitchQuestions(data.questions || []);
        setCurrentQIndex(0);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading pitch questions.', 'error');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setEvalLoading(true);
    const activeQuestion = pitchQuestions[currentQIndex]?.text || '';
    try {
      const response = await apiFetch('/api/copilot/pitch-simulator/evaluate', {
        method: 'POST',
        body: JSON.stringify({ question: activeQuestion, answer })
      });
      const data = await response.json();
      if (data.success) {
        setEvaluation(data);
        setScoreHistory(prev => [...prev, data.score]);
        showToast('Pitch response evaluated by AI!', 'success');
      } else {
        showToast(data.error || 'Failed to evaluate answer.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error evaluating pitch answer.', 'error');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleNextPitchQuestion = () => {
    setEvaluation(null);
    setAnswer('');
    setCurrentQIndex(prev => prev + 1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: text } as ChatMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/copilot/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, chatHistory: updatedMessages })
      });
      const data = await response.json();
      if (data.success) {
        setMessages([...updatedMessages, data.message]);
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: data.error || 'Something went wrong.', error: true }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Connection issue. Please verify backend is active.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const suggestions = [
    { text: 'Am I eligible for Startup India Seed Fund?', grounded: true },
    { text: 'Do you have pitch deck templates?', grounded: true },
    { text: 'Explain Y Combinator deadline & equity structure.', grounded: true },
    { text: 'How do I get my first 100 users?', grounded: false }
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0px' }}>
        <div className="page-title-section">
          <h2 className="gradient-text">AI Founder Copilot</h2>
          <p>Verified database lookup engine merged with generative strategic assistance.</p>
        </div>
      </div>

      {/* Sub tabs headers */}
      <div className="tabs-header" style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setActiveSubTab('chat')} 
          className={`tab-btn ${activeSubTab === 'chat' ? 'active' : ''}`}
        >
          General AI Copilot Chat
        </button>
        <button 
          onClick={() => { setActiveSubTab('simulator'); if (!simulatorActive) startPitchSimulator(); }} 
          className={`tab-btn ${activeSubTab === 'simulator' ? 'active' : ''}`}
        >
          VC Pitch Practice Room
        </button>
      </div>

      {activeSubTab === 'chat' ? (
        /* Main Chat Container */
        <div className="chat-container slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Messages list */}
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat-bubble ${msg.role}`}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  {msg.role === 'assistant' && (
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '0.65rem', flexShrink: 0, marginTop: '2px'
                    }}>
                      <Bot size={12} />
                    </div>
                  )}
                  
                  <div style={{ flex: 1, wordBreak: 'break-word' }}>
                    <p style={{ color: msg.role === 'user' ? '#fff' : 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </p>
                    
                    {/* Sources Visualizer */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="sources-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--secondary)', fontWeight: 600 }}>
                          <Database size={10} /> Verified Database Sourced:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                          {msg.sources.map((src, sIdx) => (
                            <a 
                              key={sIdx}
                              href={src.link || '#'}
                              target={src.link ? '_blank' : '_self'}
                              rel="noreferrer"
                              className="source-item"
                              style={{
                                background: 'rgba(6, 182, 212, 0.08)',
                                border: '1px solid rgba(6, 182, 212, 0.2)',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'none'
                              }}
                            >
                              {src.title} <Globe size={8} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.role === 'assistant' && msg.sources && msg.sources.length === 0 && idx > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        <Globe size={10} /> Model General AI Knowledge (Unverified against local db)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble assistant">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.65rem'
                  }}>
                    <Bot size={12} />
                  </div>
                  <div className="pulse-loader">
                    <div className="pulse-bubble" />
                    <div className="pulse-bubble" />
                    <div className="pulse-bubble" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
            padding: '0.5rem 1.5rem', background: 'rgba(0,0,0,0.2)',
            borderTop: '1px solid var(--border-light)'
          }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s.text)}
                className="btn btn-secondary"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: s.grounded ? 'rgba(6, 182, 212, 0.04)' : 'rgba(255,255,255,0.02)',
                  borderColor: s.grounded ? 'rgba(6, 182, 212, 0.15)' : 'var(--border-light)'
                }}
              >
                {s.grounded ? <Database size={10} style={{ color: 'var(--secondary)' }} /> : <HelpCircle size={10} style={{ color: 'var(--text-muted)' }} />}
                <span>{s.text}</span>
              </button>
            ))}
          </div>

          {/* Text Input Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="chat-input-bar"
          >
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask AI Copilot (e.g. Do I qualify for the MeitY grant?)..."
              style={{ flex: 1, padding: '0.75rem 1rem' }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.75rem 1.25rem' }}
              disabled={loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        /* VC Pitch Practice Room View (Unique Feature) */
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', flex: 1, minHeight: 0 }}>
          
          {/* Main Question Answer Editor */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
            <div className="flex-between">
              <h3>🎤 Pitch Simulation Terminal</h3>
              <span className="badge badge-primary">Venture Stage: {profile.stage}</span>
            </div>

            {evalLoading ? (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '1rem' }}>
                <div className="pulse-loader">
                  <div className="pulse-bubble" /><div className="pulse-bubble" /><div className="pulse-bubble" />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI is evaluating your response...</span>
              </div>
            ) : pitchQuestions.length > 0 && currentQIndex < pitchQuestions.length ? (
              (() => {
                const activeQ = pitchQuestions[currentQIndex];
                return (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span>SECTOR QUESTION:</span>
                      <span>{currentQIndex + 1} of {pitchQuestions.length}</span>
                    </div>

                    <div style={{ 
                      padding: '1.25rem', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: 'var(--radius-md)',
                      fontSize: '1.05rem', 
                      fontWeight: 700, 
                      color: '#fff',
                      lineHeight: 1.4
                    }}>
                      "{activeQ.text}"
                    </div>

                    <div style={{
                      background: 'rgba(6, 182, 212, 0.04)',
                      border: '1px solid rgba(6, 182, 212, 0.15)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)'
                    }}>
                      💡 <strong>Prep Tip:</strong> {activeQ.tips}
                    </div>

                    {!evaluation ? (
                      <form onSubmit={handleEvaluateAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label className="form-label">Type your response to the VC:</label>
                          <textarea
                            className="form-textarea"
                            style={{ flex: 1, minHeight: '120px', padding: '0.75rem', fontSize: '0.88rem', lineHeight: 1.45 }}
                            placeholder="Draft your pitch answer here. Try to mention direct data, market sizes, customer acquisition metrics, or validation details..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.6rem' }}>
                          Submit Response for AI Review
                        </button>
                      </form>
                    ) : (
                      <div className="fade-in animate-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        
                        {/* Score Indicator */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: evaluation.score >= 8 ? 'rgba(16, 185, 129, 0.1)' : evaluation.score >= 6 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `2px solid ${evaluation.score >= 8 ? '#10B981' : evaluation.score >= 6 ? '#F59E0B' : '#EF4444'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.25rem', fontWeight: 800, color: '#fff'
                          }}>{evaluation.score}/10</div>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI EVALUATION RATING:</span>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: evaluation.score >= 8 ? 'var(--success)' : evaluation.score >= 6 ? 'var(--warning)' : 'var(--danger)' }}>
                              {evaluation.score >= 8 ? 'Outstanding Pitch Answer' : evaluation.score >= 6 ? 'Strong, Needs Polish' : 'Needs Optimization'}
                            </h4>
                          </div>
                        </div>

                        {/* Critique */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>INTERVIEWER FEEDBACK / CRITIQUE:</span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>{evaluation.critique}</p>
                        </div>

                        {/* Tips */}
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-light)',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4
                        }}>{evaluation.tips}</div>

                        <button 
                          onClick={handleNextPitchQuestion} 
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem' }}
                        >
                          {currentQIndex === pitchQuestions.length - 1 ? 'Finish Interview Simulation' : 'Proceed to Next Question'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                <Sparkles size={48} style={{ color: 'var(--secondary)' }} />
                <h4>Interview Simulation Completed!</h4>
                <p style={{ fontSize: '0.82rem' }}>You have completed all {pitchQuestions.length} practice questions configured for the {profile.stage} stage.</p>
                <button onClick={startPitchSimulator} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Restart Pitch Practice Room
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Score Tracker Progression */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>📈 Practice Score History</h3>
              
              {scoreHistory.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Your pitch evaluations will plot here to track metrics over time.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                    {scoreHistory.map((scr, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          flex: 1, 
                          height: `${scr * 10}%`, 
                          background: 'linear-gradient(to top, var(--primary) 0%, var(--secondary) 100%)',
                          borderRadius: '2px 2px 0 0',
                          position: 'relative'
                        }}
                        title={`Question ${idx + 1}: ${scr}/10`}
                      >
                        <span style={{ position: 'absolute', top: '-18px', left: 0, right: 0, textAlign: 'center', fontSize: '0.62rem', color: '#fff', fontWeight: 'bold' }}>{scr}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-between" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>Start</span>
                    <span>Q{scoreHistory.length}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#fff' }}>VC Answering Checklist:</h4>
              <ul style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                <li>Don't dodge questions: answer directly.</li>
                <li>Avoid generic buzzwords. Frame responses with data metrics.</li>
                <li>Align solutions explicitly with customer segment interviews.</li>
                <li>Demonstrate unit economics understanding.</li>
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
