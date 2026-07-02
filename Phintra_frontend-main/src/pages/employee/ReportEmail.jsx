import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { AlertTriangle, Send, UploadCloud, CheckCircle2, ShieldAlert, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/common/Button';
import ReportSuccessAnimation from '../../components/user/ReportSuccessAnimation';
import StatusBadge from '../../components/user/StatusBadge';
import ReportSuccessModal from '../../components/user/ReportSuccessModal';

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
    <div style={{ padding: '0 8px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      <ReportSuccessAnimation trigger={triggerExplosion} />
      <ReportSuccessModal isOpen={success} onClose={() => setSuccess(false)} />

      {/* Header */}
      <div className="saas-header" style={{ marginBottom: '32px' }}>
        <div className="saas-title-group">
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>Threat Reporting Center</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Instantly flag suspicious incoming emails to the IT security response team to isolate threats.</p>
        </div>
      </div>

      {/* Main Grid: Left Form + Right Recent History list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
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
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  marginBottom: '20px'
                }}
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '8px' }}>
                Sender Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. security-alert@office365-verify.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                disabled={loading}
                required
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '8px 12px',
                  width: '100%',
                  fontSize: '13px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '8px' }}>
                Email Subject Line
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Action Required: Account Suspension Warning"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                required
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '8px 12px',
                  width: '100%',
                  fontSize: '13px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '8px' }}>
                Suspicious Risk Factor Category
              </label>
              <select
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '8px 12px',
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569'
                }}
              >
                <option value="Suspicious Link">Suspicious Hyperlink</option>
                <option value="Credential Theft">Credential Reset Request</option>
                <option value="Urgent Action">Urgent Action Mandate / CEO request</option>
                <option value="Suspicious Attachment">Suspicious File Attachment</option>
                <option value="Other">Other Indicator</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '8px' }}>
                Description of Anomalies
              </label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Describe what triggers your concern. e.g. Domain typos, weird urgency language, unexpected billing, etc..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                required
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '12px',
                  width: '100%',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}
              />
            </div>

            {/* Fake attachment upload */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#475569', marginBottom: '8px' }}>
                Upload EML / Email headers (Optional)
              </label>
              <div style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '18px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.2s'
              }}>
                <UploadCloud size={24} style={{ color: '#94a3b8', margin: '0 auto 6px auto' }} />
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
              style={{ width: '100%', borderRadius: '12px', fontWeight: '750' }}
            >
              Submit Threat Report
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
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px' }}>
            Your Threat Flag History
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reportedEmails.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '13px' }}>
                No reports submitted yet.
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
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.005)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#1e293b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.subject}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        From: {report.senderEmail}
                      </p>
                    </div>
                    <StatusBadge status={report.status} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '11px', color: '#94a3b8', fontWeight: '650' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {report.reportedDate || 'Recently'}
                    </span>
                    <span style={{ color: '#4f46e5' }}>
                      {report.campaignName || 'External Report'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .responsive-reporting-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportSuspicious;
