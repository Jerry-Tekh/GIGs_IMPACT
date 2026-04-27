import { apiFetch, buildApiUrl, createRequestOptions } from './apiClient.js';

export const normalizeAuthUser = (payload) => {
  if (!payload) {
    return null;
  }

  return payload.data || payload.user || payload;
};

export const AUTH_STATE_EVENT = 'gigimpact:auth-changed';

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
};

export const fetchCurrentUser = async () => {
  const payload = await apiFetch('/api/auth/me', {
    method: 'GET'
  });

  return normalizeAuthUser(payload);
};

export const logoutUser = async () => {
  await fetch(
    buildApiUrl('/api/auth/logout'),
    createRequestOptions({
      method: 'POST',
      skipAuthRefresh: true
    })
  );
  notifyAuthChanged();
};

export const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'author':
      return '/author/dashboard';
    case 'reader':
      return '/reader/dashboard';
    default:
      return '/login';
  }
};
