const AUTH_KEYS = ['token', 'userId', 'userRole'];
const AUTH_STORAGE_MODE_KEY = 'auth_storage_mode';

export const getAuthValue = (key) => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

export const getToken = () => getAuthValue('token');

export const setAuthSession = ({ token, userId, userRole, rememberMe }) => {
  if (!token || !userId || !userRole) {
    return;
  }

  if (rememberMe) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', userRole);

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    localStorage.setItem(AUTH_STORAGE_MODE_KEY, 'local');
    return;
  }

  // Keep a local copy for legacy reads while session is active.
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
  localStorage.setItem('userRole', userRole);

  sessionStorage.setItem('token', token);
  sessionStorage.setItem('userId', userId);
  sessionStorage.setItem('userRole', userRole);
  localStorage.setItem(AUTH_STORAGE_MODE_KEY, 'session');
};

export const clearAuthSession = () => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
};

export const cleanupSessionAuthOnStartup = () => {
  const mode = localStorage.getItem(AUTH_STORAGE_MODE_KEY);
  if (mode !== 'session') {
    return;
  }

  if (!sessionStorage.getItem('token')) {
    clearAuthSession();
  }
};
