/**
 * Generates a random code verifier (64 characters, alphanumeric + dash/period/underscore/tilde).
 * @returns {string} The code verifier.
 */
export function generateCodeVerifier() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    verifier += chars[array[i] % chars.length];
  }
  return verifier;
}

/**
 * Encodes an ArrayBuffer using Base64-URL encoding.
 * @param {ArrayBuffer} arrayBuffer 
 * @returns {string} The base64url-encoded string.
 */
function base64UrlEncode(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let string = '';
  for (let i = 0; i < uint8Array.length; i++) {
    string += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(string);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates a SHA-256 code challenge from a code verifier.
 * @param {string} verifier - The code verifier
 * @returns {Promise<string>} The code challenge.
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}
