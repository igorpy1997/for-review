const pendingChanges = {
  text: {},
  image: {}
};

export function getPendingChanges() {
  return JSON.parse(JSON.stringify({
    text: pendingChanges.text,
    image: pendingChanges.image
  }));
}

export function updatePendingChanges(type, id, data, merge = false) {
  if (!pendingChanges[type]) {
    pendingChanges[type] = {};
  }

  if (merge && pendingChanges[type][id]) {
    pendingChanges[type][id] = {
      ...pendingChanges[type][id],
      ...data
    };
  } else {
    pendingChanges[type][id] = data;
  }

  notifyPendingChanges();
}

export function removePendingChange(type, id) {
  if (pendingChanges[type] && pendingChanges[type][id]) {
    delete pendingChanges[type][id];

    notifyPendingChanges();
  }
}

export function clearPendingChanges() {
  pendingChanges.text = {};
  pendingChanges.image = {};

  notifyPendingChanges();
}

export function hasPendingChanges() {
  return Object.keys(pendingChanges.text).length > 0 ||
         Object.keys(pendingChanges.image).length > 0;
}

export function getPendingChangesCount() {
  return Object.keys(pendingChanges.text).length +
         Object.keys(pendingChanges.image).length;
}

function notifyPendingChanges() {
  const event = new CustomEvent('pendingChanges:updated', {
    detail: {
      count: getPendingChangesCount(),
      hasPending: hasPendingChanges()
    }
  });

  document.dispatchEvent(event);
}