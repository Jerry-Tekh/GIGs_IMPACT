/**
 * ANOMALY DETECTION SERVICE
 * Business logic for device trust, login risk scoring, and session security.
 */

import pool from '../config/db.js';
import {
  createDeviceFingerprint,
  geoLookup,
  calculateDistance,
  isImpossibleTravel as checkImpossibleTravel,
  calculateRiskScore,
  getTimeDifferenceInMinutes,
  generateVerificationToken,
  hashToken,
  getTokenExpiration,
  getClientIp
} from '../utils/anomalyDetection.js';

const LOGIN_SESSION_EXPIRY_DAYS = 7;

export const getOrCreateDevice = async (userId, req, client = pool) => {
  const { deviceIdHash, deviceName, userAgent } = createDeviceFingerprint(req);
  const ipAddress = getClientIp(req);
  const geoData = await geoLookup(ipAddress);

  const existingDeviceResult = await client.query(
    `SELECT id, is_trusted, device_id_hash, device_name
     FROM device_fingerprints
     WHERE user_id = $1 AND device_id_hash = $2
     LIMIT 1`,
    [userId, deviceIdHash]
  );

  if (existingDeviceResult.rows[0]) {
    const existingDevice = existingDeviceResult.rows[0];

    await client.query(
      `UPDATE device_fingerprints
       SET last_seen_at = NOW(),
           ip_address = $2,
           country_code = $3,
           latitude = $4,
           longitude = $5,
           user_agent = $6,
           device_name = COALESCE($7, device_name)
       WHERE id = $1`,
      [
        existingDevice.id,
        ipAddress,
        geoData.countryCode,
        geoData.lat,
        geoData.lon,
        userAgent,
        deviceName
      ]
    );

    return {
      ...existingDevice,
      user_id: userId,
      user_agent: userAgent,
      ip_address: ipAddress,
      country_code: geoData.countryCode,
      latitude: geoData.lat,
      longitude: geoData.lon
    };
  }

  const newDeviceResult = await client.query(
    `INSERT INTO device_fingerprints
      (user_id, device_id_hash, device_name, user_agent, ip_address, country_code, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, is_trusted, device_id_hash, device_name, user_agent, ip_address, country_code, latitude, longitude`,
    [userId, deviceIdHash, deviceName, userAgent, ipAddress, geoData.countryCode, geoData.lat, geoData.lon]
  );

  return newDeviceResult.rows[0];
};

export const findDeviceByRequestFingerprint = async (userId, req, client = pool) => {
  const { deviceIdHash } = createDeviceFingerprint(req);
  const result = await client.query(
    `SELECT id, user_id, is_trusted, device_id_hash, device_name, user_agent, ip_address, country_code, latitude, longitude
     FROM device_fingerprints
     WHERE user_id = $1 AND device_id_hash = $2
     LIMIT 1`,
    [userId, deviceIdHash]
  );

  return result.rows[0] || null;
};

export const markDeviceAsTrusted = async (deviceId, client = pool) => {
  await client.query(
    `UPDATE device_fingerprints
     SET is_trusted = true, last_seen_at = NOW()
     WHERE id = $1`,
    [deviceId]
  );
};

