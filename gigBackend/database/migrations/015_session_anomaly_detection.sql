-- ============================================================================
-- SESSION ANOMALY DETECTION SYSTEM
-- Production-ready database schema for suspicious login detection
-- ============================================================================

-- 1. Add columns to users table for anomaly tracking
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
  ADD COLUMN IF NOT EXISTS last_login_country VARCHAR(2),
  ADD COLUMN IF NOT EXISTS suspicious_activity_flag BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_compromised_at TIMESTAMP;

-- 2. Device Fingerprints Table
-- Stores unique device signatures (fingerprints) per user
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id_hash TEXT NOT NULL,  -- SHA256 hash of device fingerprint
  device_name TEXT,              -- e.g., "Chrome on Windows 10"
  user_agent TEXT,
  ip_address VARCHAR(45),
  country_code VARCHAR(2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_trusted BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique device per user (can't have duplicate fingerprints)
  CONSTRAINT unique_device_per_user UNIQUE (user_id, device_id_hash)
);

-- 3. User Sessions Table
-- Tracks all login sessions with anomaly detection data
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES device_fingerprints(id) ON DELETE CASCADE,
  refresh_token_id UUID REFERENCES refresh_tokens(id) ON DELETE CASCADE,
  
  -- Anomaly detection fields
  ip_address VARCHAR(45) NOT NULL,
  country_code VARCHAR(2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Risk assessment
  risk_score INTEGER DEFAULT 0,       -- 0-100
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  
  -- Anomaly flags
  is_new_device BOOLEAN DEFAULT false,
  is_new_country BOOLEAN DEFAULT false,
  is_impossible_travel BOOLEAN DEFAULT false,
  
  -- Session verification for high-risk logins
  is_verified BOOLEAN DEFAULT true,   -- Set to false for high-risk logins
  verified_at TIMESTAMP,
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logged_out_at TIMESTAMP
);

-- 4. Session Verification Tokens
-- Stores tokens for "Was this you?" email verification
CREATE TABLE IF NOT EXISTS session_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  token_hash TEXT NOT NULL UNIQUE,    -- SHA256 of verification token
  action VARCHAR(20) CHECK (action IN ('confirm', 'deny')) NOT NULL,
  
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Session Anomalies Audit Log
-- Complete audit trail of anomalies detected
CREATE TABLE IF NOT EXISTS session_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  
  anomaly_type VARCHAR(50) NOT NULL,  -- 'new_device', 'new_country', 'impossible_travel'
  risk_score INTEGER,
  risk_level TEXT,
  
  details JSONB,  -- Additional context
  
  action_taken TEXT,  -- 'email_sent', 'session_blocked', 'verified', 'denied'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Session Anomaly Rate Limiting
-- Prevents spam of anomaly emails
CREATE TABLE IF NOT EXISTS anomaly_email_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50),  -- 'anomaly_alert', 'verification_needed'
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_rate_limit UNIQUE (user_id, email_type, window_start)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Device fingerprints indexes
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user_id 
  ON device_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_is_trusted 
  ON device_fingerprints(is_trusted);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_last_seen_at 
  ON device_fingerprints(last_seen_at DESC);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
  ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_id 
  ON user_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_verified 
  ON user_sessions(is_verified);
CREATE INDEX IF NOT EXISTS idx_user_sessions_risk_level 
  ON user_sessions(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active 
  ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at 
  ON user_sessions(created_at DESC);

-- Session verification tokens indexes
CREATE INDEX IF NOT EXISTS idx_session_verification_tokens_user_id 
  ON session_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_verification_tokens_is_used 
  ON session_verification_tokens(is_used);
CREATE INDEX IF NOT EXISTS idx_session_verification_tokens_expires_at 
  ON session_verification_tokens(expires_at);

-- Session anomalies indexes
CREATE INDEX IF NOT EXISTS idx_session_anomalies_user_id 
  ON session_anomalies(user_id);
CREATE INDEX IF NOT EXISTS idx_session_anomalies_anomaly_type 
  ON session_anomalies(anomaly_type);
CREATE INDEX IF NOT EXISTS idx_session_anomalies_created_at 
  ON session_anomalies(created_at DESC);

-- Rate limiting indexes
CREATE INDEX IF NOT EXISTS idx_anomaly_email_rate_limit_user_id 
  ON anomaly_email_rate_limit(user_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_email_rate_limit_window_start 
  ON anomaly_email_rate_limit(window_start DESC);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE device_fingerprints IS 
  'Stores unique device signatures. Each device gets a unique fingerprint based on userAgent, IP, and accept-language';

COMMENT ON TABLE user_sessions IS 
  'Tracks login sessions with anomaly detection. High-risk sessions are marked as unverified until user confirms.';

COMMENT ON TABLE session_verification_tokens IS 
  'Tokens for email verification of suspicious logins. Single-use, 15-minute expiration.';

COMMENT ON TABLE session_anomalies IS 
  'Complete audit trail of all detected anomalies for compliance and forensics.';

COMMENT ON COLUMN user_sessions.risk_score IS 
  'Calculated score: 0-30 (low), 31-70 (medium), 71+ (high). Based on new device (+20), new country (+40), impossible travel (+70).';

COMMENT ON COLUMN user_sessions.is_verified IS 
  'FALSE for high-risk logins until user clicks "This was me" in email. TRUE blocks sensitive operations.';
