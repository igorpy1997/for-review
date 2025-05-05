import {
  hasChanges,
  getPendingBlocks,
  getPendingDeleteBlocks,
  clearPendingChanges,
  getBlockOrderData,
  hasBlockOrderChanges
} from './block-state';
import {
  checkAuthForBlockOperations,
  createBlock,
  deleteBlockById
} from './block-api';
import { initCarousel } from './block-renderer';
import { addDeleteButton, deleteBlock } from './block-editor';
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifications';
import { makeBlockDraggable } from './block-sortable';
import { publishBlockOrders } from './block-sortable';

export async function publishBlockChanges() {
  if (!checkAuthForBlockOperations()) return;

  if (!hasChanges()) {
    showErrorNotification('No changes to publish');
    return;
  }

  try {
    const pendingBlocks = getPendingBlocks();
    const pendingDeleteBlocks = getPendingDeleteBlocks();
    const orderPromises = [];

    if (pendingBlocks.length > 0) {
      const createResults = await Promise.all(
          pendingBlocks.map(block => createBlock(block))
      );

      createResults.forEach((data, index) => {
        const blockData = pendingBlocks[index];
        const blockElement = document.querySelector(`[data-block-name="${blockData.data_block_name}"]`);

        if (blockElement && data.id) {
          blockElement.setAttribute('data-block-id', data.id);

          const deleteButton = blockElement.querySelector('.block-delete-button');
          if (deleteButton) {
            const newDeleteButton = deleteButton.cloneNode(true);
            deleteButton.parentNode.replaceChild(newDeleteButton, deleteButton);
            newDeleteButton.addEventListener('click', (e) => {
              e.stopPropagation();
              deleteBlock(blockElement, data.id);
            });
          } else {
            addDeleteButton(blockElement, data.id);
          }

          if (!blockElement.hasAttribute('draggable') || blockElement.getAttribute('draggable') !== 'true') {
            makeBlockDraggable(blockElement);
          }

          blockElement.classList.add('block-reordered');
          setTimeout(() => {
            blockElement.classList.remove('block-reordered');
          }, 1000);
        }
      });
    }



    // Now publish block order changes if any
    if (hasBlockOrderChanges()) {
      try {
        // Get promises from the sortable module
        const orderPromises = publishBlockOrders();
        if (orderPromises.length > 0) {
          await Promise.all(orderPromises);
        }
      } catch (orderError) {
        console.error('[BlockSystem] Error publishing block order changes:', orderError);
        showErrorNotification('Error updating block order');
      }
    }

      if (pendingDeleteBlocks.length > 0) {
      await Promise.all(
          pendingDeleteBlocks.map(item =>
              deleteBlockById(item.id)
                  .then(() => {
                    if (item.element && item.element.parentNode) {
                      item.element.remove();
                    }
                    return true;
                  })
                  .catch(error => {
                    console.error(`[BlockSystem] Error deleting block ${item.id}:`, error);
                    if (item.element) {
                      item.element.style.display = item.originalDisplay || 'block';
                    }
                    return false;
                  })
          )
      );
    }

    clearPendingChanges();
    showSuccessNotification('Block changes published successfully!');

    setTimeout(initCarousel, 300);
  } catch (error) {
    console.error('[BlockSystem] Error publishing blocks:', error);
    showErrorNotification('Error publishing block changes. Check console for details.');
  }
}