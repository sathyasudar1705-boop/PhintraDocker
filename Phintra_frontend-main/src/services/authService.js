import api from './api';

/**
 * Fetches the Microsoft OAuth configuration from the backend.
 * @returns {Promise<Object>} client_id, tenant_id, redirect_uri, authorization_endpoint
 */
export const getMicrosoftConfig = async () => {
  const response = await api.get('/auth/microsoft-config');
  return response.data;
};

/**
 * Sends the Microsoft tokens to Phintra backend to retrieve the session JWT.
 * @param {string} accessToken - Microsoft access token
 * @param {string} idToken - Microsoft ID token
 * @param {string} portalType - admin or employee
 * @returns {Promise<Object>} Phintra JWT, role, redirect_path and user/employee profile
 */
export const loginWithMicrosoft = async (accessToken, idToken, portalType) => {
  const response = await api.post('/auth/microsoft-login', {
    access_token: accessToken,
    id_token: idToken,
    portal_type: portalType
  });
  return response.data;
};

