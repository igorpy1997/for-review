import { config, getBlockApiUrl } from '../../../config/app-config';
import { apiGet, apiPost, apiDelete } from '../../../utils/api';
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifications';
import { getAuthToken, isAuthenticated, verifyAuth } from '../../auth';

export async function fetchBlocksBySection(sectionName) {
  return apiGet(`${config.api.paths.blocksByParent}/${encodeURIComponent(sectionName)}`, { auth: false })
    .catch(() => []);
}

export async function createBlock(blockData) {
  return apiPost(config.api.paths.blocks, blockData);
}

export async function deleteBlockById(blockId) {
  return apiDelete(getBlockApiUrl(blockId));
}

export function checkAuthForBlockOperations() {
  if (!isAuthenticated()) {
    showErrorNotification('Authentication required to modify blocks');
    return false;
  }
  return true;
}

export async function verifyAuthForBlockOperations() {
  if (!isAuthenticated()) {
    showErrorNotification('Authentication required to modify blocks');
    return false;
  }

  try {
    await verifyAuth(getAuthToken());
    return true;
  } catch (error) {
    console.error('[BlockSystem] Authorization error:', error);
    showErrorNotification('Authentication error');
    return false;
  }
}