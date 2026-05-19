-- Add email verification columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_token TEXT,
  ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

-- Create index for efficient verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token 
ON users(verification_token) 
WHERE verification_token IS NOT NULL;

-- Create index for finding unverified users
CREATE INDEX IF NOT EXISTS idx_users_verified 
ON users(verified) 
WHERE verified = false;
