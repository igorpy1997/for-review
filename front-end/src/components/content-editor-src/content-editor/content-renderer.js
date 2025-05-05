import { getMediaUrl, extractFilenameFromPath } from '../../../utils/api';

export function applyContentToElement(element, data) {
  if (!data) return;

  const contentType = element.getAttribute('data-type') || 'text';

  if (contentType === 'image' && data.media_path) {
    applyImageContent(element, data);
  } else if (data.content) {
    applyTextContent(element, data);
  }

  saveDataAttributes(element, data);
}

function applyImageContent(element, data) {
  const filename = extractFilenameFromPath(data.media_path);
  const imageUrl = getMediaUrl(filename);

  if (element.tagName.toLowerCase() === 'img') {
    updateImageElement(element, imageUrl, data);
  } else {
    replaceWithImageElement(element, imageUrl, data);
  }
}

function updateImageElement(imgElement, imageUrl, data) {
  imgElement.src = imageUrl;
  imgElement.alt = data.tag || data.tagId || '';
  imgElement.setAttribute('data-original-src', imageUrl);
}

function replaceWithImageElement(element, imageUrl, data) {
  const imgElement = document.createElement('img');
  imgElement.src = imageUrl;
  imgElement.alt = data.tag || data.tagId || '';
  imgElement.className = element.className;
  imgElement.setAttribute('data-original-src', imageUrl);

  Array.from(element.attributes).forEach(attr => {
    if (attr.name.startsWith('data-')) {
      imgElement.setAttribute(attr.name, attr.value);
    }
  });

  if (element.parentNode) {
    element.parentNode.replaceChild(imgElement, element);
  }
}

function applyTextContent(element, data) {
  element.textContent = data.content;
  element.setAttribute('data-original-content', data.content);
}

function saveDataAttributes(element, data) {
  if (data.data_attribute) {
    element.setAttribute('data-attribute', data.data_attribute);
  }

  if (data.block_id) {
    element.setAttribute('data-block-id', data.block_id);
  }
}