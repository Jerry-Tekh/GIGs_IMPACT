/**
 * ANOMALY DETECTION UTILITIES
 * Shared helpers for device fingerprinting, geolocation, and risk scoring.
 */

import crypto from 'crypto';

export const createDeviceFingerprint = (req) => {
  const userAgent = req.get('user-agent') || 'unknown';
  const acceptLanguage = req.get('accept-language') || 'unknown';
  const ipAddress = getClientIp(req);
  const fingerprintString = `${userAgent}|${ipAddress}|${acceptLanguage}`;
  const deviceIdHash = crypto.createHash('sha256').update(fingerprintString).digest('hex');

  return {
    deviceId: fingerprintString,
    deviceIdHash,
    deviceName: parseDeviceName(userAgent),
    userAgent,
    acceptLanguage
  };
};

const parseDeviceName = (userAgent) => {
  try {
    let browser = 'Unknown';
    if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';

    return `${browser} on ${os}`;
  } catch {
    return 'Unknown Device';
  }
};

export const geoLookup = async (ip) => {
  const mockGeoData = {
    '127.0.0.1': { country: 'Local', countryCode: 'LO', lat: 0, lon: 0, city: 'Localhost' },
    '192.168.1.1': { country: 'Local', countryCode: 'LO', lat: 0, lon: 0, city: 'LocalNetwork' },
    '102.89.0.0': { country: 'Nigeria', countryCode: 'NG', lat: 6.5, lon: 3.3, city: 'Lagos' },
    '8.8.8.8': { country: 'United States', countryCode: 'US', lat: 37.386, lon: -122.084, city: 'Mountain View' },
    '1.1.1.1': { country: 'United Kingdom', countryCode: 'GB', lat: 51.5074, lon: -0.1278, city: 'London' },
    '20.205.243.166': { country: 'Singapore', countryCode: 'SG', lat: 1.3521, lon: 103.8198, city: 'Singapore' }
  };

  if (mockGeoData[ip]) {
    return mockGeoData[ip];
  }

  return {
    country: 'Unknown',
    countryCode: 'XX',
    lat: null,
    lon: null,
    city: 'Unknown'
  };
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    if ([lat1, lon1, lat2, lon2].some(value => value === null || value === undefined)) {
      return 0;
    }

    const earthRadiusKm = 6371;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusKm * c);
  } catch (error) {
    console.error('Distance calculation error:', error);
    return 999999;
  }
};

export const isImpossibleTravel = (distance, timeMinutes) => {
  const maxPossibleDistance = 900 * Math.max(timeMinutes, 1);
  return distance > maxPossibleDistance;
};

export const RISK_SCORES = {
  NEW_DEVICE: 20,
  NEW_COUNTRY: 40,
  IMPOSSIBLE_TRAVEL: 70
};

export const RISK_LEVELS = {
  LOW: { min: 0, max: 30, level: 'low' },
  MEDIUM: { min: 31, max: 70, level: 'medium' },
  HIGH: { min: 71, max: 100, level: 'high' }
};

export const calculateRiskScore = (anomalies) => {
  let score = 0;

  if (anomalies.isNewDevice) score += RISK_SCORES.NEW_DEVICE;
  if (anomalies.isNewCountry) score += RISK_SCORES.NEW_COUNTRY;
  if (anomalies.isImpossibleTravel) score += RISK_SCORES.IMPOSSIBLE_TRAVEL;

  let level = RISK_LEVELS.LOW.level;
  if (score >= RISK_LEVELS.HIGH.min) level = RISK_LEVELS.HIGH.level;
  else if (score >= RISK_LEVELS.MEDIUM.min) level = RISK_LEVELS.MEDIUM.level;

  return { score: Math.min(score, 100), level };
};

export const getClientIp = (req) => {
  if (!req) {
    return 'unknown';
  }

  return (
    req.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

export const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const isTokenExpired = (expiresAt) => new Date(expiresAt) < new Date();

export const getTokenExpiration = (minutesFromNow = 15) =>
  new Date(Date.now() + minutesFromNow * 60 * 1000);

export const getTimeDifferenceInMinutes = (previousTime, currentTime = new Date()) => {
  const diffMs = currentTime - new Date(previousTime);
  return Math.floor(diffMs / (1000 * 60));
};

export const getTimeDifferenceInHours = (previousTime, currentTime = new Date()) =>
  getTimeDifferenceInMinutes(previousTime, currentTime) / 60;
