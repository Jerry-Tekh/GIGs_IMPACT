const buildApiUrl = (path) => `${import.meta.env.VITE_SERVER_URL}${path}`;

let csrfTokenCache = '';
let csrfPromise = null;

const parseJson = async (response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || 'Failed to fetch CSRF token');
    error.status = response.status;
    error.payload = payload;
    error.retryAfter = payload?.retryAfterSeconds || payload?.retryAfter || response.headers.get('Retry-After');
    throw error;
  }

  return payload;
};

export const fetchCsrfToken = async ({ force = false } = {}) => {
  if (!force && csrfTokenCache) {
    return csrfTokenCache;
  }

  if (!csrfPromise) {
    csrfPromise = (async () => {
      const response = await fetch(buildApiUrl('/api/auth/csrf-token'), {
        method: 'GET',
        credentials: 'include'
      });

      const payload = await parseJson(response);
      csrfTokenCache = payload?.csrfToken || '';
      return csrfTokenCache;
    })().finally(() => {
      csrfPromise = null;
    });
  }

  return csrfPromise;
};

export const setCsrfToken = (token) => {
  csrfTokenCache = token || '';
};

export const clearCsrfToken = () => {
  csrfTokenCache = '';
};

export const getCachedCsrfToken = () => csrfTokenCache;
