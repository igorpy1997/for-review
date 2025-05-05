import { getApiBaseUrl } from '../config/app-config';
import { getApiHeaders } from '../components/auth';

export async function apiRequest(method, endpoint, data = null, options = {}) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  let headers = options.headers || getApiHeaders(options.auth !== false);
  const requestOptions = {
    method,
    headers,
    ...options
  };

  if (data) {
    if (data instanceof FormData) {
      const { 'Content-Type': contentType, ...restHeaders } = headers;
      requestOptions.headers = restHeaders;
      requestOptions.body = data;
    } else {
      requestOptions.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`API ${method} request failed for ${endpoint}:`, error);
    throw error;
  }
}

export async function apiGet(endpoint, options = {}) {
  return apiRequest('GET', endpoint, null, options);
}

export async function apiPost(endpoint, data, options = {}) {
  return apiRequest('POST', endpoint, data, options);
}

export async function apiPut(endpoint, data, options = {}) {
  return apiRequest('PUT', endpoint, data, options);
}

export async function apiDelete(endpoint, options = {}) {
  return apiRequest('DELETE', endpoint, null, options);
}

export async function apiPatch(endpoint, data, options = {}) {
  return apiRequest('PATCH', endpoint, data, options);
}

export function getMediaUrl(filename) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api/media/${filename}`;
}

export function extractFilenameFromPath(path) {
  if (!path) return '';
  return path.substring(path.lastIndexOf('/') + 1);
}