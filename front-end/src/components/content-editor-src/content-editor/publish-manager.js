import { isAuthenticated } from '../../auth';
import { showSuccessNotification, showErrorNotification } from '../../../utils/notifications';
import { config } from '../../../config/app-config';
import { publishTextChange } from '../text-editor';
import { publishImageChange } from '../image-editor';
import {
  getPendingChanges,
  hasPendingChanges,
  getPendingChangesCount,
  clearPendingChanges
} from '../content-store';
import { clearContentCache } from './content-loader';
import { eventHandlers } from './element-setup';
import { createPublishButton } from '../ui-elements';

export function addPublishButton() {
  const existingBtn = document.getElementById(config.editor.selectors.publishButton);
  if (existingBtn) {
    existingBtn.remove();
  }

  const publishBtn = createPublishButton();
  document.body.appendChild(publishBtn);

  const handlePublishClick = () => {
    publishChanges();
  };

  publishBtn.addEventListener('click', handlePublishClick);
  eventHandlers.add({ element: publishBtn, type: 'click', handler: handlePublishClick });

  const handlePendingChanges = (event) => {
    publishBtn.style.display = event.detail.hasPending ? 'block' : 'none';

    if (event.detail.count > 0) {
      publishBtn.textContent = `Publish Changes (${event.detail.count})`;
    } else {
      publishBtn.textContent = 'Publish Changes';
    }
  };

  document.addEventListener('pendingChanges:updated', handlePendingChanges);
  eventHandlers.add({ element: document, type: 'pendingChanges:updated', handler: handlePendingChanges });

  publishBtn.style.display = hasPendingChanges() ? 'block' : 'none';
}

export async function publishChanges() {
  if (!isAuthenticated()) {
    console.error('Authentication required to publish changes');
    showErrorNotification('Authentication required to publish changes');
    return;
  }

  if (!hasPendingChanges()) {
    console.error('No changes to publish');
    return;
  }

  const publishBtn = document.getElementById(config.editor.selectors.publishButton);
  if (publishBtn) {
    publishBtn.textContent = 'Publishing...';
    publishBtn.disabled = true;
  }

  const changes = getPendingChanges();
  const promises = [];

  for (const tagId in changes.text) {
    promises.push(publishTextChange(tagId, changes.text[tagId]));
  }

  for (const tagId in changes.image) {
    promises.push(publishImageChange(tagId, changes.image[tagId]));
  }

  try {
    const results = await Promise.all(promises);
    console.log('Published changes for:', results);

    for (const tagId in changes.text) {
      clearContentCache(tagId);
    }
    for (const tagId in changes.image) {
      clearContentCache(tagId);
    }

    clearPendingChanges();

    if (publishBtn) {
      publishBtn.textContent = 'Publish Changes';
      publishBtn.disabled = false;
      publishBtn.style.display = 'none';
    }

    showSuccessNotification('Changes published successfully!');
  } catch (error) {
    console.error('Error publishing changes:', error);
    showErrorNotification('Error publishing changes');

    if (publishBtn) {
      publishBtn.textContent = 'Publish Changes';
      publishBtn.disabled = false;
    }
  }
}