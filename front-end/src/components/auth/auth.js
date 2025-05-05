import { getApiBaseUrl, config } from '../../config/app-config';

export async function verifyAuth(token) {
  if (!token) {
    return Promise.reject(new Error('No token provided'));
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}${config.api.paths.auth}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    return await response.json();
  } catch (error) {
    console.error('Auth verification failed:', error);
    throw error;
  }
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function getAuthToken() {
  return localStorage.getItem('token');
}

export function removeAuthToken() {
  localStorage.removeItem('token');
}

export function getApiHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth && isAuthenticated()) {
    headers['Authorization'] = `Bearer ${getAuthToken()}`;
  }

  return headers;
}