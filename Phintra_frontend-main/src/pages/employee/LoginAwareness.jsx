import React, { useState } from 'react';
import { Eye, ShieldCheck, AlertOctagon, Key, Info, HelpCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import { useToast } from '../../hooks/useToast';

const LoginAwareness = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [spoofedUrl, setSpoofedUrl] = useState('https://login.microsoft365-security-update.com/oauth');
  const [showIntercept, setShowIntercept] = useState(false);
  const [pointsClaimed, setPointsClaimed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Intercept and educate
    setShowIntercept(true);
  };

  const handleClaimPoints = () => {
    setPointsClaimed(true);
    toast.success('Simulated Training Completed. You earned +30 XP.');
  };

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setShowIntercept(false);
    setPointsClaimed(false);
  };

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Simulated Login Intervention</h1>
          <p>Learn to detect deceptive URL configurations in mock credential harvesting forms.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Mock Browser & Login Portal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            border: '1px solid var(--border-hover)',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}>
            {/* Spoofed Browser Bar */}
            <div style={{
              backgroundColor: 'var(--bg-sidebar)',
              borderBottom: '1px solid var(--border-color)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              </div>
              <div style={{
                flex: 1,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflow: 'hidden'
              }}>
                <span style={{ color: 'var(--color-danger)' }}>🔒 Unverified:</span>
                <span style={{ color: 'var(--text-muted)' }}>{spoofedUrl}</span>
              </div>
            </div>

            {/* Login Frame Content */}
            <div style={{ padding: '40px 32px', maxWidth: '380px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img 
                  src="https://img.icons8.com/color/120/microsoft.png" 
                  alt="Microsoft Mock Logo" 
                  style={{ width: '40px', height: '40px', marginBottom: '16px' }}
                />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>Sign in to corporate portal</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>Microsoft 365 Cloud Directory</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email, phone, or Skype</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="someone@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  style={{
                    width: '100%',
                    height: '38px',
                    backgroundColor: '#0067b8',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    marginTop: '10px'
                  }}
                >
                  Sign In
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-light)' }}>
                <a href="#forgot" style={{ color: '#0067b8' }} onClick={(e) => e.preventDefault()}>Can't access your account?</a>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info/Intercept Console */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Instructions */}
          {!showIntercept && (
            <div className="saas-card">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                <HelpCircle size={20} color="var(--color-primary)" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Interactive Task Instructions</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Credential harvesting portals are crafted to look identical to real authentication portals. 
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '8px' }}>
                Try inputting mock email and password into the login form on the left, and observe the interception results.
              </p>
              <div style={{
                marginTop: '16px',
                borderLeft: '4px solid var(--color-danger)',
                padding: '10px 14px',
                backgroundColor: '#fff5f5',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#b91c1c'
              }}>
                <strong>Crucial check:</strong> Look at the address bar URL before submitting. Microsoft portals are hosted under verified domains, not lookalikes.
              </div>
            </div>
          )}

          {/* Warning Interception Display */}
          {showIntercept && (
            <div className="saas-card animate-fade-in" style={{ borderColor: 'var(--color-danger)', backgroundColor: '#fff5f5' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', color: 'var(--color-danger)' }}>
                <AlertOctagon size={24} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Interception Alert!</h3>
              </div>
              
              <div style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: '1.6' }}>
                <p style={{ fontWeight: '700' }}>This login portal was a simulation!</p>
                <p style={{ marginTop: '8px' }}>
                  If this had been a real cyber attack, entering your password here would have given hackers full access to your corporate email and identity.
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--color-danger-light)',
                  borderRadius: '6px',
                  padding: '12px',
                  marginTop: '16px',
                  color: 'var(--text-muted)'
                }}>
                  <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: '6px' }}>What went wrong?</strong>
                  <span style={{ fontSize: '12px' }}>
                    The URL bar shows: <code style={{ backgroundColor: 'var(--color-danger-light)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace', color: '#b91c1c' }}>microsoft365-security-update.com</code> instead of the legitimate <code style={{ backgroundColor: 'var(--bg-sidebar)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>microsoft.com</code> or <code style={{ backgroundColor: 'var(--bg-sidebar)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>office.com</code>.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flex: 1 }} 
                    onClick={handleReset}
                  >
                    Try Again
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ flex: 1, backgroundColor: 'var(--color-success)' }}
                    onClick={handleClaimPoints}
                    disabled={pointsClaimed}
                  >
                    {pointsClaimed ? 'XP Claimed' : 'Acknowledge (+30 XP)'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginAwareness;
