import { config } from '../../config/app-config';

export function initAccordion(options = {}) {
    const settings = {
        ...config.accordion,
        ...options
    };

    // Find all elements with data-section="accordion"
    const accordionSections = document.querySelectorAll('[data-section="accordion"]');

    if (!accordionSections.length) {
        console.log('No accordion sections found on the page');
        return;
    }

    // Initialize each accordion section
    accordionSections.forEach((accordionSection, index) => {
        // Проверяем, есть ли в аккордеоне элементы (поиск по .accordion-case-item)
        const hasItems = accordionSection.querySelectorAll('.accordion-case-item').length > 0;

        // Если аккордеон пустой и имеет класс accordion-cases, создаем каркас
        if (!hasItems && accordionSection.classList.contains('accordion-cases')) {
            createEmptyAccordionStructure(accordionSection);
        } else {
            // Инициализируем существующие элементы аккордеона
            initAccordionItems(accordionSection);
        }

        console.log(`Accordion section #${index} ready with ${accordionSection.querySelectorAll('.accordion-case-item').length} cases`);
    });
}

function initAccordionItems(accordionSection) {
    // Получаем все заголовки из контентной части для отображения в свернутом состоянии
    const accordionItems = accordionSection.querySelectorAll('.accordion-case-item');

    accordionItems.forEach(item => {
        const headerText = item.querySelector('.header-text');
        const contentTitle = item.querySelector('.description-half h4');

        // Если есть заголовок в контенте, копируем его в хедер для свернутого состояния
        if (headerText && contentTitle) {
            // Подписываемся на изменения в заголовке контента
            const observer = new MutationObserver((mutations) => {
                headerText.textContent = contentTitle.textContent;
            });

            // Начинаем наблюдение
            observer.observe(contentTitle, {
                childList: true,
                characterData: true,
                subtree: true
            });

            // Инициализируем текст заголовка
            headerText.textContent = contentTitle.textContent;
        }
    });
}

function createEmptyAccordionStructure(accordionSection) {
    console.log('Creating empty accordion structure for', accordionSection);

    // Если на странице есть инициализированный content-editor,
    // подключаем новые элементы к нему
    if (window.loadContentForNewElements) {
        const contentElements = accordionSection.querySelectorAll('[data-content]');
        window.loadContentForNewElements(contentElements);
    } else if (typeof loadContentForNewElements === 'function') {
        try {
            // Пробуем импортировать необходимую функцию
            const contentElements = accordionSection.querySelectorAll('[data-content]');
            loadContentForNewElements(contentElements);
        } catch (error) {
            console.warn('Could not load content for accordion elements:', error);
        }
    }
}

export function hasAccordion() {
    return document.querySelectorAll('[data-section="accordion"]').length > 0;
}

export function reinitializeAccordion() {
    console.log('Reinitializing all accordions...');
    initAccordion();
}






/**
 * Функция для обновления порядковых номеров элементов аккордеона
 */
export function updateAccordionNumbers(accordionSection) {
    if (!accordionSection) {
        // Если секция не передана, ищем все секции аккордеона
        const accordionSections = document.querySelectorAll('[data-section="accordion"]');
        accordionSections.forEach(section => updateAccordionNumbersInSection(section));
    } else {
        updateAccordionNumbersInSection(accordionSection);
    }
}

function updateAccordionNumbersInSection(section) {
    if (!section || !section.classList.contains('accordion-cases')) {
        return;
    }

    // Получаем все элементы аккордеона и сортируем их по атрибуту data-order
    const items = Array.from(section.querySelectorAll('.accordion-case-item'));

    if (!items.length) return;

    // Сортируем элементы по атрибуту data-order
    items.sort((a, b) => {
        const orderA = parseInt(a.getAttribute('data-order') || '0', 10);
        const orderB = parseInt(b.getAttribute('data-order') || '0', 10);
        return orderA - orderB;
    });

    // Обновляем номера
    items.forEach((item, index) => {
        // Используем index + 1 для отображения (начиная с 1)
        const displayNumber = index + 1;

        // Обновляем номер в заголовке
        const headerNumber = item.querySelector('.accordion-header .case-number');
        if (headerNumber) {
            headerNumber.textContent = displayNumber;
        }

        // Обновляем номер в развернутом контенте
        const contentNumber = item.querySelector('.accordion-content .case-number');
        if (contentNumber) {
            contentNumber.textContent = displayNumber;
        }
    });
}

/**
 * Хук для обновления нумерации после перетаскивания блоков
 * Добавляет слушатель событий для перехвата изменений порядка блоков
 */
export function setupDragDropNumbersUpdate() {
    // Слушаем событие завершения перетаскивания блоков
    document.addEventListener('blockOrderChanged', (event) => {
        const sectionElement = event.detail?.section;
        if (sectionElement) {
            updateAccordionNumbersInSection(sectionElement);
        } else {
            updateAccordionNumbers();
        }
    });

    // Также можно обновлять номера при любых изменениях в структуре аккордеона
    const accordionSections = document.querySelectorAll('[data-section="accordion"]');

    accordionSections.forEach(section => {
        // Создаем наблюдатель за изменениями в DOM
        const observer = new MutationObserver((mutations) => {
            // При изменениях в DOM обновляем нумерацию
            updateAccordionNumbersInSection(section);
        });

        // Настраиваем наблюдение за добавлением/удалением элементов
        observer.observe(section, {
            childList: true, // Следим за добавлением/удалением дочерних элементов
            subtree: false,  // Не следим за изменениями во вложенных элементах
            attributes: true, // Следим за изменениями атрибутов
            attributeFilter: ['data-order'] // Только за изменениями атрибута data-order
        });
    });
}

// Функция для инициализации номеров в существующих аккордеонах
export function initAccordionNumbers() {
    updateAccordionNumbers();
    setupDragDropNumbersUpdate();
}