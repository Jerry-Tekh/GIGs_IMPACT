import crypto from 'crypto';
import { generateCSRFToken } from './generateCsrf.js';

const CSRF_COOKIE_NAME = 'csrf_secret';
const CSRF_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const resolveCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredSameSite = (process.env.COOKIE_SAME_SITE || '').toLowerCase();
  const allowedSameSite = ['strict', 'lax', 'none'];
  const sameSite = allowedSameSite.includes(configuredSameSite)
    ? configuredSameSite
    : (isProduction ? 'none' : 'lax');

  let secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : isProduction;

  if (sameSite === 'none') {
    secure = true;
  }

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/'
  };
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const cookieOptions = resolveCookieOptions();

  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  });

  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const setCsrfSecretCookie = (res, csrfSecret) => {
  res.cookie(CSRF_COOKIE_NAME, csrfSecret, {
    ...resolveCookieOptions(),
    maxAge: CSRF_COOKIE_MAX_AGE
  });
};

export const clearCsrfSecretCookie = (res) => {
  res.clearCookie(CSRF_COOKIE_NAME, resolveCookieOptions());
};

export const issueCsrfToken = (_req, res) => {
  const csrfSecret = crypto.randomBytes(32).toString('hex');
  setCsrfSecretCookie(res, csrfSecret);
  return generateCSRFToken(csrfSecret);
};

export const clearAuthCookies = (res) => {
  const cookieOptions = resolveCookieOptions();

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
  clearCsrfSecretCookie(res);
};
