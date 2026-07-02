import api from './api';

/**
 * Sends the verified Microsoft email and token to the Phintra backend.
 * @param {string} email - Microsoft account email
 * @param {string} token - Microsoft access token
 * @returns {Promise<Object>} Backend login response containing Phintra JWT, role, and redirect_path
 */
export const loginWithMicrosoft = async (email, token) => {
  const response = await api.post('/auth/microsoft/login', { email, token });
  return response.data;
};
