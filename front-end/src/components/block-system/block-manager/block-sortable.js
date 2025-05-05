import {getApiHeaders} from '../../auth';
import {config, getApiBaseUrl} from '../../../config/app-config';
import {apiPut} from '../../../utils/api';
import { getBaseType } from '../block-configs';
import {showErrorNotification, showSuccessNotification} from '../../../utils/notifications';
import {addPendingBlock, hasChanges, updateBlockOrderData} from './block-state';

const sortableState = {
    initialized: false,
    sections: new Map(),
    draggedElement: null,
    dragoverElement: null,
    dragStartY: 0,
    originalOrder: [],
    blockOrders: [],
    hasReordered: false,
    dragPosition: null // 'before' or 'after'
};

export function initSortable(sectionElement) {
    if (!sectionElement) return;

    const sectionName = sectionElement.getAttribute('data-section');
    if (!sectionName) return;

    if (sortableState.sections.has(sectionName)) return;

    const blocks = Array.from(sectionElement.children).filter(el =>
        el.hasAttribute('data-block-name')
    );

    if (!blocks.length) return;

    sortableState.sections.set(sectionName, {
        element: sectionElement,
        blocks: new Map()
    });

    blocks.forEach((block, index) => {
        initDraggableBlock(block, sectionName, index);
    });

    sectionElement.addEventListener('dragover', handleSectionDragOver);
    sectionElement.addEventListener('dragenter', handleSectionDragEnter);
    sectionElement.addEventListener('dragleave', handleSectionDragLeave);
    sectionElement.addEventListener('drop', handleSectionDrop);

    sortableState.initialized = true;
}

export function initDraggableBlock(blockElement, sectionName, initialOrder) {
    if (!blockElement) return;

    const blockId = blockElement.getAttribute('data-block-id');
    const blockName = blockElement.getAttribute('data-block-name');

    let order = initialOrder;
    if (blockElement.hasAttribute('data-order')) {
        const dataOrderStr = blockElement.getAttribute('data-order');
        if (dataOrderStr !== null && dataOrderStr !== undefined) {
            const dataOrder = parseInt(dataOrderStr, 10);
            if (!isNaN(dataOrder)) {
                order = dataOrder;
            }
        }
    }

    addDragHandle(blockElement);

    blockElement.setAttribute('draggable', 'true');
    blockElement.setAttribute('data-order', String(order));

    const sectionInfo = sortableState.sections.get(sectionName);
    if (sectionInfo) {
        sectionInfo.blocks.set(blockId || blockName, {
            element: blockElement,
            id: blockId || blockName,
            name: blockName,
            order: order
        });
    }

    blockElement.addEventListener('dragstart', handleDragStart);
    blockElement.addEventListener('dragend', handleDragEnd);
    blockElement.addEventListener('dragover', handleBlockDragOver);
    blockElement.addEventListener('dragleave', handleBlockDragLeave);
}

function addDragHandle(blockElement) {
    if (blockElement.querySelector('.block-drag-handle')) return;

    const handle = document.createElement('div');
    handle.className = 'block-drag-handle';
    handle.title = 'Drag to reorder';
    handle.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  `;

    handle.style.cssText = `
    position: absolute;
    top: 10px;
    left: 10px;
    width: 24px;
    height: 24px;
    cursor: grab;
    z-index: 10;
    opacity: 0.6;
    transition: opacity 0.3s;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

    handle.addEventListener('mouseover', () => {
        handle.style.opacity = '1';
    });

    handle.addEventListener('mouseout', () => {
        handle.style.opacity = '0.6';
    });

    if (getComputedStyle(blockElement).position === 'static') {
        blockElement.style.position = 'relative';
    }

    blockElement.appendChild(handle);
}

