import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{
          backgroundColor: 'var(--color-success-light)',
          color: 'var(--color-success)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={28} />
        </div>
        
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Reset Link Sent</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          Password reset instructions have been sent if the email exists in our system.
        </p>

        <Link to="/admin/login" className="btn btn-primary" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Recover Password</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>Enter your email and we'll send you a link to reset your password</p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--color-danger-light)',
          border: '1px solid var(--color-danger-light)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: 'var(--color-danger)',
          marginBottom: '16px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Work Email</label>
          <div style={{ position: 'relative' }}>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
              display: 'flex'
            }}>
              <Mail size={16} />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{ width: '100%', marginTop: '8px' }}
          disabled={loading}
          loading={loading}
        >
          Send Reset Link
        </Button>
      </form>

      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-light)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px'
      }}>
        Remember your credentials?{' '}
        <Link to="/admin/login" style={{ fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
