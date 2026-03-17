import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendChatMessage } from '../../api/chatAPI';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm your MattersUrSkills assistant  I can help you with info about your account, tasks, applications, and our platform. What would you like to know?",
};

const TypingIndicator = () => (
  <div className="flex justify-start items-end gap-2">
    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
      style={{ background: 'rgba(124,189,103,0.15)', border: '1px solid rgba(124,189,103,0.3)' }}>
      <BotIcon size={12} />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
      style={{ background: '#1c2318', border: '1px solid #232b1e' }}>
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"
        style={{ animation: 'bounce 1.2s infinite', animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"
        style={{ animation: 'bounce 1.2s infinite', animationDelay: '200ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"
        style={{ animation: 'bounce 1.2s infinite', animationDelay: '400ms' }} />
    </div>
  </div>
);

const BotIcon = ({ size = 16, color = '#7cbd67' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    strokeWidth="2" stroke={color}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="white">
    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(124,189,103,0.15)', border: '1px solid rgba(124,189,103,0.3)' }}>
          <BotIcon size={12} />
        </div>
      )}
      <div
        className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: '#7cbd67',
                color: '#fff',
                borderRadius: '18px 18px 4px 18px',
              }
            : {
                background: '#1c2318',
                color: '#bfcdb5',
                border: '1px solid #232b1e',
                borderRadius: '18px 18px 18px 4px',
              }
        }
      >
        {msg.content}
      </div>
    </div>
  );
};

const SUGGESTIONS_GUEST = [
  'What is MattersUrSkills?',
  'How do I register?',
  'What types of work are available?',
];
const SUGGESTIONS_AUTH = [
  'Show my tasks',
  'What is my current rating?',
  'How do I apply for a job?',
];

export default function Chatbot() {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([INITIAL_MESSAGE]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const messagesEndRef            = useRef(null);
  const inputRef                  = useRef(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('openChatbot', handleOpen);
    return () => window.removeEventListener('openChatbot', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSend = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    if (trimmed.length > 500) return;

    const userMsg    = { role: 'user', content: trimmed };
    const nextMsgs   = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(nextMsgs);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I ran into an issue. Please try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = isAuthenticated ? SUGGESTIONS_AUTH : SUGGESTIONS_GUEST;
  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position:        'fixed',
          inset:            0,
          zIndex:           40,
          background:       'rgba(0,0,0,0.55)',
          backdropFilter:   'blur(2px)',
          transition:       'opacity 0.3s',
          opacity:           isOpen ? 1 : 0,
          pointerEvents:     isOpen ? 'auto' : 'none',
        }}
      />

      <div
        style={{
          position:   'fixed',
          top:         0,
          right:       0,
          bottom:      0,
          zIndex:      50,
          width:       '100%',
          maxWidth:   '400px',
          display:    'flex',
          flexDirection: 'column',
          background: '#171b14',
          borderLeft: '1px solid #232b1e',
          boxShadow:  '-8px 0 32px rgba(0,0,0,0.5)',
          transform:   isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#111410',
          borderBottom: '1px solid #232b1e',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#7cbd67,#4e7d3e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <BotIcon size={18} color="white" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fff' }}>
                MattersUrSkills Assistant
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#6b7a60' }}>
                {isAuthenticated
                  ? `Logged in as ${user?.name?.split(' ')[0] || 'User'}`
                  : 'Ask me anything about our platform'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none',
              background: 'transparent', cursor: 'pointer',
              color: '#96a888', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1c2318'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#96a888'; }}
          >
            <CloseIcon />
          </button>
        </div>

        {!isAuthenticated && (
          <div style={{
            flexShrink: 0,
            padding: '8px 16px',
            background: 'rgba(124,189,103,0.06)',
            borderBottom: '1px solid #232b1e',
            fontSize: 12,
            color: '#96a888',
          }}>
            <span style={{ color: '#7cbd67', fontWeight: 600 }}>Tip:</span> Log in to ask about
            your account, tasks, and applications.
          </div>
        )}

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          scrollbarWidth: 'thin',
        }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && <TypingIndicator />}

          {showSuggestions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    background: 'transparent',
                    border: '1px solid #232b1e',
                    color: '#96a888',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1c2318';
                    e.currentTarget.style.color = '#7cbd67';
                    e.currentTarget.style.borderColor = '#4e7d3e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#96a888';
                    e.currentTarget.style.borderColor = '#232b1e';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div style={{
          flexShrink: 0,
          padding: '12px 16px 14px',
          background: '#111410',
          borderTop: '1px solid #232b1e',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything"
              rows={1}
              maxLength={500}
              disabled={loading}
              style={{
                flex: 1,
                background: '#1c2318',
                border: '1px solid #232b1e',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 14,
                color: '#fff',
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: 42,
                maxHeight: 120,
                outline: 'none',
                transition: 'border-color 0.15s',
                scrollbarWidth: 'thin',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(124,189,103,0.5)'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#232b1e'; }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              style={{
                flexShrink: 0,
                width: 42, height: 42,
                borderRadius: 12,
                border: 'none',
                background: input.trim() && !loading ? '#7cbd67' : '#2e3828',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (input.trim() && !loading) e.currentTarget.style.background = '#629d51'; }}
              onMouseLeave={(e) => { if (input.trim() && !loading) e.currentTarget.style.background = '#7cbd67'; }}
            >
              <SendIcon />
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#455239', textAlign: 'center' }}>
            Powered by AI  Only your own account data is shared
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}