import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const SUGGESTED_PROMPTS = [
  {
    topic: 'Policy Review',
    text: 'How can I draft a clear phishing reporting policy for new hires?'
  },
  {
    topic: 'Campaign Strategy',
    text: 'What is the recommended frequency for simulated phishing tests?'
  },
  {
    topic: 'Compliance Guidance',
    text: 'How does cybersecurity awareness training satisfy ISO 27001 requirements?'
  },
  {
    topic: 'Lure Design',
    text: 'What are the main ethical constraints to consider when drafting simulated lures?'
  }
];

const BOT_RESPONSES = {
  policy: `To draft a highly effective **Phishing Reporting Policy**, consider including the following elements:
  
  1. **Clear Reporting Chain:** Instruct employees to use the Phintra "Report Suspicious Email" button in their client, or forward to \`security-alert@company.com\`.
  2. **No-Blame Culture:** Explicitly state that employees will *never* be punished for reporting a click, even if it was a real mistake. This builds trust.
  3. **Immediate Actions:** List key steps to take if credentials were entered (e.g., reset passwords, notify IT Helpdesk immediately).
  4. **Feedback Loop:** Commit to notifying employees if their reported email was indeed malicious, confirming their contribution.`,
  
  frequency: `The industry gold standard for **phishing simulation frequency** is:
  
  * **Monthly Campaigns:** A consistent monthly cadence helps keep vigilance top-of-mind without causing campaign fatigue.
  * **Staggered Launch Window:** Stagger delivery times so employees don't warn one another, which would skew analytics.
  * **Targeted Remediation:** Users who click multiple simulated links within 90 days should receive auto-assigned micro-learning modules (5-10 mins) rather than heavier tests.`,
  
  compliance: `Cybersecurity awareness training maps directly to **ISO 27001 control A.7.2.2 (Information security awareness, education and training)**:
  
  * **Objective:** Ensure employees are aware of security responsibilities and receive education on threat types.
  * **Audit Evidence:** Auditors will look for evidence of training attendance logs, compliance percentage metrics, and ongoing evaluation tests.
  * **Phintra Advantage:** Our platform logs completion rates automatically. You can download compliance reports directly from the Analytics dashboard.`,
  
  lure: `When creating **simulated phishing lures**, ethical considerations are paramount:
  
  1. **Avoid Extreme Distress:** Do not simulate notifications about payroll terminations, legal actions, or personal emergencies.
  2. **Clear Labeling:** Keep a metadata record of sent emails to prevent IT support from registering them as genuine active intrusions.
  3. **Purely Educational redirect:** Ensure that any click immediately lands on a friendly, clear explanation card detailing the indicators, rather than capturing real login details.`
};

const AISecurityCoach = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your AI Security Coach. Ask me anything about drafting training campaigns, creating security policies, or meeting compliance standards.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // AI response simulation
    setTimeout(() => {
      let botText = "I appreciate that question. To help you with security training, let's explore best practices. Phintra recommends structuring your awareness program into bite-sized monthly modules. Do you have a specific target department in mind?";
      const lower = textToSend.toLowerCase();
      
      if (lower.includes('policy') || lower.includes('report')) {
        botText = BOT_RESPONSES.policy;
      } else if (lower.includes('frequency') || lower.includes('often') || lower.includes('how many')) {
        botText = BOT_RESPONSES.frequency;
      } else if (lower.includes('iso') || lower.includes('compliance') || lower.includes('regulation')) {
        botText = BOT_RESPONSES.compliance;
      } else if (lower.includes('ethical') || lower.includes('lure') || lower.includes('rule')) {
        botText = BOT_RESPONSES.lure;
      }

      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' }}>
      <div className="saas-header" style={{ marginBottom: '16px', flexShrink: 0 }}>
        <div className="saas-title-group">
          <h1>AI Security Coach</h1>
          <p>Interact with your security advisory assistant to build better training campaigns and compliance strategies.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        flex: 1,
        minHeight: 0
      }} className="responsive-chart-grid">
        {/* Chat Console Panel */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
          
          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--bg-main)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '16px'
          }}>
            {messages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : '#8b5cf6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Message Box */}
                <div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-subtle)',
                    marginTop: '4px',
                    display: 'block',
                    textAlign: msg.sender === 'user' ? 'right' : 'left'
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot size={16} />
                </div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span className="skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
                  <span className="skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
                  <span className="skeleton" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Action */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
            style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
          >
            <input 
              type="text" 
              className="form-control"
              placeholder="Ask for advice (e.g. 'ISO 27001 training standard' or 'Phishing policies')..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
            />
            <Button type="submit" variant="primary" icon={Send} disabled={isTyping || !inputValue.trim()}>
              Send
            </Button>
          </form>
        </div>

        {/* Info & Prompts Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Info Box */}
          <div className="saas-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6', padding: '10px', borderRadius: '10px', flexShrink: 0 }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>Coach Insights Console</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.5' }}>
                This is a dedicated educational helper chatbot designed to provide context on security best practices, mock simulation structures, and compliance frameworks.
              </p>
            </div>
          </div>

          {/* Suggested prompts list */}
          <div className="saas-card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '16px' }}>Suggested Coaching Inquiries</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  className="search-input-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <MessageSquare size={14} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {p.topic}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISecurityCoach;