function handleDragStart(event) {
    sortableState.draggedElement = event.currentTarget;
    event.dataTransfer.effectAllowed = 'move';

    sortableState.dragStartY = event.clientY ||
        (event.touches && event.touches[0] ? event.touches[0].clientY : 0);

    const sectionElement = findParentSection(sortableState.draggedElement);
    if (sectionElement) {
        const sectionName = sectionElement.getAttribute('data-section');
        const sectionInfo = sortableState.sections.get(sectionName);

        if (sectionInfo) {
            sortableState.originalOrder = Array.from(sectionInfo.blocks.values())
                .sort((a, b) => a.order - b.order)
                .map(block => ({id: block.id, order: block.order}));
        }
    }

    sortableState.draggedElement.classList.add('dragging');

    const dragImage = sortableState.draggedElement.cloneNode(true);
    dragImage.style.opacity = '0.7';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);

    event.dataTransfer.setDragImage(dragImage, 10, 10);

    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

function handleDragEnd(event) {
    if (!sortableState.draggedElement) return;

    sortableState.draggedElement.classList.remove('dragging');

    const sectionElement = findParentSection(sortableState.draggedElement);
    if (sectionElement) {
        const blocks = sectionElement.querySelectorAll('[data-block-name]');
        blocks.forEach(block => {
            block.classList.remove('drag-over');
            block.classList.remove('drag-over-top');
            block.classList.remove('drag-over-bottom');
        });
    }

    if (sortableState.hasReordered) {
        const sectionElement = findParentSection(sortableState.draggedElement);
        if (sectionElement) {
            const sectionName = sectionElement.getAttribute('data-section');
            prepareOrderForSaving(sectionName);
        }
    }

    sortableState.draggedElement = null;
    sortableState.dragoverElement = null;
    sortableState.dragPosition = null;
    sortableState.hasReordered = false;
}

function handleBlockDragOver(event) {
    if (!sortableState.draggedElement || event.currentTarget === sortableState.draggedElement) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const block = event.currentTarget;
    const rect = block.getBoundingClientRect();
    const mouseY = event.clientY;
    const relativePosition = mouseY - rect.top;
    const isInTopHalf = relativePosition < rect.height / 2;

    // Remove other indicators first
    block.classList.remove('drag-over');
    block.classList.remove('drag-over-top');
    block.classList.remove('drag-over-bottom');

    // Add appropriate class based on position
    if (isInTopHalf) {
        block.classList.add('drag-over-top');
        sortableState.dragPosition = 'before';
    } else {
        block.classList.add('drag-over-bottom');
        sortableState.dragPosition = 'after';
    }

    sortableState.dragoverElement = block;
}

function handleBlockDragLeave(event) {
    const block = event.currentTarget;
    block.classList.remove('drag-over-top');
    block.classList.remove('drag-over-bottom');
}

function handleSectionDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function handleSectionDragEnter(event) {
    event.preventDefault();
}

function handleSectionDragLeave(event) {
    // Only clear if leaving the section, not just moving between blocks
    if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
        if (sortableState.dragoverElement) {
            sortableState.dragoverElement.classList.remove('drag-over-top');
            sortableState.dragoverElement.classList.remove('drag-over-bottom');
            sortableState.dragoverElement = null;
        }
    }
}

