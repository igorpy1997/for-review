export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const DEFAULT_OPTIONS = {
  duration: 3000,
  position: 'bottom-right',
  closeButton: false,
};

export function showNotification(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  const notification = document.createElement('div');
  notification.className = `notification notification-${type} notification-${settings.position}`;
  notification.textContent = message;

  const styles = {
    position: 'fixed',
    padding: '12px 16px',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: '1000',
    opacity: '0',
    transition: 'opacity 0.3s ease-in-out'
  };

  const positionStyles = {
    'top-right': {
      top: '20px',
      right: '20px'
    },
    'top-left': {
      top: '20px',
      left: '20px'
    },
    'bottom-right': {
      bottom: '20px',
      right: '20px'
    },
    'bottom-left': {
      bottom: '20px',
      left: '20px'
    }
  };

  const typeStyles = {
    [NOTIFICATION_TYPES.SUCCESS]: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    [NOTIFICATION_TYPES.ERROR]: {
      backgroundColor: '#F44336',
      color: 'white'
    },
    [NOTIFICATION_TYPES.WARNING]: {
      backgroundColor: '#FF9800',
      color: 'white'
    },
    [NOTIFICATION_TYPES.INFO]: {
      backgroundColor: '#2196F3',
      color: 'white'
    }
  };

  Object.assign(notification.style, styles, positionStyles[settings.position], typeStyles[type]);

  if (settings.closeButton) {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: transparent;
      border: none;
      color: inherit;
      font-size: 16px;
      cursor: pointer;
    `;
    closeButton.addEventListener('click', () => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
    notification.appendChild(closeButton);
    notification.style.paddingRight = '30px';
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, settings.duration);

  return notification;
}

export function showSuccessNotification(message, options = {}) {
  return showNotification(message, NOTIFICATION_TYPES.SUCCESS, options);
}

export function showErrorNotification(message, options = {}) {
  return showNotification(message, NOTIFICATION_TYPES.ERROR, options);
}