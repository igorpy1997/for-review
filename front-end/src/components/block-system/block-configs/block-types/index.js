import { createDiagnosticCard, diagnosticCardProps } from './diagnostic-card';
import { createAccordionItem, accordionItemProps } from './accordion-item';

export const blockCreators = {
  'cards-book': {
    'diagnostic-card': createDiagnosticCard
  },
  'accordion-cases': {
    'case': createAccordionItem
  }
};

export const blockDefinitions = {
  'diagnostic-card': diagnosticCardProps,
  'case': accordionItemProps
};

export function getBlockCreator(parentType, blockType) {
  if (!blockCreators[parentType] || !blockCreators[parentType][blockType]) {
    return null;
  }
  return blockCreators[parentType][blockType];
}

export function getAvailableBlockTypes(parentType) {
  if (!blockCreators[parentType]) {
    return [];
  }
  return Object.keys(blockCreators[parentType]);
}

export function getBlockDefinition(blockType) {
  return blockDefinitions[blockType] || null;
}

export function canAddBlockToParent(parentType, blockType) {
  const definition = getBlockDefinition(blockType);
  if (!definition || !definition.allowedParents) {
    return false;
  }
  return definition.allowedParents.includes(parentType);
}

export function registerBlockType(blockType, definition, creator, parentTypes) {
  if (typeof creator !== 'function') {
    return;
  }

  if (!Array.isArray(parentTypes) || !parentTypes.length) {
    return;
  }

  blockDefinitions[blockType] = definition;

  parentTypes.forEach(parentType => {
    if (!blockCreators[parentType]) {
      blockCreators[parentType] = {};
    }
    blockCreators[parentType][blockType] = creator;
  });
}

export function registerParentType(parentType) {
  if (!blockCreators[parentType]) {
    blockCreators[parentType] = {};
    return true;
  }
  return false;
}

export const blockConfigsAPI = {
  getBlockCreator,
  getAvailableBlockTypes,
  getBlockDefinition,
  canAddBlockToParent,
  registerBlockType,
  registerParentType
};