function handleSectionDrop(event) {
    event.preventDefault();

    if (!sortableState.draggedElement || !sortableState.dragoverElement) return;

    const draggedBlock = sortableState.draggedElement;
    const targetBlock = sortableState.dragoverElement;
    const position = sortableState.dragPosition;

    if (draggedBlock === targetBlock) return;

    const draggedBlockSection = findParentSection(draggedBlock);
    const targetBlockSection = findParentSection(targetBlock);

    if (!draggedBlockSection || !targetBlockSection) return;

    if (draggedBlockSection !== targetBlockSection) {
        showErrorNotification('Drag and drop between different sections is not supported');
        return;
    }

    const sectionElement = draggedBlockSection;
    const sectionName = sectionElement.getAttribute('data-section');
    const sectionInfo = sortableState.sections.get(sectionName);
    if (!sectionInfo) return;

    // Insert based on position
    if (position === 'before') {
        sectionElement.insertBefore(draggedBlock, targetBlock);
    } else {
        sectionElement.insertBefore(draggedBlock, targetBlock.nextSibling);
    }

    updateBlockOrder(sectionInfo);
    sortableState.hasReordered = true;

    // Clear indicators
    targetBlock.classList.remove('drag-over-top');
    targetBlock.classList.remove('drag-over-bottom');
    sortableState.dragoverElement = null;

    // Mark the blocks as reordered for visual feedback
    draggedBlock.classList.add('block-reordered');
    setTimeout(() => {
        draggedBlock.classList.remove('block-reordered');
    }, 1000);

    // Генерируем событие об изменении порядка блоков
    // Это новое событие, которое мы будем использовать для обновления нумерации
    const orderChangedEvent = new CustomEvent('blockOrderChanged', {
        detail: {
            section: sectionElement,
            blocks: sortableState.blockOrders
        }
    });
    document.dispatchEvent(orderChangedEvent);
}

function findParentSection(blockElement) {
    if (!blockElement) return null;

    let parent = blockElement.parentElement;
    while (parent) {
        if (parent.hasAttribute('data-section')) {
            return parent;
        }
        parent = parent.parentElement;
    }

    return null;
}

function updateBlockOrder(sectionInfo) {
    if (!sectionInfo || !sectionInfo.element) return;

    const blocks = Array.from(sectionInfo.element.querySelectorAll('[data-block-name]'));

    blocks.forEach((block, index) => {
        const blockId = block.getAttribute('data-block-id');
        const blockName = block.getAttribute('data-block-name');
        const id = blockId || blockName;

        const blockInfo = sectionInfo.blocks.get(id);

        if (blockInfo) {
            // Обновляем порядок в данных
            blockInfo.order = index;

            // Обновляем атрибут data-order элемента
            block.setAttribute('data-order', String(index));

            // Обновляем отображаемые номера, если это аккордеон
            if (sectionInfo.element.classList.contains('accordion-cases')) {
                const displayNumber = index + 1; // Начинаем с 1, а не с 0

                // Обновляем номер в заголовке
                const headerNumber = block.querySelector('.accordion-header .case-number');
                if (headerNumber) {
                    headerNumber.textContent = displayNumber;
                }

                // Обновляем номер в развернутом контенте
                const contentNumber = block.querySelector('.accordion-content .case-number');
                if (contentNumber) {
                    contentNumber.textContent = displayNumber;
                }
            }
        }
    });

    sortableState.blockOrders = Array.from(sectionInfo.blocks.values())
        .map(block => {
            try {
                const blockId = block.id;
                // For newly added blocks without an ID
                if (!blockId || blockId === block.name) {
                    return null;
                }

                return {
                    block_id: blockId,
                    order: block.order
                };
            } catch (e) {
                console.warn(`Error parsing block ID: ${block.id}`, e);
                return null;
            }
        })
        .filter(item => item !== null);
}

function prepareOrderForSaving(sectionName) {
    if (!sortableState.blockOrders.length) return;

    // Найдем элемент секции
    const sectionElement = document.querySelector(`[data-section="${sectionName}"]`);
    if (!sectionElement) return;

    // Используем id элемента, если есть, иначе используем класс
    const sectionId = sectionElement.id || sectionElement.getAttribute('class');

    const requestData = {
        parent_block: sectionId,
        block_orders: sortableState.blockOrders
    };

    // Store the reordering to be published later
    updateBlockOrderData(sectionName, requestData);
    showSuccessNotification('Block order will be updated after publishing changes');
}

