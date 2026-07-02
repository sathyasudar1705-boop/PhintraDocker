import React, { useState, useEffect } from 'react';
import { Eye, ShieldAlert, Monitor, ChevronRight, Globe, Lock, AlertTriangle } from 'lucide-react';
import Button from '../../components/common/Button';

const LandingPageBuilder = () => {
  const templates = [
    {
      id: 1,
      brand: "Microsoft",
      name: "Microsoft 365 Login Lure",
      logo: "https://img.icons8.com/color/48/microsoft.png",
      logoType: "icon",
      defaultTitle: "Sign in to your account",
      defaultContent: "Because you are accessing highly sensitive corporate documents, you must re-verify your active directory security token.",
      buttonText: "Sign In",
      bgColor: '#ffffff',
      accentColor: '#0067b8',
      placeholderUser: 'someone@company.com'
    },
    {
      id: 2,
      brand: "Google",
      name: "Google Drive Access Gateway",
      logo: "https://img.icons8.com/color/48/google-logo.png",
      logoType: "icon",
      defaultTitle: "Google Drive: Request Review Access",
      defaultContent: "A secure PDF statement has been shared with you. Sign in with your G-Suite account credentials to unlock and view the doc.",
      buttonText: "Verify & Continue",
      bgColor: '#ffffff',
      accentColor: '#1a73e8',
      placeholderUser: 'username@gmail.com'
    },
    {
      id: 3,
      brand: "Phintra",
      name: "Phintra Payroll Hub Lure",
      logo: "https://i.pinimg.com/1200x/5c/07/7c/5c077c6c718fb0216266ccf723d011d3.jpg",
      logoType: "image",
      defaultTitle: "Phintra Hub - Q2 Salary Revision",
      defaultContent: "Salary adjustments and rewards structures for Q2 have been finalized. Please verify your identity status to review your appraisal invoice sheet.",
      buttonText: "Verify Payroll Statement",
      bgColor: 'var(--bg-main)',
      accentColor: 'var(--color-teal)',
      placeholderUser: 'alex.chen@phintra-enterprise.com'
    }
  ];

  // Active builder states
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [customDomain, setCustomDomain] = useState('auth-verify-portal.net');

  const [toastMessage, setToastMessage] = useState('');

  // Find active template metadata
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Set fields on template change
  useEffect(() => {
    setTitle(activeTemplate.defaultTitle);
    setContent(activeTemplate.defaultContent);
    setButtonText(activeTemplate.buttonText);
    if (activeTemplate.brand === 'Microsoft') {
      setCustomDomain('login.microsoft-auth-verify.com');
    } else if (activeTemplate.brand === 'Google') {
      setCustomDomain('accounts.google-drive-review.net');
    } else {
      setCustomDomain('payroll-hub.phintra-verify.com');
    }
  }, [selectedTemplateId]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    triggerToast(`Landing template page configuration saved! Host URI: https://${customDomain}/login`);
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
        <div className="saas-title-group">
          <h1>Phishing Landing Page Builder</h1>
          <p>Configure credential harvest panels and lookalike redirect portals to log user click susceptibility.</p>
        </div>
      </div>

      {/* Main split layout */}
      <div className="modal-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Form Builder Settings */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: 'var(--color-primary)' }} />
            Lure Gateway Parameters
          </h2>

          {/* Template Selectors */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px' }}>Select Lookalike Template Base</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {templates.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTemplateId(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: selectedTemplateId === t.id ? '2px solid var(--color-primary)' : '1px solid var(--border-hover)',
                    backgroundColor: selectedTemplateId === t.id ? 'var(--color-primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-sidebar)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <img src={t.logo} alt={t.brand} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{t.brand} Base Layout</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>{t.name}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: selectedTemplateId === t.id ? 'var(--color-primary)' : 'var(--text-subtle)' }} />
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Lookalike URL Host Domain</label>
              <input
                type="text"
                className="form-control"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
                placeholder="e.g. security-reset-microsoft.com"
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>Typo-squatted domains trigger higher click failures.</span>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Lure Title Header</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
                placeholder="e.g. Login verification page"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Description text content</label>
              <textarea
                className="form-control"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px', lineHeight: '1.5' }}
                placeholder="Description of the security instruction trigger"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Call To Action (CTA) Button Text</label>
              <input
                type="text"
                className="form-control"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)', fontSize: '13px' }}
                placeholder="e.g. Sign In"
                required
              />
            </div>

            <Button variant="primary" type="submit" style={{ width: '100%' }}>Deploy Telemetry Landing Page</Button>
          </form>
        </div>

        {/* Right Column: Web Browser Simulator Preview */}
        <div className="saas-card" style={{ padding: '24px', borderTop: '4px solid var(--color-teal)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={18} style={{ color: 'var(--color-teal)' }} />
            Live Lookalike Portal Viewport
          </h2>

          {/* Browser Container */}
          <div style={{
            border: '1px solid var(--border-hover)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
            backgroundColor: 'var(--bg-sidebar)'
          }}>
            
            {/* Browser Address Bar */}
            <div style={{
              backgroundColor: 'var(--border-color)',
              borderBottom: '1px solid var(--border-hover)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Window buttons */}
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
              </div>
              
              {/* Address bar input */}
              <div style={{
                flex: 1,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-hover)',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '11px',
                color: 'var(--text-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'monospace'
              }}>
                <Lock size={10} style={{ color: 'var(--color-success)' }} />
                <span style={{ color: 'var(--color-success)' }}>https://</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{customDomain || "phintra-gateway-node.net"}</span>
                <span>/login/index.html?telemetry=session_active</span>
              </div>
            </div>

            {/* Browser Webpage Body Viewport */}
            <div style={{
              backgroundColor: activeTemplate.bgColor,
              padding: '48px 24px',
              minHeight: '400px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}>
              
              {/* Lookalike Login Box Design */}
              <div style={{
                width: '100%',
                maxWidth: '380px',
                padding: '36px',
                borderRadius: activeTemplate.brand === 'Microsoft' ? '0px' : '8px',
                border: activeTemplate.brand === 'Microsoft' ? '1px solid var(--border-hover)' : '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                boxShadow: activeTemplate.brand === 'Microsoft' ? 'none' : '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                
                {/* Brand Logo Header */}
                <div style={{ marginBottom: '20px' }}>
                  {activeTemplate.logoType === 'image' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img 
                        src={activeTemplate.logo} 
                        alt="Logo" 
                        style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} 
                      />
                      <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>{activeTemplate.brand}</span>
                    </div>
                  ) : (
                    <img 
                      src={activeTemplate.logo} 
                      alt="Brand Logo" 
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }} 
                    />
                  )}
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: activeTemplate.brand === 'Microsoft' ? '20px' : '22px',
                  fontWeight: activeTemplate.brand === 'Microsoft' ? '600' : '500',
                  color: 'var(--text-main)',
                  marginBottom: '12px',
                  fontFamily: activeTemplate.brand === 'Microsoft' ? 'Segoe UI, Arial, sans-serif' : 'Roboto, Arial, sans-serif'
                }}>
                  {title || activeTemplate.defaultTitle}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  fontFamily: activeTemplate.brand === 'Microsoft' ? 'Segoe UI, Arial, sans-serif' : 'Roboto, Arial, sans-serif'
                }}>
                  {content || activeTemplate.defaultContent}
                </p>

                {/* Simulated Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <input
                    type="text"
                    disabled
                    placeholder={activeTemplate.placeholderUser}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      border: activeTemplate.brand === 'Microsoft' ? 'none' : '1px solid var(--border-hover)',
                      borderBottom: activeTemplate.brand === 'Microsoft' ? '1.5px solid var(--text-light)' : '1px solid var(--border-hover)',
                      borderRadius: activeTemplate.brand === 'Microsoft' ? '0px' : '4px',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  />
                  <input
                    type="password"
                    disabled
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      border: activeTemplate.brand === 'Microsoft' ? 'none' : '1px solid var(--border-hover)',
                      borderBottom: activeTemplate.brand === 'Microsoft' ? '1.5px solid var(--text-light)' : '1px solid var(--border-hover)',
                      borderRadius: activeTemplate.brand === 'Microsoft' ? '0px' : '4px',
                      backgroundColor: 'var(--bg-main)'
                    }}
                  />
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: activeTemplate.accentColor,
                      color: '#ffffff',
                      border: 'none',
                      padding: activeTemplate.brand === 'Microsoft' ? '6px 20px' : '8px 16px',
                      borderRadius: activeTemplate.brand === 'Microsoft' ? '0px' : '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'not-allowed',
                      width: activeTemplate.brand === 'Microsoft' ? 'auto' : '100%'
                    }}
                  >
                    {buttonText || activeTemplate.buttonText}
                  </button>
                </div>

              </div>

            </div>

            {/* Telemetry Warning Info */}
            <div style={{
              backgroundColor: '#fffbeb',
              borderTop: '1px solid var(--color-warning-light)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              color: '#b45309'
            }}>
              <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
              <span>Suspicious form indicators and credential logging parameters are simulated and secured.</span>
            </div>

          </div>
        </div>

      </div>

      {/* CSS style keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPageBuilder;
