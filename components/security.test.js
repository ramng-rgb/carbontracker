import { encryptPayload, decryptPayload, generateHash } from './security.js';

describe('Cryptographic Security Helpers', () => {
  const mockPayload = {
    userName: 'Eco Guardian',
    streak: 3,
    committedPledges: ['pledge_led']
  };

  test('encryptPayload should return a non-empty base64 encrypted string', () => {
    const encrypted = encryptPayload(mockPayload);
    expect(typeof encrypted).toBe('string');
    expect(encrypted.length).toBeGreaterThan(0);
    // Base64 regex check
    expect(encrypted).toMatch(/^[a-zA-Z0-9+/]*={0,2}$/);
  });

  test('decryptPayload should decrypt the encrypted payload back to original object', () => {
    const encrypted = encryptPayload(mockPayload);
    const decrypted = decryptPayload(encrypted);
    expect(decrypted).toEqual(mockPayload);
  });

  test('decryptPayload should return null or log error on invalid input', () => {
    const invalidDecrypted = decryptPayload('invalid-base64-string!!!');
    expect(invalidDecrypted).toBeNull();
  });

  test('generateHash should return a formatted cryptographic signature', () => {
    const dataString = 'TS-123456-AMAZON-10.0-Eco Guardian-June 18, 2026';
    const hash = generateHash(dataString);
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('SIG-')).toBe(true);
    
    // Check segments: SIG-[segment1]-[segment2]-[hex]
    const segments = hash.split('-');
    expect(segments.length).toBe(4);
    expect(segments[0]).toBe('SIG');
  });

  test('generateHash should produce consistent signature for identical string inputs', () => {
    const dataString = 'TS-123456-AMAZON-10.0-Eco Guardian-June 18, 2026';
    const hash1 = generateHash(dataString);
    const hash2 = generateHash(dataString);
    expect(hash1).toBe(hash2);
  });
});
