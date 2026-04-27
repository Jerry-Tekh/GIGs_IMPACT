const buildApiUrl = (path) => `${import.meta.env.VITE_SERVER_URL}${path}`;

let refreshPromise = null;

const createRequestOptions = (options = {}) => {
  const { skipAuthRefresh: _skipAuthRefresh, ...fetchOptions } = options;

  return ({
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {})
  },
  ...fetchOptions
  });
};

const request = (path, options = {}) =>
  fetch(buildApiUrl(path), createRequestOptions(options));

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || 'Request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const shouldAttemptRefresh = (path, options, response) => {
  if (response.status !== 401) {
    return false;
  }

  if (options.skipAuthRefresh) {
    return false;
  }

  return path !== '/api/auth/refresh';
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await request('/api/auth/refresh', {
        method: 'POST',
        skipAuthRefresh: true
      });

      return parseResponse(response);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const apiFetch = async (path, options = {}) => {
  let response = await request(path, options);

  if (shouldAttemptRefresh(path, options, response)) {
    try {
      await refreshAccessToken();
      response = await request(path, options);
    } catch (_error) {
      // If refresh fails, allow the original request response to surface normally.
    }
  }

  return parseResponse(response);
};

export { buildApiUrl, createRequestOptions, refreshAccessToken };
