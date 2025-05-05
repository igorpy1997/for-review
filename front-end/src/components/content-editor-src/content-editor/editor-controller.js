import { isAuthenticated, verifyAuth, getAuthToken } from '../../auth';
import { loadAllContent, loadContentForElements, loadContentForElement } from './content-loader';
import { applyContentToElement } from './content-renderer';
import { setupEditableElements, setupEditButton, cleanupEventHandlers } from './element-setup';
import { addPublishButton } from './publish-manager';

const editorState = {
  isInitialized: false,
  isAuthenticating: false,
  isEditorActive: false
};

export function initContentEditor() {
  console.log('Initializing content editor...');

  if (editorState.isInitialized) {
    cleanupEditor();
  }

  const authStatusElement = document.getElementById('auth-status');
  if (authStatusElement) {
    authStatusElement.innerHTML = '';
  }

  loadContent();

  if (isAuthenticated()) {
    initEditorForAuthenticatedUser();
  } else {
    console.log('Content editor initialized in view-only mode');
  }

  editorState.isInitialized = true;

  return {
    loadContentForNewElements,
    cleanupEditor
  };
}

async function loadContent() {
  try {
    const contentElements = document.querySelectorAll('[data-content]');

    for (const element of contentElements) {
      const pageTitle = element.getAttribute('data-page') || 'Home';
      const tagId = element.getAttribute('data-content');

      element.classList.add('content-loading');

      const data = await loadContentForElement(element, pageTitle, tagId);

      element.classList.remove('content-loading');

      if (data) {
        applyContentToElement(element, data);
      }
    }

    console.log('Content loaded successfully');
  } catch (error) {
    console.error('Error loading content:', error);
  }
}

function initEditorForAuthenticatedUser() {
  editorState.isAuthenticating = true;

  verifyAuth(getAuthToken())
    .then(() => {
      setupEditableElements();
      addPublishButton();

      editorState.isEditorActive = true;
      editorState.isAuthenticating = false;
      console.log('Content editor initialized for authenticated user');
    })
    .catch(error => {
      console.error('Authentication failed:', error);
      localStorage.removeItem('token');
      editorState.isAuthenticating = false;
    });
}

export function loadContentForNewElements(elements) {
  loadContentForElements(elements)
    .then(results => {
      elements.forEach((element, index) => {
        applyContentToElement(element, results[index]);
      });

      if (isAuthenticated() && editorState.isEditorActive) {
        elements.forEach(setupEditButton);
      }
    })
    .catch(error => {
      console.error('Error loading content for new elements:', error);
    });
}

export function cleanupEditor() {
  cleanupEventHandlers();
  editorState.isEditorActive = false;
}