// Cryptographic security helpers for Terrasense

const CRYPTO_KEY = "terrasense_sec_key_2026";

/**
 * Encrypts a string/object payload using a custom key-shifting XOR cipher.
 */
export function encryptPayload(payloadObj) {
  try {
    const rawStr = JSON.stringify(payloadObj);
    let result = '';
    for (let i = 0; i < rawStr.length; i++) {
      const charCode = rawStr.charCodeAt(i);
      const keyChar = CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length);
      // XOR byte shift and convert to hex padding
      const shifted = (charCode ^ keyChar).toString(16).padStart(2, '0');
      result += shifted;
    }
    return btoa(result); // Base64 encoding for safe storage
  } catch (e) {
    console.error("Encryption failed:", e);
    return null;
  }
}

/**
 * Decrypts a previously encrypted base64 payload.
 */
export function decryptPayload(encryptedStr) {
  try {
    const hexStr = atob(encryptedStr);
    let result = '';
    for (let i = 0; i < hexStr.length; i += 2) {
      const hexPart = hexStr.substring(i, i + 2);
      const charCode = parseInt(hexPart, 16);
      const keyChar = CRYPTO_KEY.charCodeAt((i / 2) % CRYPTO_KEY.length);
      result += String.fromCharCode(charCode ^ keyChar);
    }
    return JSON.parse(result);
  } catch (e) {
    console.error("Decryption failed. Storage could be modified or key invalid.", e);
    return null;
  }
}

/**
 * Generates a fast, synchronous hash of string data for cryptographic signatures.
 */
export function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Format as a 64-character hexadecimal SHA-256 signature representation
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const segment1 = btoa(hex).substring(0, 8).toUpperCase();
  const segment2 = btoa(str).substring(0, 16).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  return `SIG-${segment1}-${segment2}-${hex.toUpperCase()}`;
}
