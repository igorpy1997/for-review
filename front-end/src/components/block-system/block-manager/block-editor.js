import {getBlockCreator, getBaseType, getAvailableBlockTypes} from '../block-configs';
import {showErrorNotification, showSuccessNotification} from '../../../utils/notifications';
import {isAuthenticated} from '../../auth';
import {createAndTrackBlock, loadContentForBlocks, initCarousel} from './block-renderer';
import {checkAuthForBlockOperations} from './block-api';
import {
    getNextBlockNumber,
    addPendingBlock,
    removePendingBlock,
    addPendingDeleteBlock
} from './block-state';
import {makeBlockDraggable} from './block-sortable';


export function addDeleteButton(blockElement, blockId) {
    if (!blockElement) return;

    if (blockElement.querySelector('.block-delete-button')) return;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'block-delete-button';
    deleteButton.innerHTML = '&#10006;';
    deleteButton.title = 'Delete block';
    deleteButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 4px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    opacity: 0.8;
    transition: opacity 0.3s;
  `;

    deleteButton.addEventListener('mouseover', () => {
        deleteButton.style.opacity = '1';
    });

    deleteButton.addEventListener('mouseout', () => {
        deleteButton.style.opacity = '0.8';
    });

    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBlock(blockElement, blockId);
    });

    if (getComputedStyle(blockElement).position === 'static') {
        blockElement.style.position = 'relative';
    }

    blockElement.appendChild(deleteButton);
}


export function deleteBlock(blockElement, blockId) {
    if (!checkAuthForBlockOperations()) return;

    if (confirm('Are you sure you want to delete this block? This action cannot be undone.')) {
        if (blockId) {
            addPendingDeleteBlock(
                blockElement,
                blockId,
                blockElement.style.display || 'block'
            );

            blockElement.style.display = 'none';
            showSuccessNotification('Block will be deleted after publishing changes');
        } else {
            const blockName = blockElement.getAttribute('data-block-name');
            blockElement.remove();
            removePendingBlock(blockName);
            showSuccessNotification('New block deleted');
        }
    }
}


export function addNewBlock(sectionElement, blockType) {
    if (!checkAuthForBlockOperations()) return null;

    // Используем id элемента, если есть, иначе используем класс
    const sectionId = sectionElement.id || sectionElement.getAttribute('class');
    // Получаем базовый тип для отладки
    const baseType = getBaseType(sectionId);

    const availableBlockTypes = getAvailableBlockTypes(sectionId);

    if (!availableBlockTypes.includes(blockType)) {
        console.error(`[BlockSystem] Block type ${blockType} is not allowed in section ${sectionId} (base type: ${baseType})`);
        console.log(`[BlockSystem] Available block types for ${baseType}:`, availableBlockTypes);
        showErrorNotification(`Block type ${blockType} is not allowed in section ${sectionId}`);
        return null;
    }

    const blockNumber = getNextBlockNumber(blockType);
    const blockName = `${blockType}-${blockNumber}`;

    let maxOrder = -1;
    const existingBlocks = Array.from(sectionElement.querySelectorAll('[data-block-id]'));

    existingBlocks.forEach(block => {
        if (block.hasAttribute('data-order')) {
            const orderStr = block.getAttribute('data-order');
            if (orderStr !== null && orderStr !== undefined) {
                const orderNum = parseInt(orderStr, 10);
                if (!isNaN(orderNum)) {
                    maxOrder = Math.max(maxOrder, orderNum);
                }
            }
        }
    });

    const blockData = {
        class_name: blockType,
        data_block_name: blockName,
        parent_block: sectionId,
        order: maxOrder + 1
    };

    const createBlock = getBlockCreator(sectionId, blockType);
    if (!createBlock) {
        console.error(`[BlockSystem] Block creator not found for type: ${blockType} in section ${sectionId} (base type: ${baseType})`);
        console.log(`[BlockSystem] Available creators:`, blockCreators);
        showErrorNotification(`Block creator not found for type: ${blockType}`);
        return null;
    }

    const createdBlock = createBlock(blockData, sectionElement);
    createdBlock.setAttribute('data-order', String(blockData.order));
    addPendingBlock(blockData);

    addDeleteButton(createdBlock);

    loadContentForBlocks(createdBlock);

    showSuccessNotification(`Added new ${blockType} block`);

    // Immediately make the block draggable even without an ID
    createdBlock.setAttribute('draggable', 'true');
    makeBlockDraggable(createdBlock);

    setTimeout(initCarousel, 300);

    return createdBlock;
}