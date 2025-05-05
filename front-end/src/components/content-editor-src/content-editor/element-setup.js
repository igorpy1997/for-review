import { createEditButton, createEditableWrapper } from '../ui-elements';
import { openTextEditor } from '../text-editor';
import { openImageEditor } from '../image-editor';

export const eventHandlers = new Set();

export function setupEditableElements() {
  const contentElements = document.querySelectorAll('[data-content]');
  contentElements.forEach(setupEditButton);
}

export function setupEditButton(element) {
  const parentWrapper = element.parentNode;
  if (parentWrapper && parentWrapper.classList.contains('editable-wrapper')) {
    return;
  }

  const wrapper = createEditableWrapper(element);
  const editBtn = createEditButton();

  if (element.parentNode) {
    element.parentNode.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    wrapper.appendChild(editBtn);

    const handleEditClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const contentType = element.getAttribute('data-type') || 'text';

      if (contentType === 'image') {
        openImageEditor(element);
      } else {
        openTextEditor(element);
      }
    };

    editBtn.addEventListener('click', handleEditClick);
    eventHandlers.add({ element: editBtn, type: 'click', handler: handleEditClick });
  }
}

export function cleanupEventHandlers() {
  eventHandlers.forEach(handler => {
    handler.element.removeEventListener(handler.type, handler.handler);
  });
  eventHandlers.clear();
}