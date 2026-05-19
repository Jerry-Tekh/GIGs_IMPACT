-- Multi-Factor Authentication (MFA/TOTP) Support
-- Adds TOTP-based MFA columns to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS mfa_temp_secret_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS mfa_backup_codes_hashed JSONB,
  ADD COLUMN IF NOT EXISTS mfa_setup_started_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS mfa_enabled_at TIMESTAMP;

-- Create table for tracking MFA events and temporary login sessions
CREATE TABLE IF NOT EXISTS mfa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT mfa_session_expiry CHECK (expires_at > created_at)
);

-- Create table for tracking MFA backup code usage
CREATE TABLE IF NOT EXISTS mfa_backup_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_index INTEGER NOT NULL,
  used_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  CONSTRAINT unique_backup_code_use UNIQUE (user_id, code_index)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_user_id ON mfa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_token ON mfa_sessions(session_token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mfa_sessions_expires ON mfa_sessions(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mfa_backup_usage_user ON mfa_backup_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled) WHERE mfa_enabled = true;

-- Create table for MFA audit logs (optional, but recommended for compliance)
CREATE TABLE IF NOT EXISTS mfa_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20),
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfa_events_user ON mfa_events(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_events_type ON mfa_events(event_type);
CREATE INDEX IF NOT EXISTS idx_mfa_events_created ON mfa_events(created_at);
