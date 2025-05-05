import { getAuthToken } from '../auth';
import { apiPost, getMediaUrl, extractFilenameFromPath } from '../../utils/api';
import { config } from '../../config/app-config';
import { createModal } from './ui-elements';
import { updatePendingChanges } from './content-store';

export function openImageEditor(element, options = {}) {
  const pageTitle = element.getAttribute('data-page') || 'Home';
  const tagId = element.getAttribute('data-content');
  const blockName = element.getAttribute('data-block-name') || findBlockName(element);
  const dataAttribute = element.getAttribute('data-attribute') || 'image';

  let currentImageSrc = '';
  if (element.tagName.toLowerCase() === 'img') {
    currentImageSrc = element.src;
  }

  const modalContent = `
    <h3>Edit Image</h3>
    ${currentImageSrc ? `<div class="current-image"><img src="${currentImageSrc}" alt="Current image" style="max-width: 100%; max-height: 200px; object-fit: contain;"></div>` : ''}
    <div class="file-input-container">
      <input type="file" id="image-upload" accept="image/*">
      <label for="image-upload" class="file-label">Choose a file</label>
    </div>
    <div class="file-name" id="file-name"></div>
    ${blockName ? `<div class="block-info">Block: ${blockName}</div>` : ''}
  `;

  const modal = createModal(modalContent);

  const fileInput = document.getElementById('image-upload');
  const fileName = document.getElementById('file-name');

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      fileName.textContent = fileInput.files[0].name;
      modal.enableSave();
    } else {
      fileName.textContent = '';
      modal.disableSave();
    }
  });

  modal.on('save', () => {
    if (fileInput.files.length > 0) {
      saveImageChange(element, {
        pageTitle,
        tagId,
        file: fileInput.files[0],
        blockName,
        dataAttribute
      });
    }
    modal.close();
  });
}

export function saveImageChange(element, data) {
  const token = getAuthToken();
  if (!token) {
    return Promise.reject(new Error('Authentication required'));
  }

  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('page_title', data.pageTitle);
  formData.append('tag_id', data.tagId);
  formData.append('tag', data.tagId);
  formData.append('order', 1);
  formData.append('data_attribute', data.dataAttribute || 'image');

  if (data.blockName) {
    formData.append('block_name', data.blockName);
  }

  element.classList.add('loading');
  if (element.tagName.toLowerCase() === 'img') {
    element.style.opacity = '0.5';
  }

  apiPost(config.api.paths.contentImage, formData)
    .then(result => {
      if (result && result.media_path) {
        const imageUrl = getMediaUrl(extractFilenameFromPath(result.media_path));

        updatePendingChanges('image', data.tagId, {
          pageTitle: data.pageTitle,
          tagId: data.tagId,
          newUrl: imageUrl,
          element: element,
          mediaPath: result.media_path,
          blockName: data.blockName,
          dataAttribute: data.dataAttribute || 'image'
        });

        if (element.tagName.toLowerCase() === 'img') {
          element.src = imageUrl;
          element.style.opacity = '1';
          element.classList.add('content-modified');
          element.classList.remove('loading');
        } else {
          const imgElement = document.createElement('img');
          imgElement.src = imageUrl;
          imgElement.alt = data.tagId;
          imgElement.className = element.className + ' content-modified';

          Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              imgElement.setAttribute(attr.name, attr.value);
            }
          });

          element.parentNode.replaceChild(imgElement, element);
          updatePendingChanges('image', data.tagId, {
            element: imgElement
          }, true);
        }

        const publishBtn = document.getElementById(config.editor.selectors.publishButton);
        if (publishBtn) {
          publishBtn.style.display = 'block';
        }
      }
    })
    .catch(error => {
      console.error(`Error uploading image for ${data.tagId}:`, error);
      element.classList.remove('loading');
      if (element.tagName.toLowerCase() === 'img') {
        element.style.opacity = '1';
      }
      throw error;
    });
}

export async function publishImageChange(tagId, change) {
  try {
    if (change.element && typeof change.element.setAttribute === 'function') {
      change.element.setAttribute('data-original-src', change.newUrl);

      if (change.element.classList) {
        change.element.classList.remove('content-modified');
      }
    } else {
      console.warn(`Element for tagId ${tagId} is not a valid DOM element or is missing`);

      const elementInDOM = document.querySelector(`[data-content="${tagId}"]`);
      if (elementInDOM) {
        elementInDOM.setAttribute('data-original-src', change.newUrl);
        elementInDOM.classList.remove('content-modified');
      }
    }

    return tagId;
  } catch (error) {
    console.error(`Failed to finalize image change for ${tagId}:`, error);
    throw error;
  }
}

function findBlockName(element) {
  let parent = element.parentElement;
  while (parent) {
    if (parent.hasAttribute('data-block-name')) {
      return parent.getAttribute('data-block-name');
    }
    parent = parent.parentElement;
  }
  return '';
}