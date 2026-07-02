import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useAppContext } from '../../context/AppContext';
import { Eye, Save, Sparkles, Layout, RotateCcw, AlertTriangle, ArrowRight, Shield, Mail, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';

const TEMPLATES = [
  {
    id: 'mfa',
    title: 'Action Required: Multi-Factor Authentication Verification',
    message: 'We have updated our internal authentication protocols to secure corporate assets. All employees are required to verify their mobile device authentication credentials immediately.',
    tips: [
      'Check the browser address bar to ensure you are on the company domain before logging in.',
      'Phintra internal systems will never ask you to authenticate twice within a minute.',
      'Report any unexpected MFA push notifications directly to the Security Team.'
    ],
    ctaText: 'Verify Account MFA Now',
    theme: 'danger'
  },
  {
    id: 'hr_policy',
    title: 'Updated Remote Work Security Guidelines 2026',
    message: 'To protect corporate data while working remotely, please review the revised remote access guidelines and confirm compliance before the end of the week.',
    tips: [
      'Never use public Wi-Fi without connecting to Phintra corporate VPN.',
      'Ensure your home router admin password has been changed from default settings.',
      'Lock your screen when leaving your device unattended, even at home.'
    ],
    ctaText: 'Review Guidelines',
    theme: 'teal'
  },
  {
    id: 'payroll',
    title: 'Quarterly Earnings Report & Payroll Verification',
    message: 'Please access the secure finance portal to check your updated tax distributions and payroll adjustments for this quarter.',
    tips: [
      'Corporate HR does not send payroll links hosted on external cloud drives (e.g., OneDrive, Dropbox).',
      'Hover over URLs to see the actual target domain before clicking.',
      'Reach out directly to the Payroll department via Slack if you receive unexpected document requests.'
    ],
    ctaText: 'Access Portal',
    theme: 'primary'
  }
];

const AwarenessBuilder = () => {
  const toast = useToast();
  const { 
    awarenessPages, 
    emailTemplates, 
    addAwarenessPage, 
    editAwarenessPage, 
    deleteAwarenessPage 
  } = useAppContext();

  // Active DB Configuration Page State
  const [activePageId, setActivePageId] = useState('');
  
  // Form Field States
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [tipsText, setTipsText] = useState(TEMPLATES[0].tips.join('\n'));
  const [ctaText, setCtaText] = useState(TEMPLATES[0].ctaText);
  const [theme, setTheme] = useState(TEMPLATES[0].theme);
  
  // Associated Email template ID
  const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState('');

  const [previewTab, setPreviewTab] = useState('desktop');

  // Triggered when active configuration page changes
  useEffect(() => {
    if (activePageId === '') {
      // Load selected default template
      const template = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
      setTitle(template.title);
      setMessage(template.message);
      setTipsText(template.tips.join('\n'));
      setCtaText(template.ctaText);
      setTheme(template.theme);
      setSelectedEmailTemplateId('');
    } else {
      // Load saved database configuration
      const page = (awarenessPages || []).find(p => p.id === activePageId);
      if (page) {
        setTitle(page.title);
        try {
          const config = JSON.parse(page.html_content);
          setMessage(config.message || '');
          setTipsText(Array.isArray(config.tips) ? config.tips.join('\n') : (config.tips || ''));
          setCtaText(config.ctaText || '');
          setTheme(config.theme || 'primary');
          setSelectedEmailTemplateId(config.email_template_id || '');
        } catch (e) {
          console.warn("Failed to parse awareness page json config:", e);
          setMessage(page.html_content || '');
          setTipsText('');
          setCtaText('Acknowledge');
          setTheme('primary');
          setSelectedEmailTemplateId('');
        }
      }
    }
  }, [activePageId, awarenessPages]);

  const handleTemplateChange = (id) => {
    setSelectedTemplateId(id);
    if (activePageId === '') {
      const template = TEMPLATES.find(t => t.id === id);
      if (template) {
        setTitle(template.title);
        setMessage(template.message);
        setTipsText(template.tips.join('\n'));
        setCtaText(template.ctaText);
        setTheme(template.theme);
      }
    }
  };

  const handleReset = () => {
    if (activePageId) {
      // Re-trigger useEffect
      const page = (awarenessPages || []).find(p => p.id === activePageId);
      if (page) {
        setTitle(page.title);
        try {
          const config = JSON.parse(page.html_content);
          setMessage(config.message || '');
          setTipsText(Array.isArray(config.tips) ? config.tips.join('\n') : (config.tips || ''));
          setCtaText(config.ctaText || '');
          setTheme(config.theme || 'primary');
          setSelectedEmailTemplateId(config.email_template_id || '');
        } catch (e) {}
      }
    } else {
      handleTemplateChange(selectedTemplateId);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const config = {
      message: message,
      tips: tipsText.split('\n').filter(t => t.trim() !== ''),
      ctaText: ctaText,
      theme: theme,
      email_template_id: selectedEmailTemplateId || null
    };

    const payload = {
      title: title,
      html_content: JSON.stringify(config)
    };

    try {
      if (activePageId) {
        await editAwarenessPage(activePageId, payload);
        toast.success(`Successfully updated awareness redirection profile: "${title}"`);
      } else {
        const newPage = await addAwarenessPage(payload);
        toast.success(`Successfully created awareness redirection profile: "${title}"`);
        setActivePageId(newPage.id);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to save awareness page profile.");
    }
  };

  const handleDelete = async () => {
    if (!activePageId) return;
    if (window.confirm(`Are you sure you want to delete the configuration "${title}"?`)) {
      try {
        await deleteAwarenessPage(activePageId);
        toast.success("Successfully deleted awareness page configuration.");
        setActivePageId("");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete configuration.");
      }
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'danger':
        return { primary: 'var(--color-danger)', bg: 'var(--color-danger-light)', text: 'var(--color-danger)' };
      case 'teal':
        return { primary: 'var(--color-teal)', bg: 'var(--color-teal-light)', text: 'var(--color-teal)' };
      case 'primary':
      default:
        return { primary: 'var(--color-primary)', bg: 'var(--color-primary-light)', text: 'var(--color-primary)' };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Awareness Page Builder</h1>
          <p>Create educational redirection pages shown when employees click on simulated phishing links.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Editor Form */}
        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Page Configurations</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleReset}
                className="btn btn-secondary btn-sm"
                title="Reset Form"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Active Configuration profile */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Active Configuration Profile</label>
              <select 
                className="form-control"
                value={activePageId} 
                onChange={(e) => setActivePageId(e.target.value)}
              >
                <option value="">-- Create New Awareness Page --</option>
                {(awarenessPages || []).map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            {/* Template Selection */}
            {activePageId === '' && (
              <div className="form-group">
                <label className="form-label">Start from a Template Preset</label>
                <select 
                  className="form-control"
                  value={selectedTemplateId} 
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  {TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>{t.title.substring(0, 45)}...</option>
                  ))}
                </select>
              </div>
            )}

            {/* Associated Email template */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600' }}>Associated Phishing Email Template</label>
              <select 
                className="form-control"
                value={selectedEmailTemplateId} 
                onChange={(e) => setSelectedEmailTemplateId(e.target.value)}
              >
                <option value="">-- Select Linked Phishing Email Lure --</option>
                {(emailTemplates || []).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                ))}
              </select>
            </div>

            {/* Linked template preview */}
            {selectedEmailTemplateId && (
              <div className="saas-card" style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                fontSize: '12px',
                color: 'var(--text-main)',
                backdropFilter: 'blur(10px)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} style={{ color: 'var(--color-primary)' }} />
                  Linked Lure Parameters
                </h4>
                {(() => {
                  const linkedTemp = emailTemplates.find(t => t.id === selectedEmailTemplateId);
                  if (!linkedTemp) return <span>Loading template details...</span>;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div><span style={{ color: 'var(--text-light)' }}>Sender:</span> <strong>{linkedTemp.sender_name}</strong> &lt;{linkedTemp.sender_email || 'lure@phintra-delivery.com'}&gt;</div>
                      <div><span style={{ color: 'var(--text-light)' }}>Subject:</span> <strong>{linkedTemp.subject}</strong></div>
                      <div><span style={{ color: 'var(--text-light)' }}>Category:</span> <span className="badge badge-reported" style={{ fontSize: '10px' }}>{linkedTemp.category}</span></div>
                      
                      <div style={{
                        marginTop: '8px',
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-card)',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--border-hover)',
                        lineHeight: '1.4'
                      }}>
                        {linkedTemp.body_text || linkedTemp.body || 'No text preview available.'}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Page Main Title</label>
              <input 
                type="text" 
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Urgent System Maintenance Notification"
                required
              />
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label">Educational Message</label>
              <textarea 
                className="form-control"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter awareness description or warnings..."
                required
              />
            </div>

            {/* Tips list */}
            <div className="form-group">
              <label className="form-label">Security Red Flags / Tips (One per line)</label>
              <textarea 
                className="form-control"
                rows="4"
                value={tipsText}
                onChange={(e) => setTipsText(e.target.value)}
                placeholder="Provide security advice..."
                required
              />
            </div>

            {/* Theme & CTA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Button Text</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Acknowledge & Return"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Alert Theme</label>
                <select 
                  className="form-control"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="primary">Brand Blue (Info)</option>
                  <option value="danger">Crimson Red (Urgent)</option>
                  <option value="teal">Teal (Standard)</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', gap: '12px' }}>
              <Button type="submit" variant="primary" icon={Save} style={{ flex: 2 }}>
                {activePageId ? "Update Configuration" : "Save Configuration"}
              </Button>
              {activePageId && (
                <Button type="button" variant="danger" icon={Trash2} onClick={handleDelete} style={{ flex: 1 }}>
                  Delete Page
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Live Preview Console */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Live Redirect Preview</h3>
            <div className="saas-tabs" style={{ marginBottom: 0, gap: '12px' }}>
              <span 
                className={`saas-tab ${previewTab === 'desktop' ? 'active' : ''}`}
                style={{ padding: '4px 8px', fontSize: '13px' }}
                onClick={() => setPreviewTab('desktop')}
              >
                Desktop
              </span>
              <span 
                className={`saas-tab ${previewTab === 'mobile' ? 'active' : ''}`}
                style={{ padding: '4px 8px', fontSize: '13px' }}
                onClick={() => setPreviewTab('mobile')}
              >
                Mobile
              </span>
            </div>
          </div>

          <div style={{
            flex: 1,
            backgroundColor: 'var(--border-hover)',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            minHeight: '400px'
          }}>
            {/* The Outer Frame */}
            <div style={{
              width: previewTab === 'desktop' ? '100%' : '320px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--text-subtle)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.3s ease'
            }}>
              {/* Browser Header Bar */}
              <div style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderBottom: '1px solid var(--border-color)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '11px',
                  color: 'var(--text-light)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  https://phintra-simulation.security/awareness
                </div>
              </div>

              {/* Awareness Page Content */}
              <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    backgroundColor: themeColors.bg,
                    color: themeColors.primary,
                    padding: '16px',
                    borderRadius: '50%'
                  }}>
                    <AlertTriangle size={32} />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {title || 'Oops! Simulated Link Clicked'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '8px', lineHeight: '1.5' }}>
                    {message || 'This is an educational screen created by the security operations team.'}
                  </p>
                </div>

                {/* Simulated Tips Console */}
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  borderLeft: `4px solid ${themeColors.primary}`,
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Shield size={16} style={{ color: themeColors.primary }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Educational Insights</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tipsText.split('\n').filter(t => t.trim() !== '').map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Button */}
                <button 
                  type="button"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => toast.info('Simulated action redirect completed')}
                >
                  {ctaText || 'Acknowledge Guidelines'}
                  <ArrowRight size={16} />
                </button>

                <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                  Phintra Awareness Redirection Console &copy; 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessBuilder;
