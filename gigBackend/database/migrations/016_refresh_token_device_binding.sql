-- Bind refresh tokens to the original device/session context used at login.

ALTER TABLE refresh_tokens
  ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES device_fingerprints(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_device_id
  ON refresh_tokens(device_id);
