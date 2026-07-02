import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Bot } from 'lucide-react';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import Button from './Button';

const FloatingAIChatbot = () => {
  const confirm = useConfirm();
  const { userRole } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Set messages from localStorage
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('phintra_ai_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [{
      id: 'welcome',
      sender: 'bot',
      text: 'Hello. I am your Phintra AI Assistant. How can I help you analyze security awareness metrics today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });

  // Keep chat history saved to localStorage
  useEffect(() => {
    localStorage.setItem('phintra_ai_chat', JSON.stringify(messages));
  }, [messages]);

  const messagesEndRef = useRef(null);

  // Auto scroll to latest messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Security Role check: ONLY show for Admin role
  const isAdminRole = userRole === 'Security Administrator' || userRole === 'Admin' || window.location.pathname.startsWith('/admin');
  if (!isAdminRole) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowNotification(false);
    }
  };

  const predefinedQuestions = [
    "How many employees do we have?",
    "Which department has the highest risk?",
    "Which employees have not completed training?",
    "What is the awareness score?",
    "Show reported emails summary.",
    "How many campaigns were sent?"
  ];

  // Chat message submit handler
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Append User Message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Dispatch query to backend AI Assistant endpoint (admin-scoped only)
      const res = await api.post('/admin/ai-assistant', { question: text });
      setIsTyping(false);
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setIsTyping(false);
      console.error("AI Assistant API failed:", err);
      const errMsg = err.response?.data?.detail || "Failed to get response from Phintra AI service. Verify GEMINI_API_KEY is configured.";
      const botMsg = {
        id: `bot-error-${Date.now()}`,
        sender: 'bot',
        text: `Error: ${errMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleSendMessage(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (question) => {
    if (isTyping) return;
    handleSendMessage(question);
  };

  // Clear Chat History
  const handleClearChat = async () => {
    const confirmed = await confirm({
      title: 'Clear Chat History?',
      description: 'This will remove all messages from the current session. This action cannot be undone.',
      confirmText: 'Clear History',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!confirmed) return;
    const welcomeMsg = [{
      id: 'welcome',
      sender: 'bot',
      text: 'Hello. I am your Phintra AI Assistant. How can I help you analyze security awareness metrics today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    setMessages(welcomeMsg);
  };

  return (
    <div className="floating-ai-chatbot-root">
      {/* CSS Styling Injection */}
      <style>{`
        .floating-ai-chatbot-root {
          font-family: var(--font-family, 'Inter', sans-serif);
        }
        
        /* Floating Action Button (FAB) */
        .ai-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, var(--color-teal, #14b8a6) 100%);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          border: none;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          overflow: hidden;
          padding: 0;
        }

        .ai-chat-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
        }

        /* Tooltip style */
        .ai-chat-fab-tooltip {
          position: absolute;
          right: 70px;
          background-color: var(--text-main, #1e293b);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          opacity: 0;
          pointer-events: none;
          transform: translateX(10px);
          transition: all 0.2s ease;
        }

        .ai-chat-fab:hover .ai-chat-fab-tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        /* Notification Dot */
        .ai-chat-notif-dot {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background-color: var(--color-danger, #ef4444);
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          animation: pulse 2s infinite;
        }

        /* Chat Panel Container */
        .ai-chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 380px;
          height: 540px;
          background-color: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-lg, 14px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Header styling */
        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          background-color: #ffffff;
        }

        .ai-chat-header-info {
          display: flex;
          flex-direction: column;
        }

        .ai-chat-header-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main, #1e293b);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ai-chat-header-subtitle {
          font-size: 11px;
          color: var(--text-light, #64748b);
          font-weight: 500;
          margin-top: 1px;
        }

        .ai-chat-close-btn {
          border: none;
          background: transparent;
          color: var(--text-subtle, #94a3b8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .ai-chat-close-btn:hover {
          color: var(--text-main, #1e293b);
          background-color: var(--bg-sidebar, #f8fafc);
        }

        /* Messages area */
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: var(--bg-main, #f8fafc);
        }

        .ai-chat-msg-row {
          display: flex;
          width: 100%;
        }

        .ai-chat-msg-row.user {
          justify-content: flex-end;
        }

        .ai-chat-msg-row.bot {
          justify-content: flex-start;
        }

        .ai-chat-bubble {
          max-width: 80%;
          padding: 10px 14px;
          font-size: 13px;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .ai-chat-msg-row.user .ai-chat-bubble {
          background-color: var(--color-primary-light, #eff6ff);
          color: var(--color-primary-hover, #1d4ed8);
          border-radius: 14px 14px 0 14px;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .ai-chat-msg-row.bot .ai-chat-bubble {
          background-color: #ffffff;
          color: var(--text-main, #1e293b);
          border-radius: 14px 14px 14px 0;
          border: 1px solid var(--border-color, #e2e8f0);
        }

        .ai-chat-msg-time {
          font-size: 10px;
          color: var(--text-subtle, #94a3b8);
          margin-top: 4px;
          display: block;
          text-align: right;
        }

        .ai-chat-msg-row.bot .ai-chat-msg-time {
          text-align: left;
        }

        /* Input section */
        .ai-chat-input-form {
          display: flex;
          gap: 8px;
          padding: 16px 20px 12px 20px;
          background-color: #ffffff;
          border-top: 1px solid var(--border-color, #e2e8f0);
          align-items: center;
        }

        .ai-chat-input-field {
          flex: 1;
          height: 36px;
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-sm, 6px);
          padding: 8px 14px;
          font-size: 13px;
          outline: none;
          color: var(--text-main, #1e293b);
          transition: all 0.15s ease;
        }

        .ai-chat-input-field:focus {
          border-color: var(--color-primary, #3b82f6);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        /* Suggestions chips */
        .ai-chat-suggestions {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 6px;
          padding: 0 20px 20px 20px;
          background-color: #ffffff;
          scrollbar-width: none;
        }
        .ai-chat-suggestions::-webkit-scrollbar {
          display: none;
        }
        
        .ai-chat-chip {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted, #475569);
          background-color: var(--bg-sidebar, #f8fafc);
          border: 1px solid #e2e8f0;
          padding: 5px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
          outline: none;
        }

        .ai-chat-chip:hover {
          color: var(--color-primary, #3b82f6);
          background-color: var(--color-primary-light, #eff6ff);
          border-color: rgba(59, 130, 246, 0.2);
        }

        /* Typing indicator */
        .ai-chat-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
        }

        .ai-chat-typing span {
          width: 6px;
          height: 6px;
          background-color: var(--text-subtle, #94a3b8);
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .ai-chat-typing span:nth-child(1) { animation-delay: -0.32s; }
        .ai-chat-typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Expandable Chat Panel */}
      {isOpen && (
        <div className="ai-chat-panel glass-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-title">
                <Bot size={20} style={{ color: 'var(--color-primary, #3b82f6)' }} />
                Phintra AI Assistant
              </div>
              <div className="ai-chat-header-subtitle">Admin Scoped Security Insights</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button"
                onClick={handleClearChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-light, #64748b)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                }}
              >
                Clear
              </button>
              <button className="ai-chat-close-btn" onClick={handleToggle} aria-label="Close Chat">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="ai-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-chat-msg-row ${msg.sender}`}>
                <div className="ai-chat-bubble">
                  {msg.text}
                  <span className="ai-chat-msg-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}
            
            {/* Animated Typing Indicator */}
            {isTyping && (
              <div className="ai-chat-msg-row bot">
                <div className="ai-chat-bubble" style={{ padding: '8px 12px' }}>
                  <div className="ai-chat-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips (placed ABOVE input) */}
          <div className="ai-chat-suggestions">
            {predefinedQuestions.map((q, idx) => (
              <button 
                key={idx}
                type="button"
                className="ai-chat-chip"
                onClick={() => handleSuggestionClick(q)}
                disabled={isTyping}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Section */}
          <form className="ai-chat-input-form" onSubmit={handleInputSubmit}>
            <input
              type="text"
              className="ai-chat-input-field"
              placeholder="Ask about employees, training, risk, campaigns..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              disabled={!inputValue.trim() || isTyping}
              style={{
                height: '36px',
                width: '36px',
                padding: 0,
                minWidth: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button className="ai-chat-fab animate-pulse-soft" onClick={handleToggle} aria-label="Open AI Assistant">
          <Bot size={28} />
          {showNotification && <div className="ai-chat-notif-dot" />}
          <span className="ai-chat-fab-tooltip">AI Assistant</span>
        </button>
      )}
    </div>
  );
};

export default FloatingAIChatbot;
