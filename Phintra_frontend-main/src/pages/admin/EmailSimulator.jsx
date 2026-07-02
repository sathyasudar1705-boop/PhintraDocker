import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Send, Eye, ShieldAlert, Sparkles, RefreshCw, AlertCircle, Info, Check } from 'lucide-react';
import Button from '../../components/common/Button';

const TEMPLATES = [
  {
    id: 'urgency',
    name: 'MFA Deactivation Warning',
    subject: 'URGENT: Multi-Factor Authentication Deactivation Notice',
    senderName: 'Phintra Security Desk',
    senderEmail: 'security-alert@phintra-auth-update.support',
    body: `Dear Employee,\n\nOur system detected multiple failed login attempts on your account. As a safety precaution, your Multi-Factor Authentication (MFA) token will be deactivated in 2 hours unless you confirm your identity.\n\nPlease click the button below to verify your session credentials immediately:\n\n[VERIFY AUTHENTICATION NOW]\n\nFailure to verify your identity will result in a permanent account suspension.\n\nSincerely,\nPhintra Security Ops Team`,
    indicators: [
      { element: 'senderEmail', issue: 'Domain is "phintra-auth-update.support", not the legitimate "phintra.com" corporate domain.' },
      { element: 'bodyUrgency', issue: 'Artificial urgency ("in 2 hours", "permanent account suspension") is a classic high-pressure phishing tactic.' },
      { element: 'bodyGreeting', issue: 'Generic greeting ("Dear Employee") instead of personalization suggests a mass campaign.' }
    ]
  },
  {
    id: 'authority',
    name: 'CEO Urgent Request',
    subject: 'Quick Task (Confidential)',
    senderName: 'Sathya Sudar (CEO)',
    senderEmail: 'sathya.ceo@ceo-office-mail.com',
    body: `Hi Team,\n\nI am currently stepping into a client presentation and cannot take calls. I need you to purchase 5 App Store gift cards of $100 value each for a client reward system code verification.\n\nPlease mail me the codes as soon as you have them. This is confidential and needs to be done within the hour.\n\nThanks,\nSathya Sudar, CEO`,
    indicators: [
      { element: 'senderEmail', issue: 'Address uses a public domain provider lookalike rather than company email servers.' },
      { element: 'bodyRequest', issue: 'Unusual requests for gift cards or financial transfers via confidential, out-of-channel emails.' },
      { element: 'bodyUrgency', issue: 'Restricting communication channels (stepping into presentation) to prevent verification.' }
    ]
  },
  {
    id: 'package',
    name: 'Missed Package Delivery',
    subject: 'Delivery Failed: Courier parcel on hold',
    senderName: 'Express Delivery Hub',
    senderEmail: 'notifications@delivery-tracking-portal-express.net',
    body: `Hello Delivery Customer,\n\nYour courier shipment under airway bill code #98024-EX has been suspended at our sorting center due to incorrect address information.\n\nTo schedule a re-delivery, click on this portal address link:\n\n[TRACK AND DISPATCH PARCEL]\n\nNote: Package holding fees of $1.50 per day will accrue after 48 hours.\n\nKind regards,\nSupport Operations`,
    indicators: [
      { element: 'senderEmail', issue: 'Sender address uses an unverified, generic looking logistics tracking domain.' },
      { element: 'bodyGreeting', issue: 'Generic recipient reference ("Hello Delivery Customer") rather than your real name.' },
      { element: 'bodyRequest', issue: 'Requests for credit cards for minor fee collections ($1.50) are used to harvest banking credentials.' }
    ]
  }
];