// И функцию saveOrderToServer
async function saveOrderToServer(sectionName, requestData) {
    try {
        await apiPut(config.api.paths.reorderBlocks, requestData);
        showSuccessNotification('Block order successfully updated');
        return true;
    } catch (error) {
        console.error('Error updating block order:', error);
        showErrorNotification('Failed to update block order');

        // Restore original order
        const sectionElement = document.querySelector(`[data-section="${sectionName}"]`);
        if (sectionElement) {
            restoreOriginalOrder(sectionElement);
        }
        return false;
    }
}

function restoreOriginalOrder(sectionElement) {
    if (!sectionElement || !sortableState.originalOrder.length) return;

    const sectionName = sectionElement.getAttribute('data-section');
    const sectionInfo = sortableState.sections.get(sectionName);

    if (!sectionInfo) return;

    const sortedBlocks = sortableState.originalOrder
        .map(item => {
            const blockInfo = sectionInfo.blocks.get(item.id.toString());
            return blockInfo ? blockInfo.element : null;
        })
        .filter(Boolean);

    sortedBlocks.forEach(blockElement => {
        sectionElement.appendChild(blockElement);
    });

    updateBlockOrder(sectionInfo);
}

export function addDragAndDropStyles() {
    const styleId = 'block-draggable-styles';

    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
    [draggable=true] {
      user-select: none;
      -webkit-user-drag: element;
      position: relative;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .dragging {
      opacity: 0.6;
      border: 2px dashed #4285f4 !important;
      transform: scale(0.98);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    
    .drag-over-top {
      border-top: 2px solid #4285f4;
      padding-top: 8px;
      margin-top: -8px;
      position: relative;
    }
    
    .drag-over-top::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #4285f4;
      z-index: 5;
    }
    
    .drag-over-bottom {
      border-bottom: 2px solid #4285f4;
      padding-bottom: 8px;
      margin-bottom: -8px;
      position: relative;
    }
    
    .drag-over-bottom::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #4285f4;
      z-index: 5;
    }
    
    .block-drag-handle:hover {
      opacity: 1 !important;
      transform: scale(1.1);
    }
    
    .block-drag-handle:active {
      cursor: grabbing;
      cursor: -webkit-grabbing;
    }
    
    .block-drag-handle:active svg {
      transform: scale(0.9);
    }
    
    @keyframes blockHighlight {
      0% { box-shadow: 0 0 0 rgba(66, 133, 244, 0); }
      50% { box-shadow: 0 0 10px rgba(66, 133, 244, 0.5); }
      100% { box-shadow: 0 0 0 rgba(66, 133, 244, 0); }
    }
    
    .block-reordered {
      animation: blockHighlight 1s ease-in-out;
    }
  `;

    document.head.appendChild(style);
}

export function initAllSortables() {
    addDragAndDropStyles();

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(initSortable);
}

export function makeBlockDraggable(blockElement) {
    if (!blockElement) return;

    const sectionElement = findParentSection(blockElement);
    if (!sectionElement) return;

    const sectionName = sectionElement.getAttribute('data-section');
    if (!sectionName) return;

    // Получаем ID секции или используем класс
    const sectionId = sectionElement.id || sectionElement.getAttribute('class');

    let sectionInfo = sortableState.sections.get(sectionName);
    if (!sectionInfo) {
        initSortable(sectionElement);
        sectionInfo = sortableState.sections.get(sectionName);
    }

    if (!sectionInfo) return;

    const lastOrder = Math.max(
        ...Array.from(sectionInfo.blocks.values()).map(block => block.order),
        -1
    ) + 1;

    initDraggableBlock(blockElement, sectionName, lastOrder);
}

// Export function to publish block orders from block-publisher.js
export function publishBlockOrders() {
    const orderData = window.blockOrderData || {};
    const promises = [];

    for (const sectionName in orderData) {
        promises.push(saveOrderToServer(sectionName, orderData[sectionName]));
    }

    return promises;
}

export const sortableAPI = {
    initSortable,
    initAllSortables,
    makeBlockDraggable,
    publishBlockOrders
};