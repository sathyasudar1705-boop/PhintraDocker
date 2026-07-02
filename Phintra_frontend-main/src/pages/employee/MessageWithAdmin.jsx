import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { MessageSquare, Send, Paperclip, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessageBubble from '../../components/user/ChatMessageBubble';
import Button from '../../components/common/Button';

const MessageWithAdmin = () => {
  const { supportMessages = [], sendSupportMessage } = useAppContext();
  const toast = useToast();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [supportMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      await sendSupportMessage(inputText.trim());
      setInputText('');
      toast.success("Message sent successfully!");
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttachment = () => {
    toast.success("File attachment option triggered. Select file to upload.");
  };

  return (
    <div style={{ padding: '0 8px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Header */}
      <div className="saas-header" style={{ marginBottom: '24px' }}>
        <div className="saas-title-group">
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>Message with Admin</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Discuss security concerns, report anomalies, or query training requirements directly with IT Admins.</p>
        </div>
      </div>

      {/* Main Chat Panel Container */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 240px)',
        minHeight: '480px'
      }}>
        {/* Status Indicator Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Support Available</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
            Secure End-to-End Encryption
          </span>
        </div>

        {/* Message Thread Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {supportMessages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#94a3b8',
              textAlign: 'center',
              padding: '24px'
            }}>
              <MessageSquare size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#475569' }}>No messages yet</h4>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '280px', marginTop: '4px', lineHeight: '1.5' }}>
                Initiate a discussion with IT security officers by typing a message below.
              </p>
            </div>
          ) : (
            supportMessages.map((msg) => {
              const isAdmin = msg.sender_role.toLowerCase() === 'admin';
              return (
                <ChatMessageBubble key={msg.id} message={msg} isAdmin={isAdmin} />
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleAttachment}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
          >
            <Paperclip size={18} />
          </button>
          
          <input
            type="text"
            placeholder="Type a secure message to security officers..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '0 16px',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading || !inputText.trim()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: 'none',
              background: inputText.trim() ? '#2563eb' : '#cbd5e1',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              boxShadow: inputText.trim() ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
              transition: 'background 0.2s',
              flexShrink: 0
            }}
          >
            <Send size={16} style={{ marginLeft: '2px' }} />
          </motion.button>
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .6; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default MessageWithAdmin;
