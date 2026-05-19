-- Harden auth state for password resets and server-side session invalidation
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_code_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_code_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS login_failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_locked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;

-- Clear legacy plaintext reset codes once hashed storage is available
UPDATE users
SET reset_code = NULL
WHERE reset_code IS NOT NULL;

-- Ensure refresh token hashes stay unique globally
CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash_unique
ON refresh_tokens(token_hash);
