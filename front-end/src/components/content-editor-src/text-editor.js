import { getAuthToken } from '../auth';
import { apiPost } from '../../utils/api';
import { config } from '../../config/app-config';
import { createModal } from './ui-elements';
import { updatePendingChanges } from './content-store';

export function openTextEditor(element, options = {}) {
  const pageTitle = element.getAttribute('data-page') || 'Home';
  const tagId = element.getAttribute('data-content');
  const contentType = element.getAttribute('data-type') || 'text';
  const blockName = element.getAttribute('data-block-name') || findBlockName(element);
  const dataAttribute = element.getAttribute('data-attribute') || determineDataAttribute(contentType);

  const currentContent = element.textContent.trim();

  let modalContent;

  if (contentType === 'textarea') {
    modalContent = `
      <h3>Edit Content</h3>
      <textarea id="content-input" rows="5" placeholder="Enter content">${currentContent}</textarea>
      ${blockName ? `<div class="block-info">Block: ${blockName}</div>` : ''}
    `;
  } else {
    modalContent = `
      <h3>Edit Content</h3>
      <input type="text" id="content-input" value="${currentContent}" placeholder="Enter content">
      ${blockName ? `<div class="block-info">Block: ${blockName}</div>` : ''}
    `;
  }

  const modal = createModal(modalContent);

  const contentInput = document.getElementById('content-input');
  contentInput.focus();
  contentInput.select();

  modal.on('save', () => {
    const newContent = contentInput.value.trim();
    if (newContent) {
      saveTextChange(element, {
        pageTitle,
        tagId,
        content: newContent,
        blockName,
        dataAttribute
      });
    }
    modal.close();
  });
}

export function saveTextChange(element, data) {
  updatePendingChanges('text', data.tagId, {
    pageTitle: data.pageTitle,
    tagId: data.tagId,
    content: data.content,
    blockName: data.blockName,
    dataAttribute: data.dataAttribute
  });

  element.textContent = data.content;
  element.classList.add('content-modified');

  const publishBtn = document.getElementById(config.editor.selectors.publishButton);
  if (publishBtn) {
    publishBtn.style.display = 'block';
  }
}

export async function publishTextChange(tagId, change) {
  const token = getAuthToken();
  if (!token) {
    return Promise.reject(new Error('Authentication required'));
  }

  const element = document.querySelector(`[data-content="${tagId}"]`);
  if (!element) {
    console.error(`Element with tagId ${tagId} not found`);
    return Promise.reject(new Error(`Element with tagId ${tagId} not found`));
  }

  const requestBody = {
    page_title: change.pageTitle,
    tag_id: change.tagId,
    tag: change.tagId,
    content: change.content,
    order: 1,
    data_attribute: change.dataAttribute || 'text'
  };

  if (change.blockName) {
    requestBody.block_name = change.blockName;
  }

  try {
    await apiPost(config.api.paths.content, requestBody);

    element.setAttribute('data-original-content', change.content);
    element.classList.remove('content-modified');

    return tagId;
  } catch (error) {
    console.error(`Failed to publish text change for ${tagId}:`, error);
    throw error;
  }
}

function determineDataAttribute(contentType) {
  switch (contentType) {
    case 'textarea':
      return 'html';
    default:
      return 'text';
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