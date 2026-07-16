import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { AlertTriangle, Send, UploadCloud, CheckCircle2, ShieldAlert, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import ReportSuccessAnimation from '../../components/user/ReportSuccessAnimation';
import StatusBadge from '../../components/user/StatusBadge';
import ReportSuccessModal from '../../components/user/ReportSuccessModal';
import SmartTextarea from '../../components/common/SmartTextarea';
import SmartInput from '../../components/common/SmartInput';

const ReportSuspicious = () => {
  const { reportedEmails = [], reportEmail } = useAppContext();
  const toast = useToast();

  // Form States
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('Suspicious Link');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triggerExplosion, setTriggerExplosion] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0].name);
      toast.success(`Attached file: ${e.target.files[0].name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validations
    if (!sender.trim()) {
      setError("Please provide the sender's email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(sender)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setError('Please specify the email subject line.');
      return;
    }
    if (!message.trim()) {
      setError('Please describe why this email appears suspicious.');
      return;
    }

    setLoading(true);

    try {
      // Dispatch to context
      await reportEmail({
        sender: sender,
        senderEmail: sender,
        subject: subject,
        reason: reason,
        body: message
      });

      setLoading(false);
      setSuccess(true);
      setTriggerExplosion(true);
      toast.success("Threat reported! +100 XP awarded.");

      // Reset fields
      setSender('');
      setSubject('');
      setMessage('');
      setAttachedFile(null);

      // Hide success explosion after 4s
      setTimeout(() => {
        setTriggerExplosion(false);
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit threat report.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px 16px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 50%, #F8FAFC 100%)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px rgba(99, 102, 241, 0.02)',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      overflowX: 'hidden'
    }}>
      <ReportSuccessAnimation trigger={triggerExplosion} />
      <ReportSuccessModal isOpen={success} onClose={() => setSuccess(false)} />

      {/* Header */}
      <div className="saas-header" style={{ marginBottom: '24px' }}>
        <div className="saas-title-group">
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', fontFamily: "'Fredoka', sans-serif" }}>Threat Reporting Center</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>Instantly flag suspicious incoming emails to the IT security response team to isolate threats.</p>
        </div>
      </div>

      {/* Main Grid: Left Form + Right Recent History list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }} className="responsive-reporting-grid">
        
        {/* Flag Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.02)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Fredoka', sans-serif" }}>
            <AlertTriangle size={18} style={{ color: '#ef4444' }} />
            Flag Suspicious Email
          </h3>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#fdf2f2',
                  border: '1px solid #fca5a5',
                  color: '#ef4444',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '16px'
                }}
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                Sender Email Address
              </label>
              <SmartInput
                type="email"
                className="reporting-input"
                placeholder="e.g. security-alert@office365-verify.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                disabled={loading}
                required
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  width: '100%',
                  fontSize: '13px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                Email Subject Line
              </label>
              <SmartInput
                type="text"
                className="reporting-input"
                placeholder="e.g. Action Required: Account Suspension Warning"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                required
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  width: '100%',
                  fontSize: '13px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                Suspicious Risk Factor Category
              </label>
              <select
                className="reporting-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  padding: '8px 12px',
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Suspicious Link">Suspicious Hyperlink</option>
                <option value="Credential Theft">Credential Reset Request</option>
                <option value="Urgent Action">Urgent Action Mandate / CEO request</option>
                <option value="Suspicious Attachment">Suspicious File Attachment</option>
                <option value="Other">Other Indicator</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                Why do you think this email is suspicious?
              </label>
              <SmartTextarea
                className="reporting-textarea"
                rows="3"
                placeholder="Describe what triggers your concern. e.g. Domain typos, weird urgency language, unexpected billing, etc..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                required
                style={{
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  padding: '12px',
                  width: '100%',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Fake attachment upload */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                Upload EML / Email Headers / Screenshot (Optional)
              </label>
              <div style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s'
              }} className="upload-box-hover">
                <UploadCloud size={20} style={{ color: '#94a3b8', margin: '0 auto 4px auto' }} />
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: '600' }}>
                  {attachedFile ? `Attached: ${attachedFile}` : 'Drag & drop EML file, or click to upload'}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit"
              variant="primary"
              icon={Send}
              loading={loading}
              disabled={loading}
              style={{ width: '100%', borderRadius: '12px', fontWeight: '750', height: '44px' }}
            >
              Report Suspicious Email
            </Button>
          </form>
        </motion.div>

        {/* History Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.02)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', fontFamily: "'Fredoka', sans-serif" }}>
            Your Threat Flag History
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reportedEmails.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: '#64748b',
                padding: '48px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                border: '2px dashed #e2e8f0',
                borderRadius: '16px'
              }}>
                <Mail size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#475569', fontFamily: "'Fredoka', sans-serif" }}>No reports yet</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', maxWidth: '240px', lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                  Your submitted suspicious email reports will appear here.
                </p>
              </div>
            ) : (
              reportedEmails.map((report) => (
                <div 
                  key={report.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.015)',
                    transition: 'all 0.2s'
                  }}
                  className="history-card-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.subject}
                      </h4>
                      <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Sender: {report.senderEmail || report.sender}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}>
                      Category: {report.reason}
                    </span>
                    {(report.xp_earned || report.xp || report.status === 'Sent' || report.status === 'Reviewed') && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        background: '#ecfdf5',
                        color: '#10b981',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        +{report.xp_earned || report.xp || 100} XP
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#94a3b8', fontWeight: '650' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {report.reportedDate || report.created_at || 'Recently'}
                    </span>
                    <span style={{ color: '#6366f1' }}>
                      {report.campaignName || 'Simulation Email'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      <style>{`
        .reporting-input, .reporting-textarea, .reporting-select {
          transition: all 0.2s ease-in-out !important;
        }
        .reporting-input:focus, .reporting-textarea:focus, .reporting-select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important;
          outline: none !important;
        }
        .upload-box-hover:hover {
          border-color: #6366f1 !important;
          background-color: #f5f7ff !important;
        }
        .history-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.05) !important;
          border-color: #d8b4fe !important;
        }
        @media (max-width: 992px) {
          .responsive-reporting-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportSuspicious;
