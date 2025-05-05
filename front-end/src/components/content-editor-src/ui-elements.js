export function createModal(content, options = {}) {
  const modal = document.createElement('div');
  modal.className = 'edit-modal';

  modal.innerHTML = `
    <div class="modal-content">
      ${content}
      <div class="buttons">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const saveBtn = modal.querySelector('.save-btn');
  const cancelBtn = modal.querySelector('.cancel-btn');

  const eventHandlers = {
    save: [],
    cancel: [],
    close: []
  };

  const triggerEvent = (eventName) => {
    if (eventHandlers[eventName] && eventHandlers[eventName].length) {
      eventHandlers[eventName].forEach(handler => handler());
    }
  };

  saveBtn.addEventListener('click', () => {
    triggerEvent('save');
  });

  cancelBtn.addEventListener('click', () => {
    triggerEvent('cancel');
    closeModal();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      triggerEvent('cancel');
      closeModal();
    }
  });

  function closeModal() {
    triggerEvent('close');
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  function enableSaveButton(enabled = true) {
    saveBtn.disabled = !enabled;
    saveBtn.style.opacity = enabled ? '1' : '0.5';
    saveBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }

  return {
    element: modal,
    on: (eventName, handler) => {
      if (eventHandlers[eventName]) {
        eventHandlers[eventName].push(handler);
      }
      return this;
    },
    close: closeModal,
    enableSave: () => enableSaveButton(true),
    disableSave: () => enableSaveButton(false)
  };
}

export function createPublishButton() {
  const publishBtn = document.createElement('button');
  publishBtn.id = 'publish-button';
  publishBtn.textContent = 'Publish Changes';
  publishBtn.className = 'publish-btn';

  Object.assign(publishBtn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    zIndex: '1000',
    display: 'none',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.3s'
  });

  publishBtn.addEventListener('mouseover', () => {
    publishBtn.style.backgroundColor = '#45a049';
  });

  publishBtn.addEventListener('mouseout', () => {
    publishBtn.style.backgroundColor = '#4CAF50';
  });

  return publishBtn;
}

export function createEditButton() {
  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';

  editBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
    </svg>
  `;
  editBtn.style.display = 'block';

  return editBtn;
}

export function createEditableWrapper(element) {
  const wrapper = document.createElement('div');
  wrapper.className = 'editable-wrapper';

  return wrapper;
}