const EmailSimulator = () => {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [senderName, setSenderName] = useState(TEMPLATES[0].senderName);
  const [senderEmail, setSenderEmail] = useState(TEMPLATES[0].senderEmail);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [showIndicators, setShowIndicators] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleTemplateChange = (id) => {
    const template = TEMPLATES.find(t => t.id === id);
    if (template) {
      setSelectedId(id);
      setSubject(template.subject);
      setSenderName(template.senderName);
      setSenderEmail(template.senderEmail);
      setBody(template.body);
      setShowIndicators(false);
      setTestSent(false);
    }
  };

  const handleTestSend = (e) => {
    e.preventDefault();
    setTestSent(true);
    setTimeout(() => {
      setTestSent(false);
      toast.success('Simulation drafted successfully. In a real test, this will generate a training card targeting the user portal.');
    }, 1500);
  };

  const currentIndicators = TEMPLATES.find(t => t.id === selectedId)?.indicators || [];

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Phishing Email Simulator</h1>
          <p>Draft and inspect educational emails to evaluate risk indicators and mock phishing lures safely.</p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="saas-card" style={{
        borderColor: 'var(--color-primary)',
        backgroundColor: 'var(--color-primary-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px 20px'
      }}>
        <Info color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: '500' }}>
          <strong>Sandbox Notice:</strong> This tool operates exclusively in a simulated frontend sandbox. No actual emails will be transmitted, nor will user data be collected.
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Configurations Form */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Email Configuration</h3>
          
          <form onSubmit={handleTestSend}>
            {/* Lure presets */}
            <div className="form-group">
              <label className="form-label">Phishing Lure Template Preset</label>
              <select 
                className="form-control"
                value={selectedId}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Sender Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Sender Display Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={senderName} 
                  onChange={(e) => setSenderName(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sender Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={senderEmail} 
                  onChange={(e) => setSenderEmail(e.target.value)} 
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label">Subject Line</label>
              <input 
                type="text" 
                className="form-control" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required
              />
            </div>

            {/* Email Message Content */}
            <div className="form-group">
              <label className="form-label">Email Content Body</label>
              <textarea 
                className="form-control" 
                rows="8" 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                type="button"
                className={`btn ${showIndicators ? 'btn-teal' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setShowIndicators(!showIndicators)}
              >
                <ShieldAlert size={18} />
                {showIndicators ? 'Hide Red Flags' : 'Analyze Red Flags'}
              </button>
              
              <Button 
                type="submit" 
                variant="primary" 
                icon={testSent ? Check : Send} 
                disabled={testSent}
                style={{ flex: 1 }}
              >
                {testSent ? 'Publishing...' : 'Publish to User Feed'}
              </Button>
            </div>
          </form>
        </div>

        {/* Live Client Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Interactive Desktop Client Preview</h3>
            
            <div style={{
              border: '1px solid var(--border-hover)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              {/* Mail App header */}
              <div style={{
                backgroundColor: 'var(--bg-main)',
                borderBottom: '1px solid var(--border-color)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-hover)' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--border-hover)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '500' }}>Phintra MailReader Web</span>
                </div>
                <span className="badge badge-reported" style={{ fontSize: '10px', padding: '2px 8px' }}>Preview Window</span>
              </div>

              {/* Opened Email Details */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-sidebar)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{subject}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{senderName}</span>
                      <span 
                        style={{ 
                          color: 'var(--text-light)', 
                          backgroundColor: showIndicators ? 'var(--color-danger-light)' : 'var(--bg-sidebar)',
                          border: showIndicators ? '1px dashed var(--color-danger)' : '1px solid transparent',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        &lt;{senderEmail}&gt;
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Today, 10:42 AM</span>
                </div>
              </div>

              {/* Opened Email Body */}
              <div style={{ padding: '24px 20px', minHeight: '240px', fontSize: '14px', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {body.split('\n').map((line, idx) => {
                  if (line.includes('[VERIFY AUTHENTICATION NOW]') || line.includes('[TRACK AND DISPATCH PARCEL]')) {
                    const cleanBtnText = line.replace('[', '').replace(']', '');
                    return (
                      <button
                        key={idx}
                        type="button"
                        style={{
                          display: 'block',
                          margin: '20px 0',
                          backgroundColor: showIndicators ? 'var(--color-warning-light)' : 'var(--color-danger)',
                          border: showIndicators ? '2px dashed var(--color-warning)' : 'none',
                          color: showIndicators ? 'var(--color-warning)' : '#ffffff',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                        onClick={() => toast.info('Phishing Simulation Click Registered')}
                      >
                        {cleanBtnText}
                      </button>
                    );
                  }
                  if (line.includes('[VERIFY AUTHENTICATION NOW]') || line.includes('[TRACK AND DISPATCH PARCEL]') || line.includes('gift cards')) {
                    return (
                      <span 
                        key={idx} 
                        style={{ 
                          backgroundColor: showIndicators ? 'var(--color-danger-light)' : 'transparent',
                          borderBottom: showIndicators ? '2px dotted var(--color-danger)' : 'none',
                          padding: '2px 0' 
                        }}
                      >
                        {line}
                      </span>
                    );
                  }
                  return <p key={idx} style={{ marginBottom: '8px' }}>{line}</p>;
                })}
              </div>
            </div>
          </div>

          {/* Red Flag Analysis Cards */}
          {showIndicators && (
            <div className="saas-card animate-fade-in" style={{ borderColor: 'var(--color-danger)', backgroundColor: '#fff8f8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-danger)' }}>
                <ShieldAlert size={18} />
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Phishing Indicators Detected</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentIndicators.map((ind, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid var(--color-danger-light)', paddingBottom: '10px' }}>
                    <div style={{ 
                      backgroundColor: 'var(--color-danger)', color: '#ffffff', 
                      width: '20px', height: '20px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '11px', fontWeight: 'bold', flexShrink: 0 
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <strong style={{ textTransform: 'capitalize', color: 'var(--color-danger)' }}>
                        {ind.element.replace(/([A-Z])/g, ' $1')}:
                      </strong>{' '}
                      {ind.issue}
                    </div>
                  </div>
                ))}
                {currentIndicators.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    No pre-configured markers for this custom text, but evaluate spelling, links, and tone.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailSimulator;
