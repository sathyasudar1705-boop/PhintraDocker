import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  Eye, EyeOff, ShieldAlert, ShieldCheck, Lock, Mail, Users,
} from 'lucide-react';
import adminIllustration from '../../assets/admin_illustration.jpg';
import authIllustrationNew from '../../assets/auth_illustration_new.jpg';
import phintraLogo from '../../assets/phintra_logo.png';
import { MicrosoftLoginButton } from '../../auth/MicrosoftLoginButton';

const Login = () => {
  const { login, microsoftLogin, isAuthenticated, userRole } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setGeneralError(errorParam);
      // Clean up URL to look neat
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const hasAdminAuth = localStorage.getItem('adminAuth') === 'true';
    const adminRole = localStorage.getItem('adminRole');

    if (hasAdminAuth) {
      if (adminRole === 'Security Administrator') navigate('/admin/dashboard');
      else if (adminRole === 'Security Manager') navigate('/admin/manager-dashboard');
    }
  }, [navigate]);

  const handleDemoSelect = (role) => {
    if (role === 'admin') { setEmail('admin@phintra.com'); setPassword('admin123'); }
    else if (role === 'manager') { setEmail('manager@phintra.com'); setPassword('manager123'); }
    else if (role === 'employee') { setEmail('employee@phintra.com'); setPassword('employee123'); }
    setEmailError(''); setPasswordError(''); setGeneralError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setEmailError(''); setPasswordError(''); setGeneralError('');
    let hasError = false;
    if (!email.trim()) { setEmailError('Email address is required'); hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Please enter a valid email address'); hasError = true; }
    if (!password) { setPasswordError('Password is required'); hasError = true; }
    if (hasError) return;
    setLoading(true);
    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (res.role === 'Security Administrator') navigate('/admin/dashboard');
        else if (res.role === 'Security Manager') navigate('/admin/manager-dashboard');
        else navigate('/user/dashboard');
      } else {
        setGeneralError(res.message || 'Incorrect email or password');
      }
    } catch (err) {
      setLoading(false);
      setGeneralError('A connection error occurred. Please check that the server is online.');
    }
  };



  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '13px 14px 13px 44px',
    border: `1.5px solid ${hasError ? '#EF4444' : '#E2E8F0'}`,
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    background: hasError ? '#FEF2F2' : '#F8FAFC',
    color: '#0F172A',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  });

  return (
    <div className="auth-container" style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      fontFamily: "'Inter', 'Outfit', -apple-system, sans-serif",
      background: '#FFFFFF',
    }}>
      {/* ── LEFT: Branding/Illustration (Half Screen) ── */}
      <div className="auth-left-panel" style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '56px 64px',
        backgroundColor: '#F8FAFC',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', position: 'relative', zIndex: 10, marginBottom: '40px' }}>
          <img src={phintraLogo} alt="Phintra Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>Phintra</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Security Hub</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Cyber Awareness,<br />Powered by AI
          </h2>
          <p style={{ fontSize: '16.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 40px', fontWeight: '500', maxWidth: '440px' }}>
            Run phishing simulations, train employees, and strengthen your organization's security posture effortlessly.
          </p>
          
          <Link to="/user/login" className="auth-side-link" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '13px 24px', borderRadius: '99px',
            background: 'rgba(15, 23, 42, 0.04)', border: '1px solid rgba(15, 23, 42, 0.1)',
            fontSize: '14px', fontWeight: '700', color: '#0F172A',
            textDecoration: 'none', backdropFilter: 'blur(12px)',
            transition: 'all 0.2s ease', zIndex: 10
          }}>
            <Users size={18} color="#3B82F6" />
            Employee Login
          </Link>
        </div>
      </div>

      {/* ── RIGHT: Login Form (Half Screen) ── */}
      <div className="auth-right-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '64px 48px',
        overflowY: 'auto',
      }}>
        {/* Form Container */}
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>ADMIN PORTAL</p>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Welcome Back</h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, fontWeight: '500' }}>Sign in to your admin account to continue.</p>
          </div>

          {/* General Error */}
          {generalError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: '#FEF2F2', border: '1px solid #FCA5A5',
              borderRadius: '12px', padding: '12px 16px',
              fontSize: '13.5px', color: '#EF4444', marginBottom: '24px', fontWeight: '600',
              animation: 'slideUp 0.25s ease both',
            }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              {generalError}
            </div>
          )}

          <MicrosoftLoginButton onError={setGeneralError} />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: '700', letterSpacing: '0.06em' }}>OR USE EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px', letterSpacing: '0.02em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  disabled={loading}
                  style={inputStyle(emailError)}
                  className="auth-input"
                />
              </div>
              {emailError && <p style={{ fontSize: '12px', color: '#EF4444', margin: '6px 0 0', fontWeight: '600' }}>{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#475569', letterSpacing: '0.02em' }}>
                  Password
                </label>
                <Link to="/forgot-password" className="auth-link" style={{ fontSize: '12.5px', color: '#3B82F6', fontWeight: '700', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(''); }}
                  disabled={loading}
                  style={{ ...inputStyle(passwordError), paddingRight: '44px' }}
                  className="auth-input"
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p style={{ fontSize: '12px', color: '#EF4444', margin: '6px 0 0', fontWeight: '600' }}>{passwordError}</p>}
            </div>

            {/* Remember me */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#3B82F6', cursor: 'pointer', borderRadius: '4px' }} />
              <span style={{ fontSize: '13.5px', color: '#475569', fontWeight: '600' }}>Remember me for 30 days</span>
            </label>

            {/* Sign In button */}
            <button type="submit" disabled={loading}
              className="auth-submit-btn"
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: loading ? '#93C5FD' : '#3B82F6',
                border: 'none', color: '#FFFFFF', fontSize: '15px', fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                transition: 'all 0.2s', letterSpacing: '0.02em', marginTop: '4px'
              }}
            >
              {loading ? 'Signing in…' : 'Sign In to Admin Portal'}
            </button>
          </form>

          {/* Quick demo */}
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textAlign: 'center', marginBottom: '12px', letterSpacing: '0.06em' }}>QUICK DEMO ACCESS</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[['admin', 'Admin', '#3B82F6'], ['manager', 'Manager', '#8B5CF6'], ['employee', 'Employee', '#10B981']].map(([r, l, c]) => (
                <button key={r} type="button" onClick={() => handleDemoSelect(r)}
                  className="auth-demo-pill"
                  style={{
                    flex: 1, padding: '10px 8px', borderRadius: '10px',
                    border: `1.5px solid ${c}30`, background: `${c}10`,
                    color: c, fontSize: '13px', fontWeight: '700',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Register link */}
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <span style={{ fontSize: '14.5px', color: '#64748B', fontWeight: '500' }}>New to Phintra? </span>
            <Link to="/register" className="auth-link" style={{ fontSize: '14.5px', fontWeight: '800', color: '#3B82F6', textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          .auth-input:focus {
            border-color: #3B82F6 !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
            background: #FFFFFF !important;
          }

          .auth-submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            background: #2563EB !important;
            box-shadow: 0 8px 24px rgba(37,99,235,0.3) !important;
          }

          .auth-submit-btn:active:not(:disabled) { transform: translateY(0); }

          .auth-sso-btn:hover:not(:disabled) {
            background: #F8FAFC !important;
            border-color: #CBD5E1 !important;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05) !important;
          }

          .auth-side-link:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
          }

          .auth-demo-pill:hover {
            filter: brightness(0.9);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          
          .auth-link:hover {
            text-decoration: underline !important;
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .auth-right-panel {
            animation: slideUp 0.4s ease both;
          }

          /* Tablet */
          @media (max-width: 1100px) {
            .auth-container { flex-direction: column !important; }
            .auth-left-panel { flex: none !important; height: 340px !important; padding: 40px !important; }
            .auth-right-panel { padding: 48px 32px !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Login;
