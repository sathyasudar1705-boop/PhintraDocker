import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { faqs } from '../../data/dummyData';
import { Search, ChevronDown, ChevronUp, Mail, ShieldCheck, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const HelpCenter = () => {
  const { supportMessages = [], sendSupportMessage } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqIdx, setExpandedFaqIdx] = useState(null);
  
  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleFaq = (idx) => {
    if (expandedFaqIdx === idx) {
      setExpandedFaqIdx(null);
    } else {
      setExpandedFaqIdx(idx);
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    return faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!contactSubject.trim() || !contactMessage.trim()) {
      setError('Please complete all mandatory fields.');
      return;
    }

    setLoading(true);

    try {
      const fullText = `[Subject: ${contactSubject}] ${contactMessage}`;
      await sendSupportMessage(fullText);
      setSuccess('Message sent to Corporate Security! A response will be dispatched shortly.');
      setContactSubject('');
      setContactMessage('');
      
      setTimeout(() => {
        setShowContactModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send support message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Help & Support Center</h1>
          <p>Read through common queries on security awareness training or contact the corporate security operations team.</p>
        </div>
        <Button 
          variant="primary"
          icon={Mail}
          onClick={() => setShowContactModal(true)}
        >
          Contact Security Team
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search questions or answers in FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* Accordions list */}
      {filteredFaqs.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <HelpCircle size={48} style={{ color: 'var(--border-hover)', marginBottom: '16px' }} />
          <h3>No FAQs match your search</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try typing a different keyword or contact the security team directly.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaqIdx === idx;
            return (
              <div 
                key={idx} 
                className="accordion-item"
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden'
                }}
              >
                <div 
                  onClick={() => toggleFaq(idx)}
                  className="accordion-trigger"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <span>{faq.question}</span>
                  {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-light)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-light)' }} />}
                </div>

                {isExpanded && (
                  <div 
                    className="accordion-content"
                    style={{
                      padding: '16px 20px',
                      borderTop: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      lineHeight: '1.6',
                      animation: 'fadeIn 0.15s ease-out'
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Contact security Team Modal */}
      {showContactModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Contact Security Team</h2>
              <button onClick={() => setShowContactModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleContactSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-danger-light)',
                    border: '1px solid var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Subject of Inquiry</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Question on 2FA policy"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Message</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Type your message to corporate IT security officers..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {/* Simulated file upload */}
                <div className="form-group">
                  <label className="form-label">Attach email file or screenshot (Optional)</label>
                  <input 
                    type="file" 
                    className="form-control"
                    disabled={loading}
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowContactModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Send Message</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Chat Thread with Security Team */}
      <div className="saas-card" style={{ marginTop: '32px', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={18} style={{ color: 'var(--color-primary)' }} />
          Security Team Secure Chat Thread
        </h3>

        <div style={{
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-main)',
          padding: '16px',
          maxHeight: '320px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {supportMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '24px 0' }}>
              <p style={{ fontSize: '13px' }}>No messages found. Send a message using the form above to start a secure discussion.</p>
            </div>
          ) : (
            supportMessages.map((msg) => {
              const isAdmin = msg.sender_role.toLowerCase() === 'admin';
              return (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                    maxWidth: '70%',
                    backgroundColor: isAdmin ? 'var(--bg-card)' : 'var(--color-primary-light)',
                    border: '1px solid ' + (isAdmin ? 'var(--border-color)' : '#bfdbfe'),
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: isAdmin ? 'var(--color-primary)' : 'var(--text-main)' }}>
                      {msg.sender_name || (isAdmin ? 'Security Officer' : 'You')}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-main)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {msg.message_text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Send Input at the bottom of the chat */}
        <form onSubmit={async (e) => {
          e.preventDefault();
          const txt = e.target.elements.chatMsg.value;
          if (!txt.trim()) return;
          try {
            await sendSupportMessage(txt);
            e.target.elements.chatMsg.value = '';
          } catch (err) {
            alert('Failed to send message');
          }
        }} style={{ display: 'flex', gap: '8px' }}>
          <input 
            name="chatMsg"
            type="text" 
            placeholder="Type a secure message to security officers..." 
            className="form-control"
            style={{ flex: 1, margin: 0 }}
          />
          <Button variant="primary" type="submit">Send</Button>
        </form>
      </div>

    </div>
  );
};

export default HelpCenter;
