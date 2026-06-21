import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Database, Globe, HelpCircle } from 'lucide-react';

export default function CopilotPage({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${profile.name}! I am your AI Founder Copilot. Ask me anything about funding schemes, development advisors, or legal documents. I draw answers from our verified internal databases (grants, investors, templates) or my general knowledge.`,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: text }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, chatHistory: updatedMessages })
      });
      const data = await response.json();
      if (data.success) {
        setMessages([...updatedMessages, data.message]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Connection issue. Please verify backend is active.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
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

      {/* Main Chat Container */}
      <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
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
                              gap: '3px'
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
    </div>
  );
}
