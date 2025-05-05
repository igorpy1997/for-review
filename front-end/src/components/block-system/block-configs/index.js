import {createDiagnosticCard, diagnosticCardProps} from './block-types/diagnostic-card';
import {createAccordionItem, accordionItemProps} from './block-types/accordion-item';

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

export function getBaseType(typeId) {
    // Если это ID формата "accordion-cases-2", извлекаем базовую часть "accordion-cases"
    const match = typeId.match(/^([a-zA-Z-]+)(-\d+)?$/);
    return match ? match[1] : typeId;
}

export function getBlockCreator(parentType, blockType) {
    // Извлекаем базовый тип из ID
    const baseParentType = getBaseType(parentType);

    if (!blockCreators[baseParentType] || !blockCreators[baseParentType][blockType]) {
        return null;
    }
    return blockCreators[baseParentType][blockType];
}

export function getAvailableBlockTypes(parentType) {
    // Извлекаем базовый тип из ID
    const baseParentType = getBaseType(parentType);

    if (!blockCreators[baseParentType]) {
        return [];
    }
    return Object.keys(blockCreators[baseParentType]);
}

export function getBlockDefinition(blockType) {
    return blockDefinitions[blockType] || null;
}

export function canAddBlockToParent(parentType, blockType) {
    const definition = getBlockDefinition(blockType);
    if (!definition || !definition.allowedParents) {
        return false;
    }

    // Извлекаем базовый тип из ID родителя
    const baseParentType = getBaseType(parentType);

    // Проверяем, разрешен ли базовый тип родителя
    return definition.allowedParents.includes(baseParentType);
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
    getBaseType,
    getBlockCreator,
    getAvailableBlockTypes,
    getBlockDefinition,
    canAddBlockToParent,
    registerBlockType,
    registerParentType
};