import crypto from 'crypto';

/**
 * Encryption/Decryption utility for MFA secrets
 * Uses AES-256-GCM for authenticated encryption
 * 
 * Format stored in DB: `<iv>:<authTag>:<encryptedData>` (hex encoded)
 */

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SEPARATOR = ':';

// Get encryption key from environment
const getEncryptionKey = () => {
  const key = process.env.MFA_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'MFA_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  if (key.length !== 64) {
    throw new Error(
      'MFA_ENCRYPTION_KEY must be 64 hex characters (32 bytes). ' +
      'Generate one with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  return Buffer.from(key, 'hex');
};

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns format: `<iv>:<authTag>:<encryptedData>` (all hex encoded)
 * 
 * @param {string} plaintext - Text to encrypt
 * @returns {string} Encrypted data in format: iv:authTag:encrypted
 */
export const encryptMFASecret = (plaintext) => {
  try {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('Invalid plaintext');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encrypted (all hex)
    return `${iv.toString('hex')}${SEPARATOR}${authTag.toString('hex')}${SEPARATOR}${encrypted}`;
  } catch (error) {
    throw new Error(`MFA encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt ciphertext encrypted with encryptMFASecret
 * 
 * @param {string} ciphertext - Encrypted data in format: iv:authTag:encrypted
 * @returns {string} Decrypted plaintext
 */
export const decryptMFASecret = (ciphertext) => {
  try {
    if (!ciphertext || typeof ciphertext !== 'string') {
      throw new Error('Invalid ciphertext');
    }

    const parts = ciphertext.split(SEPARATOR);
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    if (iv.length !== IV_LENGTH) {
      throw new Error('Invalid IV length');
    }
    
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error('Invalid auth tag length');
    }

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`MFA decryption failed: ${error.message}`);
  }
};

/**
 * Hash a value using SHA-256
 * Used for hashing backup codes and verification tokens
 * 
 * @param {string} value - Value to hash
 * @returns {string} SHA-256 hash (hex)
 */
export const hashValue = (value) => {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
};

/**
 * Verify a value against its hash
 * Constant-time comparison to prevent timing attacks
 * 
 * @param {string} plaintext - Original value
 * @param {string} hash - Hash to compare against
 * @returns {boolean} True if match
 */
export const verifyHash = (plaintext, hash) => {
  const computed = hashValue(plaintext);
  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hash)
  );
};

/**
 * Generate a random token for temporary sessions
 * 
 * @returns {string} Random hex token (32 bytes)
 */
export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
