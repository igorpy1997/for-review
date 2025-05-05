import { getBlockCreator, getBaseType } from '../block-configs';
import { loadContentForNewElements } from '../../content-editor-src';
import { isAuthenticated } from '../../auth';
import { reinitializeCarousel } from '../../carousel';
import { updateBlockCounter } from './block-state';
import { addDeleteButton } from './block-editor';
import { makeBlockDraggable } from './block-sortable';


export function createAndTrackBlock(block, sectionElement) {
  // Используем id элемента, если есть, иначе используем класс
  const sectionId = sectionElement.id || sectionElement.getAttribute('class');
  const {class_name: blockType, data_block_name: blockName, order} = block;
  const createBlock = getBlockCreator(sectionId, blockType);

  if (!createBlock) {
    console.warn(`[BlockSystem] Block creator not found: ${blockType} for section ${sectionId}`);
    return null;
  }

  const blockElement = createBlock(block, sectionElement);

  if (order !== undefined && order !== null) {
    blockElement.setAttribute('data-order', String(order));
  } else {
    blockElement.setAttribute('data-order', '0');
  }

  if (isAuthenticated()) {
    if (block.id) {
      addDeleteButton(blockElement, block.id);
    } else {
      addDeleteButton(blockElement);
    }

    blockElement.setAttribute('draggable', 'true');
    makeBlockDraggable(blockElement);
  }

  const match = blockName?.match(/^(.+)-(\d+)$/);
  if (match && match[1] === blockType) {
    const blockNumber = parseInt(match[2], 10);
    updateBlockCounter(blockType, blockNumber);
  }

  return blockElement;
}

export function loadContentForBlocks(element) {
  const contentElements = element.querySelectorAll('[data-content]');
  loadContentForNewElements(contentElements);
}

export function initCarousel() {
  try {
    // Обновленная логика инициализации карусели
    window.carousel = window.carousel || {};
    window.carousel.initialized = false;

    // Используем обновленную функцию reinitializeCarousel,
    // которая будет искать секции с data-section="carousel"
    reinitializeCarousel();
  } catch (error) {
    console.error('[BlockSystem] Carousel initialization error:', error);
  }
}

export function findParentSection(element) {
  let parent = element;

  while (parent) {
    if (parent.hasAttribute && parent.hasAttribute('data-section')) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}