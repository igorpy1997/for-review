import { isAuthenticated } from '../../auth';
import { fetchBlocksBySection } from './block-api';
import { createAndTrackBlock, loadContentForBlocks, initCarousel } from './block-renderer';
import { createSectionControls } from './block-controls';
import { markSectionLoaded, isSectionLoaded, setInitialized } from './block-state';
import { addNewBlock, deleteBlock } from './block-editor';
import { publishBlockChanges } from './block-publisher';
import { initSortable, initAllSortables, makeBlockDraggable, addDragAndDropStyles } from './block-sortable';
import { getBaseType } from '../block-configs';


export async function initBlockSystem() {
  const sections = document.querySelectorAll('[data-section]');
  if (!sections.length) {
    return;
  }

  try {
    for (const section of sections) {
      // Вместо имени класса используем id элемента, с fallback на класс
      const sectionId = section.id || section.getAttribute('class');
      console.log(`Using section ID: ${sectionId}`);

      if (!isSectionLoaded(sectionId)) {
        const blocks = await fetchBlocksBySection(sectionId);

        if (blocks.length) {
          // Важное изменение: сортируем блоки по возрастанию order
          const sortedBlocks = blocks.sort((a, b) => {
            const orderA = a.order !== undefined ? parseInt(a.order, 10) : parseInt(a.id, 10);
            const orderB = b.order !== undefined ? parseInt(b.order, 10) : parseInt(b.id, 10);
            return orderA - orderB;
          });

          console.log('Sorted blocks:', sortedBlocks);

          const nonBlockElements = Array.from(section.children).filter(
              child => !child.hasAttribute('data-block-name')
          );

          section.innerHTML = '';

          nonBlockElements.forEach(element => section.appendChild(element));

          sortedBlocks.forEach(block => createAndTrackBlock(block, section));
        }

        markSectionLoaded(sectionId);
      }

      loadContentForBlocks(section);

      if (isAuthenticated()) {
        createSectionControls(section);
        initSortable(section);
      }
    }

    setInitialized(true);

    if (isAuthenticated()) {
      addDragAndDropStyles();
    }

    setTimeout(initCarousel, 0);
  } catch (error) {
    console.error('[BlockSystem] Initialization error:', error);
  }
}

export function processNewBlock(blockElement) {
  if (!blockElement) return;

  loadContentForBlocks(blockElement);

  if (isAuthenticated()) {
    makeBlockDraggable(blockElement);
  }
}

export const blockSystemAPI = {
  addBlock: addNewBlock,
  publishChanges: publishBlockChanges,
  deleteBlock: deleteBlock,
  initBlockSystem,
  reinitCarousel: initCarousel,
  processNewBlock: processNewBlock,
  makeDraggable: makeBlockDraggable
};