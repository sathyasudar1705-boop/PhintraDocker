import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAppContext } from '../../context/AppContext';
import { Mail, Plus, AlertCircle, Link2, Eye, ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

const TemplateBuilder = () => {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { addTemplate, editTemplate } = useAppContext();

  // Route State
  const state = location.state || {};
  const { template, mode } = state;

  // Detect initial format
  const isPlainInit = template && template.body_text && (!template.body_html || template.body_html === '');

  // Form Fields
  const [name, setName] = useState(template ? (mode === 'clone' ? `Copy of ${template.name}` : template.name) : '');
  const [category, setCategory] = useState(template?.category || 'Credential Theft');
  const [difficulty, setDifficulty] = useState(template?.difficulty || 'Medium');
  const [senderName, setSenderName] = useState(template?.sender_name || 'IT Desk Support');
  const [senderEmail, setSenderEmail] = useState(template?.sender_email || 'security-update@phintra-auth.com');
  const [subject, setSubject] = useState(template?.subject || '[ACTION REQUIRED] Confirm Security Credentials');
  const [bodyFormat, setBodyFormat] = useState(isPlainInit ? 'Plain Text' : 'HTML');
  const [body, setBody] = useState(template ? (isPlainInit ? template.body_text : (template.body_html || template.body)) : `Dear Team member,

We have detected suspicious login traffic on your workstation network nodes. To prevent access blocks, you are requested to verify your authentication token immediately.

Please click here to authorize your credential access:
[Verify Workspace Login](https://phintra-secure-hub.net/auth-verify)

Failure to review within 24 hours will lead to temporary suspension.

Best regards,
Information Security Department`);

  // Link Insertion Modal/Form Overlay State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('Verify Verification Code');
  const [linkUrl, setLinkUrl] = useState('https://corporate-phintra-portal.org/login');

  // Success/Error states
  const [toastMessage, setToastMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleInsertLink = (e) => {
    e.preventDefault();
    if (!linkText || !linkUrl) return;

    const textToInsert = `[${linkText}](${linkUrl})`;
    const textarea = document.getElementById('templateBodyTextarea');
    
    if (!textarea) {
      setBody(prev => prev + ' ' + textToInsert + ' ');
    } else {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      setBody(before + textToInsert + after);
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      }, 0);
    }
    
    setShowLinkModal(false);
    showToast('Phishing anchor link successfully injected into editor cursor.');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !senderName || !senderEmail || !subject || !body) {
      setErrorMsg('Please complete all required fields before saving.');
      return;
    }

    try {
      const templateData = {
        name,
        category,
        difficulty,
        subject,
        body: body,
        body_html: bodyFormat === 'HTML' ? body : '',
        body_text: bodyFormat === 'Plain Text' ? body : '',
        sender_name: senderName,
        sender_email: senderEmail
      };

      if (mode === 'edit' && template?.id) {
        await editTemplate(template.id, templateData);
        showToast(`Template "${name}" has been successfully updated!`);
      } else {
        await addTemplate(templateData);
        showToast(`Template "${name}" has been successfully added to your database!`);
      }

      setTimeout(() => {
        navigate('/admin/templates');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to save template. Please check the spoof email domain requirements.');
    }
  };

  const renderPreviewBody = (text) => {
    if (!text) return <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>Your email content will render here...</span>;
    
    if (bodyFormat === 'HTML') {
      let previewHtml = text;
      previewHtml = previewHtml.replace(/\{\{TrackingLink\}\}/g, '#');
      previewHtml = previewHtml.replace(/\{\{EmployeeName\}\}/g, 'John Doe');
      previewHtml = previewHtml.replace(/\{\{Company\}\}/g, 'Phintra Test Lab');
      previewHtml = previewHtml.replace(/\{\{employee_name\}\}/g, 'John Doe');
      previewHtml = previewHtml.replace(/\{\{company_name\}\}/g, 'Phintra Test Lab');
      previewHtml = previewHtml.replace(/\{\{login_link\}\}/g, '#');

      return (
        <div 
          dangerouslySetInnerHTML={{ __html: previewHtml }} 
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px', color: '#000000', minHeight: '140px' }} 
        />
      );
    }

    const parts = [];
    let lastIndex = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      
      const anchorText = match[1];
      const anchorUrl = match[2];
      
      parts.push(
        <a 
          key={matchIndex} 
          href="#" 
          onClick={(e) => { e.preventDefault(); toast.info(`Simulated link target: ${anchorUrl}`); }}
          title={anchorUrl}
          style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'underline', 
            fontWeight: '600', 
            cursor: 'pointer',
            padding: '2px 4px',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px dashed #bfdbfe',
            borderRadius: '4px',
            margin: '0 2px'
          }}
        >
          {anchorText}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return (
      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
        {parts.length > 0 ? parts : text}
      </div>
    );
  };

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out',
          fontSize: '14px'
        }}>
          <ShieldAlert size={18} style={{ color: 'var(--color-success)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/admin/templates')}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', gap: '4px', fontSize: '14px', padding: '8px 0' }}
          >
            <ArrowLeft size={16} /> Back to Templates
          </button>
          <div>
            <h1>{mode === 'edit' ? 'Edit Email Template' : 'Email Template Builder'}</h1>
            <p>Design and customize highly detailed email templates with dynamic tokens to construct complex corporate simulations.</p>
          </div>
        </div>
      </div>

      {/* Main Column Grid */}
      <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Form Editor */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} style={{ color: 'var(--color-primary)' }} />
            Template Parameters
          </h2>

          {errorMsg && (
            <div style={{
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Template Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. IT Token Renewal Notice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Threat Category</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                >
                  <option value="Credential Theft">Credential Theft</option>
                  <option value="Urgent Action">Urgent Action</option>
                  <option value="Suspicious Link">Suspicious Link</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Complexity Level</label>
                <select
                  className="form-control"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Sender Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Corporate IT Support"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Sender Spoof Email</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. accounts@phintra-teams.net"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Email Subject Line</label>
              <input
                type="text"
                className="form-control"
                placeholder="Subject Line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="form-label" style={{ fontWeight: '500', fontSize: '13px', margin: 0 }}>Email Content</label>
                  <select
                    value={bodyFormat}
                    onChange={(e) => {
                      setBodyFormat(e.target.value);
                      showToast(`Format switched to ${e.target.value}`);
                    }}
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="HTML">HTML Format</option>
                    <option value="Plain Text">Plain Text Format</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const textToInsert = bodyFormat === 'HTML' 
                        ? '<a href="{{TrackingLink}}">Open Secure Link</a>' 
                        : '{{TrackingLink}}';
                      
                      const textarea = document.getElementById('templateBodyTextarea');
                      if (!textarea) {
                        setBody(prev => prev + ' ' + textToInsert);
                      } else {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const text = textarea.value;
                        const before = text.substring(0, start);
                        const after = text.substring(end, text.length);
                        setBody(before + textToInsert + after);
                        setTimeout(() => {
                          textarea.focus();
                          textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
                        }, 0);
                      }
                      showToast('Tracking link token inserted successfully!');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--color-teal)',
                      backgroundColor: 'rgba(20, 184, 166, 0.1)',
                      border: '1px solid rgba(20, 184, 166, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <Link2 size={13} />
                    Insert Tracking Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-light)',
                      border: '1px solid #bfdbfe',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <Link2 size={13} />
                    Insert Link Anchor
                  </button>
                </div>
              </div>
              <textarea
                id="templateBodyTextarea"
                className="form-control"
                rows="10"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <Button variant="outline" type="button" onClick={() => navigate('/admin/templates')} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" style={{ flex: 2 }}>
                {mode === 'edit' ? 'Update Template in Database' : 'Save Blueprint to Database'}
              </Button>
            </div>
          </form>
        </div>


        {/* Right Column: Outlook Simulated Client Preview */}
        <div className="saas-card" style={{ padding: '24px', borderTop: '4px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={18} style={{ color: 'var(--color-teal)' }} />
            Outlook Live Client Preview
          </h2>

          <div style={{ border: '1px solid var(--border-hover)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            
            {/* Outlook Header Toolbar */}
            <div style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-hover)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-warning)', display: 'inline-block' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }}></span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', letterSpacing: '0.05em' }}>SIMULATED CLIENT</span>
            </div>

            {/* Email Metadata Headers */}
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-light)', width: '60px' }}>From:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{senderName || "Unknown Name"}</span>
                  <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>&lt;{senderEmail || "lure@phintra-delivery.com"}&gt;</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-light)', width: '60px' }}>To:</span>
                <span style={{ color: 'var(--text-muted)' }}>victim-target@phintra-enterprise.com</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-light)', width: '60px' }}>Subject:</span>
                <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{subject || "(No Subject)"}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-subtle)', borderTop: '1px solid var(--bg-sidebar)', paddingTop: '6px' }}>
                <span>Date: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>• Priority: High</span>
              </div>
            </div>

            {/* Email Body Canvas */}
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', minHeight: '260px', overflowY: 'auto' }}>
              {renderPreviewBody(body)}
            </div>
            
            {/* Warning Footer info */}
            <div style={{ backgroundColor: '#fffbeb', borderTop: '1px solid var(--color-warning-light)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#b45309' }}>
              <AlertCircle size={14} />
              <span>Simulated links are tracked automatically by the Phintra click telemetry suite.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Link Builder Modal Dialog Overlay */}
      {showLinkModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-content animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Insert Telemetry Link Anchor</h3>
              <button 
                onClick={() => setShowLinkModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInsertLink}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Link Text (Visual Name)</label>
                <input
                  type="text"
                  className="form-control"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Phishing Destination URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifySelf: 'end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Insert Anchor Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS Styles slideUp keyframe */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TemplateBuilder;
