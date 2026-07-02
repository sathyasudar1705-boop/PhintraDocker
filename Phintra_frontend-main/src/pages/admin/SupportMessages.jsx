import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';
import { Mail, Send, User, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

const SupportMessages = () => {
  const { adminThreads, sendAdminReply, fetchData } = useAppContext();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of message list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find selected employee details
  const selectedThread = adminThreads.find(t => t.employee_id === selectedEmployeeId);

  // Fetch thread messages for selected employee
  const fetchThreadMessages = async (empId) => {
    if (!empId) return;
    try {
      const response = await api.get(`/messages/admin/thread/${empId}`);
      setMessages(response.data);
    } catch (err) {
      console.error("Failed to fetch support thread messages:", err);
    }
  };

  // Auto-select first thread if available and none selected
  useEffect(() => {
    if (adminThreads.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(adminThreads[0].employee_id);
    }
  }, [adminThreads]);

  // Load thread messages on selection change
  useEffect(() => {
    if (selectedEmployeeId) {
      setLoadingThread(true);
      fetchThreadMessages(selectedEmployeeId).finally(() => {
        setLoadingThread(false);
        setTimeout(scrollToBottom, 100);
      });
    }
  }, [selectedEmployeeId]);

  // Poll current thread messages every 4 seconds for live chat feeling
  useEffect(() => {
    if (!selectedEmployeeId) return;
    const interval = setInterval(() => {
      fetchThreadMessages(selectedEmployeeId);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedEmployeeId]);

  // Watch for messages changing to scroll down
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmployeeId) return;

    setSendingReply(true);
    try {
      await sendAdminReply(selectedEmployeeId, replyText);
      setReplyText('');
      // Immediately reload local thread messages
      await fetchThreadMessages(selectedEmployeeId);
      // Update global threads state (e.g. latest message snippet)
      await fetchData();
    } catch (err) {
      alert("Failed to send reply to employee.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Support & Communications</h1>
          <p>Manage and reply to live queries and social engineering alert reports submitted by employees.</p>
        </div>
      </div>

      {/* Messaging Layout Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '24px',
        height: '600px',
        alignItems: 'stretch'
      }} className="responsive-support-grid">
        
        {/* Left Side: Threads List */}
        <div className="saas-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Active Threads
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {adminThreads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-light)' }}>
                <Mail size={32} style={{ marginBottom: '8px', color: 'var(--text-subtle)' }} />
                <p style={{ fontSize: '13px' }}>No support threads active.</p>
              </div>
            ) : (
              adminThreads.map((thread) => {
                const isSelected = thread.employee_id === selectedEmployeeId;
                return (
                  <div
                    key={thread.employee_id}
                    onClick={() => setSelectedEmployeeId(thread.employee_id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-main)',
                      border: '1px solid ' + (isSelected ? 'var(--color-primary)' : 'var(--border-color)'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{thread.employee_name}</strong>
                      {thread.unread_count > 0 && (
                        <span className="badge badge-danger" style={{ padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '6px' }}>
                      Dept: {thread.department_name}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {thread.last_message || 'No messages yet'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversations Feed */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0px', overflow: 'hidden' }}>
          {selectedEmployeeId && selectedThread ? (
            <>
              {/* Active thread header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-main)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                    {selectedThread.employee_name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                    Email: {selectedThread.employee_email} | Department: {selectedThread.department_name}
                  </span>
                </div>
              </div>

              {/* Chat Messages scroll area */}
              <div style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: '#f8fafc'
              }}>
                {loadingThread ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-light)' }}>
                    <span>Loading message history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-light)' }}>
                    <span>Send a message to start the support thread.</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isEmployee = msg.sender_role.toLowerCase() === 'employee';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignSelf: isEmployee ? 'flex-start' : 'flex-end',
                          maxWidth: '70%',
                          backgroundColor: isEmployee ? 'var(--color-primary-light)' : 'var(--bg-card)',
                          border: '1px solid ' + (isEmployee ? '#bfdbfe' : 'var(--border-color)'),
                          borderRadius: '12px',
                          padding: '12px 16px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: isEmployee ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                            {isEmployee ? msg.sender_name : 'You (Security Team)'}
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
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <form onSubmit={handleReplySubmit} style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Type your reply to this employee..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, margin: 0 }}
                  disabled={sendingReply}
                />
                <Button
                  variant="primary"
                  type="submit"
                  icon={Send}
                  loading={sendingReply}
                  disabled={!replyText.trim() || sendingReply}
                >
                  Reply
                </Button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-light)', padding: '24px' }}>
              <Mail size={48} style={{ color: 'var(--border-hover)', marginBottom: '16px' }} />
              <h3>Select a Thread</h3>
              <p style={{ fontSize: '14px', marginTop: '4px' }}>Select an active employee thread from the left menu to view communication history.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .responsive-support-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SupportMessages;
