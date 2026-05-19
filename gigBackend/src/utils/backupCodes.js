import crypto from 'crypto';
import { hashValue } from './encryptionUtils.js';

/**
 * Backup codes utility
 * Generates, hashes, and validates backup codes for MFA
 * 
 * Format: XXXX-XXXX-XXXX (12 characters with hyphens)
 * Characters: uppercase letters + numbers (no ambiguous ones: O, I, L, 0, 1)
 */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No O, I, L, 0, 1
const CODE_LENGTH = 12; // XXXX-XXXX-XXXX
const NUM_CODES = 10;
const SEGMENT_LENGTH = 4;

/**
 * Generate random backup codes
 * Returns plaintext codes (only shown once to user)
 * 
 * @returns {Array<string>} Array of 10 backup codes
 */
export const generateBackupCodes = () => {
  const codes = [];
  
  for (let i = 0; i < NUM_CODES; i++) {
    let code = '';
    
    // Generate CODE_LENGTH characters
    for (let j = 0; j < CODE_LENGTH; j++) {
      const randomIndex = crypto.randomInt(0, ALPHABET.length);
      code += ALPHABET[randomIndex];
    }
    
    // Format as XXXX-XXXX-XXXX
    const formattedCode = [
      code.substring(0, SEGMENT_LENGTH),
      code.substring(SEGMENT_LENGTH, SEGMENT_LENGTH * 2),
      code.substring(SEGMENT_LENGTH * 2, SEGMENT_LENGTH * 3)
    ].join('-');
    
    codes.push(formattedCode);
  }
  
  return codes;
};

/**
 * Hash backup codes for storage
 * Each code is hashed individually so we can validate specific codes
 * 
 * @param {Array<string>} codes - Plaintext backup codes
 * @returns {Object} Object with code hashes and metadata
 * @example
 * {
 *   codes: [
 *     { hash: "sha256...", used: false, usedAt: null },
 *     ...
 *   ],
 *   generatedAt: "2024-05-06T10:30:00Z"
 * }
 */
export const hashBackupCodes = (codes) => {
  if (!Array.isArray(codes) || codes.length !== NUM_CODES) {
    throw new Error(`Must provide exactly ${NUM_CODES} backup codes`);
  }
  
  return {
    codes: codes.map((code) => ({
      hash: hashValue(normalizeCode(code)),
      used: false,
      usedAt: null,
      index: codes.indexOf(code)
    })),
    generatedAt: new Date().toISOString()
  };
};

/**
 * Normalize backup code (remove hyphens, uppercase)
 * 
 * @param {string} code - Backup code (may have hyphens)
 * @returns {string} Normalized code
 */
export const normalizeCode = (code) => {
  return code.replace(/-/g, '').toUpperCase();
};

/**
 * Validate and find a backup code in the hashed array
 * Returns the code index if found and unused, null otherwise
 * 
 * @param {string} code - Plaintext backup code to verify
 * @param {Object} backedUpCodesData - Hashed codes object (from hashBackupCodes)
 * @returns {number|null} Code index if valid and unused, null otherwise
 */
export const findValidBackupCode = (code, backedUpCodesData) => {
  if (!code || !backedUpCodesData) {
    return null;
  }
  
  const normalizedCode = normalizeCode(code);
  const codeHash = hashValue(normalizedCode);
  
  // Find matching, unused code
  const matchingCode = backedUpCodesData.codes.find(
    (entry) => entry.hash === codeHash && !entry.used
  );
  
  if (!matchingCode) {
    return null;
  }
  
  return matchingCode.index;
};

/**
 * Mark backup code as used
 * Updates the hashed codes object to mark code at index as used
 * 
 * @param {Object} backedUpCodesData - Hashed codes object
 * @param {number} codeIndex - Index of code to mark as used
 * @returns {Object} Updated codes data
 */
export const markBackupCodeAsUsed = (backedUpCodesData, codeIndex) => {
  if (!backedUpCodesData || codeIndex === null || codeIndex === undefined) {
    return backedUpCodesData;
  }
  
  return {
    ...backedUpCodesData,
    codes: backedUpCodesData.codes.map((entry) => 
      entry.index === codeIndex
        ? { ...entry, used: true, usedAt: new Date().toISOString() }
        : entry
    )
  };
};

/**
 * Get count of unused backup codes
 * 
 * @param {Object} backedUpCodesData - Hashed codes object
 * @returns {number} Count of unused codes
 */
export const getUnusedBackupCodeCount = (backedUpCodesData) => {
  if (!backedUpCodesData || !backedUpCodesData.codes) {
    return 0;
  }
  
  return backedUpCodesData.codes.filter((code) => !code.used).length;
};

/**
 * Validate backup codes format (for user input)
 * 
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid format
 */
export const isValidBackupCodeFormat = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const normalized = normalizeCode(code);
  
  // Should be exactly CODE_LENGTH characters
  if (normalized.length !== CODE_LENGTH) {
    return false;
  }
  
  // All characters should be in ALPHABET
  return normalized.split('').every((char) => ALPHABET.includes(char));
};
