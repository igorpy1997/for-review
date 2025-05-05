import { getAvailableBlockTypes, getBlockDefinition } from '../block-configs';
import { verifyAuth, getAuthToken } from '../../auth';
import { addNewBlock } from './block-editor';
import { publishBlockChanges } from './block-publisher';
import { getBaseType } from '../block-configs';


export function createSectionControls(sectionElement) {
    verifyAuth(getAuthToken())
        .then(() => {
            // Используем id если есть, иначе используем класс
            const sectionId = sectionElement.id || sectionElement.getAttribute('class');
            const availableBlocks = getAvailableBlockTypes(sectionId);

            // if (!availableBlocks.length) {
            //     return;
            // }

            const controlPanel = document.createElement('div');
            controlPanel.className = 'section-controls';
            controlPanel.style.cssText = `
        margin-bottom: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 10px;
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      `;

            const sectionTitle = document.createElement('span');
            sectionTitle.textContent = `Section: ${sectionId}`;
            sectionTitle.style.fontWeight = '500';
            sectionTitle.style.marginRight = 'auto';

            controlPanel.appendChild(sectionTitle);

            if (availableBlocks.length > 1) {
                const blockSelect = createBlockTypeSelect(availableBlocks);
                const addButton = createStyledButton('Add Block', () => {
                    const selectedBlockType = blockSelect.value;
                    addNewBlock(sectionElement, selectedBlockType);
                });

                controlPanel.appendChild(blockSelect);
                controlPanel.appendChild(addButton);
            } else {
                controlPanel.appendChild(
                    createStyledButton('Add Block', () => addNewBlock(sectionElement, availableBlocks[0]))
                );
            }

            controlPanel.appendChild(
                createStyledButton('Publish Block Changes', publishBlockChanges)
            );

            sectionElement.parentNode.insertBefore(controlPanel, sectionElement);
        })
        .catch(error => {
            console.error('[BlockSystem] Authorization error for section panel:', error);
        });
}


function createBlockTypeSelect(blockTypes) {
    const select = document.createElement('select');
    select.style.cssText = `
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  `;

    blockTypes.forEach(blockType => {
        const option = document.createElement('option');
        const definition = getBlockDefinition(blockType);
        option.value = blockType;
        option.textContent = definition?.title || blockType;
        select.appendChild(option);
    });

    return select;
}

function createStyledButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
    padding: 8px 16px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.3s;
  `;
    button.addEventListener('mouseover', () => button.style.backgroundColor = '#3367d6');
    button.addEventListener('mouseout', () => button.style.backgroundColor = '#4285f4');
    button.addEventListener('click', onClick);
    return button;
}