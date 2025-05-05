const state = {
  pendingBlocks: [],
  pendingDeleteBlocks: [],
  blockCounters: {},
  inited: false,
  loadedSections: {},
  blockOrderData: {}
};

export function getState() {
  return { ...state };
}

export function getNextBlockNumber(blockType) {
  if (!state.blockCounters[blockType]) {
    state.blockCounters[blockType] = 0;
  }
  return ++state.blockCounters[blockType];
}

export function addPendingBlock(blockData) {
  state.pendingBlocks.push(blockData);
}

export function removePendingBlock(blockName) {
  state.pendingBlocks = state.pendingBlocks.filter(block =>
    block.data_block_name !== blockName
  );
}

export function addPendingDeleteBlock(element, id, originalDisplay) {
  state.pendingDeleteBlocks.push({
    element,
    id,
    originalDisplay: originalDisplay || 'block'
  });
}

export function clearPendingChanges() {
  state.pendingBlocks = [];
  state.pendingDeleteBlocks = [];
  state.blockOrderData = {};
}

export function getPendingBlocks() {
  return [...state.pendingBlocks];
}

export function getPendingDeleteBlocks() {
  return [...state.pendingDeleteBlocks];
}

export function hasChanges() {
  return state.pendingBlocks.length > 0 ||
         state.pendingDeleteBlocks.length > 0 ||
         Object.keys(state.blockOrderData).length > 0;
}

export function markSectionLoaded(sectionName) {
  state.loadedSections[sectionName] = true;
}

export function isSectionLoaded(sectionName) {
  return !!state.loadedSections[sectionName];
}

export function updateBlockCounter(blockType, blockNumber) {
  if (!state.blockCounters[blockType] || state.blockCounters[blockType] < blockNumber) {
    state.blockCounters[blockType] = blockNumber;
  }
}

export function setInitialized(value = true) {
  state.inited = value;
}

export function isInitialized() {
  return state.inited;
}

export function updateBlockOrderData(sectionName, orderData) {
  state.blockOrderData[sectionName] = orderData;

  // Make blockOrderData accessible globally for the publisher
  window.blockOrderData = state.blockOrderData;
}

export function getBlockOrderData() {
  return { ...state.blockOrderData };
}

export function hasBlockOrderChanges() {
  return Object.keys(state.blockOrderData).length > 0;
}