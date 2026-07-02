import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import {
  ShieldCheck, AlertCircle, Eye, EyeOff,
  Building2, User, Mail, Lock, Briefcase, Users, ChevronDown,
} from 'lucide-react';
import adminIllustration from '../../assets/admin_illustration.jpg';
import authIllustrationNew from '../../assets/auth_illustration_new.jpg';
import phintraLogo from '../../assets/phintra_logo.png';

const Register = () => {
  const { register } = useAppContext();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !companyName || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid company email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await register(name, email, companyName, password, companySize, industry);
      setLoading(false);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/admin/login'), 2500);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.detail || 'A network connection error occurred.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    background: '#F8FAFC',
    color: '#0F172A',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    fontFamily: "inherit",
  };

  const labelStyle = {
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#475569',
    display: 'block',
    marginBottom: '8px',
    letterSpacing: '0.02em',
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: '#94A3B8',
  };

  return (
    <div className="auth-container" style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100%',
      fontFamily: "'Inter', 'Outfit', -apple-system, sans-serif",
      background: '#FFFFFF',
    }}>
      {/* ── LEFT PANEL (Half Screen) ── */}
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
            Set Up Your Security<br />Awareness Workspace
          </h2>
          <p style={{ fontSize: '16.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 32px', fontWeight: '500', maxWidth: '440px' }}>
            Create your organization's account and start protecting employees from phishing attacks in minutes.
          </p>

          {/* Feature bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' }}>
            {[
              ['🎯', 'Phishing simulations on autopilot'],
              ['📊', 'Real-time security risk analytics'],
              ['🏆', 'Gamified employee training modules'],
            ].map(([icon, text]) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'rgba(15, 23, 42, 0.04)', borderRadius: '12px',
                padding: '12px 18px', border: '1px solid rgba(15, 23, 42, 0.1)',
                backdropFilter: 'blur(12px)',
                textAlign: 'left'
              }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form (Half Screen) ── */}
      <div className="auth-right-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '48px',
        overflowY: 'auto',
      }}>
        {/* Form Container */}
        <div style={{ width: '100%', maxWidth: '460px' }}>

          {success ? (
            /* ── Success State ── */
            <div style={{ textAlign: 'center', animation: 'slideUp 0.4s ease both' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: '#ECFDF5',
                border: '2px solid #A7F3D0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 24px rgba(16,185,129,0.15)',
              }}>
                <ShieldCheck size={40} color="#10B981" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.02em' }}>Workspace Created!</h2>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginBottom: '32px' }}>
                Your admin account and workspace are ready.<br />Redirecting to login…
              </p>
              <Link to="/admin/login" className="auth-submit-btn" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px 32px', borderRadius: '12px',
                background: '#3B82F6', color: '#FFFFFF',
                fontSize: '15px', fontWeight: '800', textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(59,130,246,0.25)', transition: 'all 0.2s'
              }}>
                Sign In Now →
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#3B82F6', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>NEW WORKSPACE</p>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Create Your Account</h1>
                <p style={{ fontSize: '14.5px', color: '#64748B', margin: 0, fontWeight: '500' }}>Set up cybersecurity awareness training for your organization.</p>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  background: '#FEF2F2', border: '1px solid #FCA5A5',
                  borderRadius: '12px', padding: '12px 16px',
                  fontSize: '13.5px', color: '#EF4444', marginBottom: '24px', fontWeight: '600',
                  animation: 'slideUp 0.25s ease both',
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Row 1: Name + Email */}
                <div className="reg-grid">
                  {/* Full Name */}
                  <div>
                    <label style={labelStyle}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={iconStyle} />
                      <input
                        type="text" placeholder="John Doe"
                        value={name} onChange={e => setName(e.target.value)}
                        disabled={loading} required
                        className="auth-input" style={inputStyle}
                      />
                    </div>
                  </div>
                  {/* Work Email */}
                  <div>
                    <label style={labelStyle}>Work Email <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={iconStyle} />
                      <input
                        type="email" placeholder="you@company.com"
                        value={email} onChange={e => setEmail(e.target.value)}
                        disabled={loading} required
                        className="auth-input" style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label style={labelStyle}>Company Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={iconStyle} />
                    <input
                      type="text" placeholder="Acme Corp"
                      value={companyName} onChange={e => setCompanyName(e.target.value)}
                      disabled={loading} required
                      className="auth-input" style={inputStyle}
                    />
                  </div>
                </div>

                {/* Row 2: Company Size + Industry */}
                <div className="reg-grid">
                  {/* Company Size */}
                  <div>
                    <label style={labelStyle}>Company Size</label>
                    <div style={{ position: 'relative' }}>
                      <Users size={18} style={iconStyle} />
                      <select
                        value={companySize} onChange={e => setCompanySize(e.target.value)}
                        disabled={loading}
                        className="auth-input"
                        style={{
                          ...inputStyle,
                          padding: '12px 36px 12px 42px',
                          appearance: 'none',
                          color: companySize ? '#0F172A' : '#94A3B8',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="" style={{ color: '#64748B' }}>Select size</option>
                        <option value="1-50" style={{ color: '#0F172A' }}>1–50 employees</option>
                        <option value="51-200" style={{ color: '#0F172A' }}>51–200 employees</option>
                        <option value="201-1000" style={{ color: '#0F172A' }}>201–1000 employees</option>
                        <option value="1000+" style={{ color: '#0F172A' }}>1000+ employees</option>
                      </select>
                      <ChevronDown size={16} color="#94A3B8" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  {/* Industry */}
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={18} style={iconStyle} />
                      <input
                        type="text" placeholder="e.g. Finance"
                        value={industry} onChange={e => setIndustry(e.target.value)}
                        disabled={loading}
                        className="auth-input" style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Password + Confirm */}
                <div className="reg-grid">
                  {/* Password */}
                  <div>
                    <label style={labelStyle}>Password <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={iconStyle} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 6 chars"
                        value={password} onChange={e => setPassword(e.target.value)}
                        disabled={loading} required
                        className="auth-input"
                        style={{ ...inputStyle, paddingRight: '40px' }}
                      />
                      <button type="button" onClick={() => setShowPassword(p => !p)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <label style={labelStyle}>Confirm Password <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={iconStyle} />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter"
                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        disabled={loading} required
                        className="auth-input"
                        style={{ ...inputStyle, paddingRight: '40px' }}
                      />
                      <button type="button" onClick={() => setShowConfirm(p => !p)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="auth-submit-btn"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', marginTop: '12px',
                    background: loading ? '#93C5FD' : '#3B82F6',
                    border: 'none', color: '#FFFFFF', fontSize: '15px', fontWeight: '800',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                    transition: 'all 0.2s', letterSpacing: '0.02em',
                  }}
                >
                  {loading ? 'Creating workspace…' : 'Create Workspace →'}
                </button>
              </form>

              {/* Footer link */}
              <div style={{ marginTop: '28px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>Already have an account? </span>
                <Link to="/admin/login" className="auth-link" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: '800', textDecoration: 'none' }}>
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

          .reg-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

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

          .auth-submit-btn:active:not(:disabled) {
            transform: translateY(0);
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

          /* ── Tablet ── */
          @media (max-width: 1100px) {
            .auth-container { flex-direction: column !important; }
            .auth-left-panel { flex: none !important; height: 380px !important; padding: 40px !important; }
            .auth-right-panel { padding: 48px 32px !important; }
          }

          /* ── Mobile ── */
          @media (max-width: 600px) {
            .reg-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
          }
        `}</style>
        </div>
      </div>
  );
};

export default Register;
