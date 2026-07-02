import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';
import { useAppContext } from '../context/AppContext';

export const MicrosoftLoginButton = ({ onError }) => {
  const { instance, inProgress } = useMsal();
  const { microsoftLogin } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (inProgress !== "none" || loading) return;
    setLoading(true);
    if (onError) onError('');

    try {
      // Clear any stuck MSAL states from session/local storage
      const storageKeys = [...Object.keys(sessionStorage), ...Object.keys(localStorage)];
      storageKeys.forEach(key => {
        if (key.startsWith('msal.')) {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        }
      });

      // Save configurations for the static popup redirect page to read
      localStorage.setItem('sso_client_id', import.meta.env.VITE_MICROSOFT_CLIENT_ID);
      localStorage.setItem('sso_tenant_id', import.meta.env.VITE_MICROSOFT_TENANT_ID);

      const portalType = window.location.pathname.includes('/admin') ? 'admin' : 'employee';
      localStorage.setItem('sso_portal_type', portalType);

      console.log("Microsoft popup started");

      // Open MSAL authentication popup and await the result
      const result = await instance.loginPopup({
        ...loginRequest,
        redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || "http://localhost:5173/msal-popup.html"
      });
      
      console.log("Microsoft popup result", result);

      const account = result?.account;
      if (!account) {
        throw new Error("No account returned from Microsoft sign-in.");
      }

      instance.setActiveAccount(account);

      const microsoftEmail = account.username || result.idTokenClaims?.email || result.idTokenClaims?.preferred_username;
      if (!microsoftEmail) {
        throw new Error("Could not extract email address from your Microsoft profile.");
      }

      console.log("Microsoft email", microsoftEmail);

      // Call backend validation via context
      const loginResult = await microsoftLogin(microsoftEmail, result.idToken, portalType);

      console.log("Backend login response", loginResult);

      // Clean up temporary local storage items
      localStorage.removeItem('sso_client_id');
      localStorage.removeItem('sso_tenant_id');
      localStorage.removeItem('sso_portal_type');

      if (loginResult.success && loginResult.redirect_path) {
        let targetPath = loginResult.redirect_path;
        if (portalType === 'employee' || targetPath === '/employee/dashboard' || targetPath === '/user/dashboard') {
          targetPath = '/user/dashboard';
        }
        window.location.href = targetPath;
      } else {
        throw new Error(loginResult.message || 'Verification failed');
      }
    } catch (err) {
      console.error("Microsoft login error details:", err);
      setLoading(false);
      localStorage.removeItem('sso_client_id');
      localStorage.removeItem('sso_tenant_id');
      localStorage.removeItem('sso_portal_type');

      // Specific cancellation messages based on MSAL error codes/messages
      const isCancelled = 
        err.name === 'BrowserAuthError' && 
        (err.errorCode === 'user_cancelled' || err.message?.includes('user_cancelled'));

      if (isCancelled) {
        if (onError) onError('Microsoft login was cancelled.');
      } else {
        const errorMsg = err.response?.data?.detail || err.message || 'Microsoft login failed. Please try again.';
        if (onError) onError(errorMsg);
      }
    }
  };

  const isInteracting = inProgress !== "none" || loading;

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isInteracting}
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
        cursor: isInteracting ? 'not-allowed' : 'pointer',
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
      {isInteracting ? "Connecting to Microsoft..." : "Continue with Microsoft"}
    </button>
  );
};

export default MicrosoftLoginButton;
