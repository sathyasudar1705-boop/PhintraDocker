import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Building2, Bell, Shield, User, CheckCircle2, Lock, Key, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminSettings = () => {
  const { currentUser, updateProfile } = useAppContext();

  // Tab State
  const [activeTab, setActiveTab] = useState('org');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields: Organization
  const [companyName, setCompanyName] = useState('Phintra Enterprise');
  const [timezone, setTimezone] = useState('GMT+05:30');

  // Form Fields: Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [threatAlerts, setThreatAlerts] = useState(true);

  // Form Fields: Security
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState('strong');

  // Form Fields: Profile
  const [profileName, setProfileName] = useState(currentUser.name || 'Alex Chen');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || 'alex.chen@phintra-enterprise.com');

  // Form Fields: Microsoft Authentication
  const [tenantId, setTenantId] = useState('common');
  const [clientId, setClientId] = useState('phintra-client-id-xyz123');
  const [redirectUri, setRedirectUri] = useState('https://phintra.com/auth/callback');
  const [allowedDomains, setAllowedDomains] = useState('phintra-enterprise.com, partner.com');
  const [loginMode, setLoginMode] = useState('sso'); // 'sso' (Microsoft SSO) or 'fallback' (Email Fallback)
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestMicrosoftLogin = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        message: 'SSO Connection Successful: Tenant verified for Allowed Domains!'
      });
    }, 1000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate saving network delay
    setTimeout(() => {
      setLoading(false);
      setShowToast(true);
      
      // Update global context profile if profile tab edited
      if (activeTab === 'profile') {
        updateProfile({
          name: profileName,
          email: profileEmail
        });
      }

      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }, 800);
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Platform Settings</h1>
          <p>Configure organizational parameters, security enforcement compliance, and administrator preferences.</p>
        </div>
      </div>

      {/* Settings Grid (Left Menu Tabs + Right Forms Card) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '32px',
        alignItems: 'start'
      }} className="responsive-settings-grid">
        
        {/* Left Menu Tabs */}
        <div className="saas-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'org', label: 'Organization', icon: Building2 },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security Policies', icon: Shield },
            { id: 'profile', label: 'Admin Profile', icon: User },
            { id: 'ms-auth', label: 'Microsoft SSO', icon: Key }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%'
                }}
                className={isActive ? "" : "settings-tab-hover"}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Form Card */}
        <div className="saas-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSave}>
            
            {/* TABS 1: ORGANIZATION SETTINGS */}
            {activeTab === 'org' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Organization Settings</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>Set up company identification and global localization parameters.</p>

                <div className="form-group">
                  <label className="form-label">Company / Workspace Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Timezone</label>
                  <select
                    className="form-control"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="GMT-05:00">GMT-05:00 (EST)</option>
                    <option value="GMT+00:00">GMT+00:00 (UTC)</option>
                    <option value="GMT+01:00">GMT+01:00 (BST)</option>
                    <option value="GMT+05:30">GMT+05:30 (IST)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Company Logo (UI Branding)</label>
                  <div style={{
                    border: '2px dashed var(--border-hover)',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-light)',
                    fontSize: '13px'
                  }}>
                    <Building2 size={24} style={{ margin: '0 auto 10px auto', color: 'var(--text-subtle)' }} />
                    <span>Click to upload workspace logo (PNG or SVG)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: NOTIFICATIONS SETTINGS */}
            {activeTab === 'notifications' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Communication Settings</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>Determine when and where platform administrators receive security highlights.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Toggle 1 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>Email Campaign Summaries</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px', display: 'inline-block' }}>
                        Receive detailed email reports automatically once a simulation campaign completes its course.
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }} 
                    />
                  </div>

                  {/* Toggle 2 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>Weekly Security Digest</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px', display: 'inline-block' }}>
                        Get a aggregated email digest summarizing organizational risk rating fluctuations and employee failures.
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={weeklyDigest}
                      onChange={(e) => setWeeklyDigest(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }} 
                    />
                  </div>

                  {/* Toggle 3 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '16px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block' }}>Critical Threat Alerts</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px', display: 'inline-block' }}>
                        Receive real-time push alerts whenever an employee reports a High Risk threat email.
                      </span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={threatAlerts}
                      onChange={(e) => setThreatAlerts(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }} 
                    />
                  </div>

                </div>
              </div>
            )}

            {/* TABS 3: SECURITY POLICIES */}
            {activeTab === 'security' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>System Security Mandates</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>Configure access constraints, multi-factor triggers, and authentication levels.</p>

                <div className="form-group">
                  <label className="form-label">Password Complexity Rule</label>
                  <select
                    className="form-control"
                    value={passwordPolicy}
                    onChange={(e) => setPasswordPolicy(e.target.value)}
                  >
                    <option value="standard">Standard (Min 6 chars)</option>
                    <option value="strong">Strong (Min 8 chars, 1 uppercase, 1 symbol)</option>
                    <option value="strict">Strict Enterprise (Min 12 chars, alphanumeric, regular resets)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ flex: 1, paddingRight: '16px' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-main)', display: 'block', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={16} style={{ color: 'var(--color-primary)' }} />
                      Enforce Administrator Two-Factor Auth (2FA)
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px', display: 'inline-block' }}>
                      Require an authenticator app code (MFA) upon every sign-in request to the Admin console.
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '4px' }} 
                  />
                </div>
              </div>
            )}

            {/* TABS 4: ADMIN PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Administrator Account</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>Update personal credentials and communication details.</p>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* TABS 5: MICROSOFT AUTHENTICATION */}
            {activeTab === 'ms-auth' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>Microsoft SSO Configuration</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>Configure Microsoft Entra ID (Azure AD) single sign-on parameters for your tenant.</p>

                {testResult && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '13px',
                    color: 'var(--color-success)',
                    marginBottom: '20px',
                    fontWeight: '500'
                  }}>
                    <CheckCircle size={16} />
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tenant ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="e.g. common, or your-tenant-uuid"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client ID (Application ID)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter your Azure Client ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Redirect URI</label>
                  <input
                    type="text"
                    className="form-control"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Allowed Domains (Comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={allowedDomains}
                    onChange={(e) => setAllowedDomains(e.target.value)}
                    placeholder="e.g. company.com, partner.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Login Mode</label>
                  <select
                    className="form-control"
                    value={loginMode}
                    onChange={(e) => setLoginMode(e.target.value)}
                  >
                    <option value="sso">Microsoft SSO Only</option>
                    <option value="fallback">SSO with Email Fallback</option>
                  </select>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '20px',
                  marginTop: '28px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px'
                }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestMicrosoftLogin}
                    disabled={loading || testing}
                  >
                    {testing ? 'Testing...' : 'Test Microsoft Login'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || testing}
                  >
                    Save Microsoft Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab !== 'ms-auth' && (
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px',
                marginTop: '28px',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading}
                  loading={loading}
                >
                  Save Settings
                </Button>
              </div>
            )}

          </form>
        </div>

      </div>

      {/* Save Success Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Changes saved successfully!</span>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .responsive-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .settings-tab-hover:hover {
          background-color: var(--bg-sidebar) !important;
          color: var(--text-main) !important;
        }
      `}</style>

    </div>
  );
};

export default AdminSettings;
