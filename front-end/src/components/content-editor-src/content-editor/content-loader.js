import { apiGet } from '../../../utils/api';
import { config } from '../../../config/app-config';

const contentCache = new Map();

export function loadAllContent() {
  const contentElements = document.querySelectorAll('[data-content]');
  return loadContentForElements(contentElements);
}

export async function loadContentForElements(elements) {
  const promises = Array.from(elements).map(element => {
    const pageTitle = element.getAttribute('data-page') || 'Home';
    const tagId = element.getAttribute('data-content');
    return loadContentForElement(element, pageTitle, tagId);
  });

  return Promise.all(promises);
}

export async function loadContentForElement(element, pageTitle, tagId) {
  try {
    const cacheKey = `${pageTitle}:${tagId}`;
    if (contentCache.has(cacheKey)) {
      return contentCache.get(cacheKey);
    }

    element.classList.add('content-loading');

    const data = await fetchContent(pageTitle, tagId);

    element.classList.remove('content-loading');

    if (!data) return null;

    contentCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error loading content for ${tagId}:`, error);
    element.classList.remove('content-loading');
    element.classList.add('content-error');
    return null;
  }
}

async function fetchContent(pageTitle, tagId) {
  return apiGet(
    `${config.api.paths.content}?page_title=${encodeURIComponent(pageTitle)}&tag_id=${encodeURIComponent(tagId)}`,
    { auth: false }
  );
}

export function clearContentCache(tagId) {
  for (const key of contentCache.keys()) {
    if (key.includes(tagId)) {
      contentCache.delete(key);
    }
  }
}

export function getContentFromCache(key) {
  return contentCache.has(key) ? contentCache.get(key) : null;
}