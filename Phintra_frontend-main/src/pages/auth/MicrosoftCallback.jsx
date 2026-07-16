import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';

// Prevent React Strict Mode double-mount calling the token exchange twice
let hasExchangedCodeGlobal = false;

const MicrosoftCallback = () => {
  const { microsoftLogin } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('initializing'); // initializing, exchanging, syncing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [portalType, setPortalType] = useState('employee');

  // Multi-request prevention flag
  const hasProcessedCallback = useRef(false);

  useEffect(() => {
    const completeSSO = async () => {
      // 1. Double request check guard using both Ref and Global Module-level variables
      if (hasProcessedCallback.current || hasExchangedCodeGlobal) {
        return;
      }
      hasProcessedCallback.current = true;
      hasExchangedCodeGlobal = true;

      // 2. Parse query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      // Clear code/params from URL address bar immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      if (error || errorDescription) {
        setStatus('error');
        setErrorMessage(errorDescription || error || 'Microsoft authentication failed.');
        hasExchangedCodeGlobal = false; // Reset on failure to allow retry
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('Authorization code is missing from Microsoft response.');
        hasExchangedCodeGlobal = false; // Reset on failure
        return;
      }

      // 3. Retrieve verifier, state and portalType from sessionStorage
      const verifier = sessionStorage.getItem('pkce_code_verifier');
      const savedState = sessionStorage.getItem('pkce_state');
      const portalTypeVal = sessionStorage.getItem('sso_portal_type') || 
        (window.location.hash.includes('admin') || window.location.search.includes('admin') ? 'admin' : 'employee');
      
      setPortalType(portalTypeVal);

      if (!verifier) {
        setStatus('error');
        setErrorMessage('Authentication session expired or code verifier missing. Please try signing in again.');
        hasExchangedCodeGlobal = false; // Reset on failure
        return;
      }

      if (savedState && state !== savedState) {
        setStatus('error');
        setErrorMessage('State verification failed (CSRF check). Request may have been intercepted.');
        return;
      }

      try {
        setStatus('exchanging');
        
        // 3. Fetch Microsoft Config dynamically from our backend to get client_id and tenant_id
        const configResponse = await api.get('/auth/microsoft-config');
        const { client_id, tenant_id, redirect_uri } = configResponse.data;

        if (!client_id || !tenant_id) {
          throw new Error('Microsoft authentication parameters are not configured on the backend.');
        }

        // 4. Exchange authorization code for tokens directly via Microsoft Token endpoint
        const tokenUrl = `https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/token`;
        const tokenParams = new URLSearchParams({
          client_id: client_id,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri || 'http://localhost:5173/auth/microsoft/callback',
          code_verifier: verifier,
          scope: 'openid profile email User.Read'
        });

        const tokenResponse = await axios.post(tokenUrl, tokenParams, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const { access_token, id_token } = tokenResponse.data;

        if (!access_token || !id_token) {
          throw new Error('Did not receive both access and ID tokens from Microsoft.');
        }

        // Exchange was successful, clean up PKCE verifiers to prevent replay attacks
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('pkce_state');
        sessionStorage.removeItem('sso_portal_type');

        setStatus('syncing');

        // 6. Complete profile check & login in AuthContext
        const loginResult = await microsoftLogin(access_token, id_token, portalTypeVal);

        if (loginResult.success) {
          setStatus('success');
          // Navigate to correct dashboard safely using replace: true immediately
          navigate(loginResult.redirect_path, { replace: true });
        } else {
          setStatus('error');
          setErrorMessage(loginResult.message || 'Verification failed. Your account may not be registered.');
          hasExchangedCodeGlobal = false;
        }
      } catch (err) {
        console.error('SSO Exchange error details:', err);
        setStatus('error');
        const errDetail = err.response?.data?.detail || err.message || 'An error occurred during Microsoft sign-in.';
        setErrorMessage(errDetail);
        hasExchangedCodeGlobal = false;
      }
    };

    completeSSO();
  }, [navigate, microsoftLogin]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '24px',
      boxSizing: 'border-box',
      color: '#F8FAFC'
    }}>
      {/* Premium Glassmorphism Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '40px 32px',
        borderRadius: '24px',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeIn 0.5s ease both'
      }}>
        {/* Render Status Icons */}
        {status === 'initializing' && (
          <div className="icon-wrapper loading">
            <Loader2 size={48} className="spinner" color="#3B82F6" />
          </div>
        )}
        {status === 'exchanging' && (
          <div className="icon-wrapper loading">
            <Loader2 size={48} className="spinner" color="#60A5FA" />
          </div>
        )}
        {status === 'syncing' && (
          <div className="icon-wrapper loading">
            <Loader2 size={48} className="spinner" color="#10B981" />
          </div>
        )}
        {status === 'success' && (
          <div className="icon-wrapper success">
            <ShieldCheck size={48} color="#10B981" />
          </div>
        )}
        {status === 'error' && (
          <div className="icon-wrapper error">
            <ShieldAlert size={48} color="#EF4444" />
          </div>
        )}

        {/* Title */}
        <h2 style={{
          fontSize: '22px',
          fontWeight: '800',
          marginTop: '24px',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          {status === 'initializing' && 'Initializing SSO Exchange'}
          {status === 'exchanging' && 'Verifying Credentials'}
          {status === 'syncing' && 'Syncing Profile with Phintra'}
          {status === 'success' && 'Sign-in Complete'}
          {status === 'error' && 'Sign-in Failed'}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '14.5px',
          color: '#94A3B8',
          lineHeight: 1.6,
          margin: '0 0 24px',
          fontWeight: '500'
        }}>
          {status === 'initializing' && 'Reading response from Microsoft Identity Provider...'}
          {status === 'exchanging' && 'Exchanging authorization code for secure access tokens...'}
          {status === 'syncing' && 'Establishing secure login session with Phintra Security Hub...'}
          {status === 'success' && 'Authentication successful! Redirecting to your dashboard...'}
          {status === 'error' && errorMessage}
        </p>

        {/* Action Button for Error State */}
        {status === 'error' && (
          <button
            onClick={() => navigate('/user/login')}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              border: 'none',
              background: '#3B82F6',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#3B82F6';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Back to Login
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          alignItems: center;
          justify-content: center;
          background: rgba(30, 41, 59, 0.8);
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.05);
        }
        .icon-wrapper.loading {
          border: 1px dashed rgba(255, 255, 255, 0.15);
        }
        .icon-wrapper.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          animation: scalePulse 0.4s ease-out;
        }
        .icon-wrapper.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          animation: shake 0.4s ease-in-out;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scalePulse {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default MicrosoftCallback;