export const detectAnomalies = async (userId, device, req, client = pool) => {
  const ipAddress = getClientIp(req);
  const geoData = await geoLookup(ipAddress);

  const lastSessionResult = await client.query(
    `SELECT id, created_at, country_code, latitude, longitude
     FROM user_sessions
     WHERE user_id = $1 AND is_active = true
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  const anomalies = {
    isNewDevice: !device.is_trusted,
    isNewCountry: false,
    isImpossibleTravel: false
  };

  const lastSession = lastSessionResult.rows[0] || null;

  if (!lastSession) {
    return {
      anomalies,
      riskAssessment: calculateRiskScore(anomalies),
      geoData,
      device,
      lastSession: null
    };
  }

  if (
    lastSession.country_code &&
    geoData.countryCode &&
    lastSession.country_code !== geoData.countryCode
  ) {
    anomalies.isNewCountry = true;
  }

  const hasPriorCoordinates =
    lastSession.latitude !== null &&
    lastSession.longitude !== null &&
    geoData.lat !== null &&
    geoData.lon !== null;

  if (hasPriorCoordinates) {
    const distanceKm = calculateDistance(
      Number(lastSession.latitude),
      Number(lastSession.longitude),
      Number(geoData.lat),
      Number(geoData.lon)
    );
    const timeMinutes = Math.max(getTimeDifferenceInMinutes(lastSession.created_at, new Date()), 1);

    if (checkImpossibleTravel(distanceKm, timeMinutes)) {
      anomalies.isImpossibleTravel = true;
    }
  }

  return {
    anomalies,
    riskAssessment: calculateRiskScore(anomalies),
    geoData,
    device,
    lastSession
  };
};

export const createSession = async (
  {
    userId,
    deviceId,
    refreshTokenId,
    ipAddress,
    anomalyResult,
    expiresAt
  },
  client = pool
) => {
  const { geoData, riskAssessment, anomalies } = anomalyResult;
  const isVerified = riskAssessment.level !== 'high';
  const sessionExpiresAt =
    expiresAt || new Date(Date.now() + LOGIN_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const sessionResult = await client.query(
    `INSERT INTO user_sessions
      (user_id, device_id, refresh_token_id, ip_address, country_code, latitude, longitude,
       risk_score, risk_level, is_new_device, is_new_country, is_impossible_travel,
       is_verified, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id, user_id, device_id, refresh_token_id, risk_score, risk_level, is_verified, created_at`,
    [
      userId,
      deviceId,
      refreshTokenId,
      ipAddress,
      geoData.countryCode,
      geoData.lat,
      geoData.lon,
      riskAssessment.score,
      riskAssessment.level,
      anomalies.isNewDevice,
      anomalies.isNewCountry,
      anomalies.isImpossibleTravel,
      isVerified,
      sessionExpiresAt
    ]
  );

  await client.query(
    `UPDATE users
     SET last_login_at = NOW(),
         last_login_ip = $2,
         last_login_country = $3
     WHERE id = $1`,
    [userId, ipAddress, geoData.countryCode]
  );

  return sessionResult.rows[0];
};

export const recordLoginAnomalies = async (
  userId,
  sessionId,
  anomalyResult,
  client = pool
) => {
  const { anomalies, riskAssessment, geoData, lastSession, device } = anomalyResult;
  const anomalyTypes = [];

  if (anomalies.isNewDevice) anomalyTypes.push('new_device');
  if (anomalies.isNewCountry) anomalyTypes.push('new_country');
  if (anomalies.isImpossibleTravel) anomalyTypes.push('impossible_travel');

  if (anomalyTypes.length === 0) {
    return;
  }

  const details = {
    anomalyTypes,
    deviceName: device.device_name || null,
    currentCountry: geoData.countryCode || null,
    previousCountry: lastSession?.country_code || null,
    triggeredAt: new Date().toISOString()
  };

  await client.query(
    `INSERT INTO session_anomalies
      (user_id, session_id, anomaly_type, risk_score, risk_level, details, action_taken)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
    [
      userId,
      sessionId,
      anomalyTypes.join(','),
      riskAssessment.score,
      riskAssessment.level,
      JSON.stringify(details),
      riskAssessment.level === 'high' ? 'verification_required' : 'alert_sent'
    ]
  );
};

export const createSessionVerificationToken = async (
  sessionId,
  userId,
  action = 'confirm',
  client = pool
) => {
  const token = generateVerificationToken();
  const tokenHash = hashToken(token);
  const expiresAt = getTokenExpiration(15);

  await client.query(
    `INSERT INTO session_verification_tokens
      (session_id, user_id, token_hash, action, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, userId, tokenHash, action, expiresAt]
  );

  return { token, expiresAt };
};

export const verifySecurityToken = async (token, client = pool) => {
  const tokenHash = hashToken(token);

  const result = await client.query(
    `SELECT svt.id, svt.session_id, svt.user_id, svt.action, svt.expires_at, svt.created_at,
            us.device_id, us.risk_level, us.is_verified,
            df.device_name,
            u.email AS user_email,
            u.full_name
     FROM session_verification_tokens svt
     JOIN user_sessions us ON us.id = svt.session_id
     LEFT JOIN device_fingerprints df ON df.id = us.device_id
     JOIN users u ON u.id = svt.user_id
     WHERE svt.token_hash = $1
       AND svt.is_used = false
       AND svt.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  return result.rows[0] || null;
};

export const consumeToken = async (tokenId, client = pool) => {
  await client.query(
    `UPDATE session_verification_tokens
     SET is_used = true, used_at = NOW()
     WHERE id = $1`,
    [tokenId]
  );
};

export const confirmSession = async (sessionId, tokenId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE user_sessions
       SET is_verified = true, verified_at = NOW(), last_activity_at = NOW()
       WHERE id = $1`,
      [sessionId]
    );

    const sessionResult = await client.query(
      `SELECT user_id, device_id
       FROM user_sessions
       WHERE id = $1
       LIMIT 1`,
      [sessionId]
    );

    const session = sessionResult.rows[0];
    if (session?.device_id) {
      await markDeviceAsTrusted(session.device_id, client);
    }

    await consumeToken(tokenId, client);

    await client.query(
      `INSERT INTO session_anomalies
        (user_id, session_id, anomaly_type, action_taken, details)
       VALUES ($1, $2, 'login_verified', 'confirmed', $3::jsonb)`,
      [
        session?.user_id || null,
        sessionId,
        JSON.stringify({ verifiedAt: new Date().toISOString() })
      ]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const markSessionVerified = async (sessionId, client = pool) => {
  const sessionResult = await client.query(
    `UPDATE user_sessions
     SET is_verified = true,
         verified_at = NOW(),
         last_activity_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, device_id, risk_level, is_verified;`,
    [sessionId]
  );

  const session = sessionResult.rows[0] || null;
  if (session?.device_id) {
    await markDeviceAsTrusted(session.device_id, client);
  }

  return session;
};

export const handleSecurityBreach = async (userId, sessionId, tokenId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE user_sessions
       SET is_active = false, logged_out_at = NOW()
       WHERE user_id = $1 AND is_active = true`,
      [userId]
    );

    await client.query(
      `UPDATE refresh_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE user_id = $1 AND revoked = false`,
      [userId]
    );

    await client.query(
      `UPDATE users
       SET token_version = token_version + 1,
           suspicious_activity_flag = true,
           account_compromised_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    const resetToken = generateVerificationToken();
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpires = getTokenExpiration(60);

    await client.query(
      `UPDATE users
       SET reset_token = $1,
           reset_token_expires = $2
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpires, userId]
    );

    await consumeToken(tokenId, client);

    await client.query(
      `INSERT INTO session_anomalies
        (user_id, session_id, anomaly_type, risk_level, action_taken, details)
       VALUES ($1, $2, 'security_breach_denied', 'high', 'account_secured', $3::jsonb)`,
      [
        userId,
        sessionId,
        JSON.stringify({
          passwordResetRequired: true,
          revokedAllSessions: true,
          detectedAt: new Date().toISOString()
        })
      ]
    );

    await client.query('COMMIT');

    return {
      success: true,
      resetToken,
      resetTokenExpires
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const canSendAnomalyEmail = async (userId, emailType = 'anomaly_alert', client = pool) => {
  const result = await client.query(
    `SELECT COALESCE(SUM(count), 0) AS total
     FROM anomaly_email_rate_limit
     WHERE user_id = $1
       AND email_type = $2
       AND window_start > NOW() - INTERVAL '1 hour'`,
    [userId, emailType]
  );

  return Number(result.rows[0]?.total || 0) < 5;
};

export const incrementAnomalyEmailCount = async (
  userId,
  emailType = 'anomaly_alert',
  client = pool
) => {
  await client.query(
    `INSERT INTO anomaly_email_rate_limit (user_id, email_type, count, window_start)
     VALUES ($1, $2, 1, NOW())`,
    [userId, emailType]
  );
};

export const getSession = async (sessionId, client = pool) => {
  const result = await client.query(
    `SELECT us.*, df.device_name
     FROM user_sessions us
     LEFT JOIN device_fingerprints df ON df.id = us.device_id
     WHERE us.id = $1
     LIMIT 1`,
    [sessionId]
  );

  return result.rows[0] || null;
};

export const updateSessionActivity = async (sessionId, client = pool) => {
  await client.query(
    `UPDATE user_sessions
     SET last_activity_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
};

export const getUserActiveSessions = async (userId, client = pool) => {
  const result = await client.query(
    `SELECT us.id, us.device_id, us.ip_address, us.country_code, us.risk_level,
            us.is_verified, us.created_at, us.last_activity_at, df.device_name
     FROM user_sessions us
     LEFT JOIN device_fingerprints df ON df.id = us.device_id
     WHERE us.user_id = $1 AND us.is_active = true
     ORDER BY us.created_at DESC`,
    [userId]
  );

  return result.rows;
};

export const revokeSession = async (sessionId, client = pool) => {
  await client.query(
    `UPDATE user_sessions
     SET is_active = false, logged_out_at = NOW()
     WHERE id = $1`,
    [sessionId]
  );
};
