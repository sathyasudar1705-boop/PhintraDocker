import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import api from '../../services/api';
import {
  Eye, EyeOff, ShieldAlert, ShieldCheck, Lock, Mail, ShieldHalf,
} from 'lucide-react';
import loginIllustration from '../../assets/login_illustration.png';
import phintraLogo from '../../assets/phintra_logo.png';
import { MicrosoftLoginButton } from '../../auth/MicrosoftLoginButton';

const EmployeeLogin = () => {
  const { employeeLogin, microsoftLogin, isAuthenticated, userRole } = useAppContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Gmail Add-on SSO Token Login Interceptor
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('addon_token') || params.get('token');
    if (token) {
      const exchangeToken = async () => {
        setLoading(true); setGeneralError('');
        try {
          const response = await api.post('/auth/addon/validate-token', { token });
          const { access_token, employee } = response.data;
          localStorage.setItem('employeeToken', access_token);
          localStorage.setItem('employeeAuth', 'true');
          localStorage.setItem('employeeRole', 'Employee');
          localStorage.setItem('employeeUser', JSON.stringify({
            employee_id: employee.employee_id || employee.id,
            name: employee.name, email: employee.email,
            role: 'Employee', department: employee.department,
            streakDays: 4, securityScore: employee.personal_score || 80,
          }));
          window.location.href = '/user/dashboard';
        } catch (err) {
          setLoading(false);
          setGeneralError(err.response?.data?.detail || 'SSO authentication failed. The token may be expired or invalid.');
        }
      };
      exchangeToken();
    }
  }, [navigate]);

  // Redirect if already authenticated
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setGeneralError(errorParam);
      // Clean up URL to look neat
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const hasEmployeeAuth = localStorage.getItem('employeeAuth') === 'true';

    if (hasEmployeeAuth) {
      navigate('/user/dashboard');
    }
  }, [navigate]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(''); setPasswordError(''); setGeneralError('');
    let hasError = false;
    if (!email.trim()) { setEmailError('Email address is required'); hasError = true; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Please enter a valid email address'); hasError = true; }
    if (!password) { setPasswordError('Password is required'); hasError = true; }
    if (hasError) return;
    setLoading(true);
    try {
      const res = await employeeLogin(email, password);
      setLoading(false);
      if (res.success) navigate('/user/dashboard');
      else setGeneralError(res.message || 'Incorrect email or password');
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

  const handleDemoSelect = () => {
    setEmail('emily.chen@example.com');
    setPassword('EmployeePass123!');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Outfit', -apple-system, sans-serif",
      background: '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="auth-card" style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1100px',
        background: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '650px',
      }}>
        {/* ── LEFT: Branding/Illustration ── */}
        <div className="auth-left-panel" style={{
          flex: 1.1,
          background: 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)',
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          borderRight: '1px solid #E2E8F0',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(16,185,129,0.06)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(59,130,246,0.05)', filter: 'blur(50px)' }} />
          
          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', position: 'relative', zIndex: 10, marginBottom: '40px' }}>
            <img src={phintraLogo} alt="Phintra Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em' }}>Phintra</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Employee Portal</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#0F172A', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Learn. Level Up.<br />Stay Secure.
            </h2>
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: '0 0 40px', fontWeight: '500' }}>
              Complete training modules, earn XP, climb the leaderboard, and become your organization's security champion.
            </p>

            <Link to="/admin/login" className="auth-side-link" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '99px',
              background: '#FFFFFF', border: '1px solid #E2E8F0',
              fontSize: '13.5px', fontWeight: '700', color: '#334155',
              textDecoration: 'none', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
              transition: 'all 0.2s ease', zIndex: 10
            }}>
              <ShieldHalf size={16} color="#10B981" />
              Admin Login
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Login Form ── */}
        <div className="auth-right-panel" style={{
          flex: 1,
          padding: '64px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#FFFFFF',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#10B981', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>EMPLOYEE LOGIN</p>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Welcome Back</h1>
            <p style={{ fontSize: '14.5px', color: '#64748B', margin: 0, fontWeight: '500' }}>Sign in to continue your security training.</p>
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
                  placeholder="employee@company.com"
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
                <Link to="/forgot-password" className="auth-link" style={{ fontSize: '12.5px', color: '#10B981', fontWeight: '700', textDecoration: 'none' }}>
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
                style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer', borderRadius: '4px' }} />
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Remember me for 30 days</span>
            </label>

            {/* Sign In button */}
            <button type="submit" disabled={loading}
              className="auth-submit-btn"
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: loading ? '#6EE7B7' : '#10B981',
                border: 'none', color: '#FFFFFF', fontSize: '15px', fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.2s', letterSpacing: '0.02em', marginTop: '4px'
              }}
            >
              {loading ? 'Signing in…' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick demo */}
          <div style={{ marginTop: '28px' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textAlign: 'center', marginBottom: '12px', letterSpacing: '0.06em' }}>QUICK DEMO ACCESS</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={handleDemoSelect}
                className="auth-demo-pill"
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  border: `1.5px solid #10B98130`, background: `#10B98110`,
                  color: '#10B981', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                Auto-fill Employee Demo
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          .auth-input:focus {
            border-color: #10B981 !important;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
            background: #FFFFFF !important;
          }

          .auth-submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            background: #059669 !important;
            box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3) !important;
          }

          .auth-submit-btn:active:not(:disabled) { transform: translateY(0); }

          .auth-side-link:hover {
            background: #F8FAFC !important;
            color: #0F172A !important;
            border-color: #CBD5E1 !important;
            box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05) !important;
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

          .auth-illustration-container:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.1) !important;
            border-color: #CBD5E1 !important;
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
            .auth-card { flex-direction: column; max-width: 520px !important; }
            .auth-left-panel { flex: none !important; border-right: none !important; border-bottom: 1px solid #E2E8F0; padding: 40px !important; }
            .auth-right-panel { padding: 40px !important; }
            .auth-illustration-container { display: none; }
          }

          /* Mobile */
          @media (max-width: 600px) {
            .auth-card { border-radius: 0 !important; min-height: 100vh; box-shadow: none !important; }
            .auth-left-panel { padding: 32px 24px !important; }
            .auth-right-panel { padding: 32px 24px !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EmployeeLogin;
