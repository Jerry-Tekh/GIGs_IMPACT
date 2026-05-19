-- Standardize password resets on tokenized email links
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Clear legacy code-based reset state after moving to token links
UPDATE users
SET reset_code = NULL,
    reset_code_hash = NULL,
    reset_code_expires = NULL,
    reset_code_attempts = 0
WHERE reset_code IS NOT NULL
   OR reset_code_hash IS NOT NULL
   OR reset_code_expires IS NOT NULL
   OR COALESCE(reset_code_attempts, 0) <> 0;

CREATE INDEX IF NOT EXISTS idx_users_reset_token
ON users(reset_token)
WHERE reset_token IS NOT NULL;