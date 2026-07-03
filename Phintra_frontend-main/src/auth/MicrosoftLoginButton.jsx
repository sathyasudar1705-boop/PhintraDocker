import React, { useState } from 'react';
import api from '../services/api';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';

export const MicrosoftLoginButton = ({ onError }) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    if (onError) onError('');

    try {
      // 1. Fetch Microsoft OAuth configuration from backend
      const response = await api.get('/auth/microsoft-config');
      const { client_id, tenant_id, redirect_uri, authorization_endpoint } = response.data;

      if (!client_id || !tenant_id) {
        throw new Error('Microsoft login parameters are not configured on the server.');
      }

      // 2. Generate PKCE params
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 3. Store params and portal context in sessionStorage
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      
      const portalType = window.location.pathname.includes('/admin') ? 'admin' : 'employee';
      sessionStorage.setItem('sso_portal_type', portalType);

      // Generate random state
      const randomState = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('pkce_state', randomState);

      // 4. Construct Microsoft Authorization URL
      const queryParams = new URLSearchParams({
        client_id: client_id,
        response_type: 'code',
        redirect_uri: redirect_uri || 'http://localhost:5173/auth/microsoft/callback',
        response_mode: 'query',
        scope: 'openid profile email User.Read',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: randomState
      });

      const authUrl = `${authorization_endpoint}?${queryParams.toString()}`;

      // 5. Redirect browser to Microsoft Online
      window.location.href = authUrl;
    } catch (err) {
      console.error('Microsoft login redirection failed:', err);
      setLoading(false);
      const errMsg = err.response?.data?.detail || err.message || 'Microsoft login failed. Please try again.';
      if (onError) onError(errMsg);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="auth-sso-btn"
      style={{
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        background: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        color: '#334155',
        fontSize: '14.5px',
        fontWeight: '700',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
        transition: 'all 0.2s',
        marginBottom: '24px',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg>
      {loading ? "Connecting to Microsoft..." : "Continue with Microsoft"}
    </button>
  );
};

export default MicrosoftLoginButton;
