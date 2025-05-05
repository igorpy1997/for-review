// Модифицируем функцию createAccordionItem, добавляя кнопку закрытия внутрь контента и номер кейса

// Модифицируем функцию createAccordionItem, добавляя кнопку закрытия внутрь контента и номер кейса

export function createAccordionItem(block, parent) {
    const blockName = block.data_block_name;
    const caseNumber = blockName.replace('case-', '');

    // Получаем порядковый номер из order + 1 (чтобы начинать с 1, а не с 0)
    // Если order не определен, используем номер из имени блока или 1 как значение по умолчанию
    const displayNumber = block.order !== undefined ? parseInt(block.order, 10) + 1 : (parseInt(caseNumber, 10) || 1);

    // Создаем основной контейнер аккордеона
    const row = document.createElement('div');
    row.className = 'accordion-case-item';
    row.setAttribute('data-block-name', blockName);

    if (block.id && block.id !== 'undefined') {
        row.setAttribute('data-block-id', block.id);
    }

    if (block.order !== undefined && block.order !== null) {
        row.setAttribute('data-order', String(block.order));
    } else {
        row.setAttribute('data-order', '0');
    }

    row.style.position = 'relative';

    // Создаем заголовок аккордеона, который всегда виден
    // Используем displayNumber для отображения порядкового номера
    const headerHTML = `
    <div class="accordion-header">
        <div class="case-number">${displayNumber}</div>
        <h4 class = "header-text-accordion" data-content="case-title-${caseNumber}"></h4>
        <div class="accordion-toggle" aria-label="Развернуть">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_106010_1019)">
                <circle cx="25" cy="25" r="25" fill="white" />
                <path d="M25.0011 15.9082V35.6052M25.0011 35.6052L34.092 27.2718M25.0011 35.6052L15.9102 27.2718" stroke="#0090B8" stroke-width="2.27273" stroke-linecap="round" />
              </g>
              <defs>
                <clipPath id="clip0_106010_1019">
                  <rect width="50" height="50" fill="white" />
                </clipPath>
              </defs>
            </svg>
        </div>
    </div>
    `;

    // Создаем раскрывающийся контент, который скрыт по умолчанию
    // Добавляем кнопку закрытия внутрь контента
    const contentHTML = `
    <div class="accordion-content collapsed">
        <div class="accordion-content-inner">
            <div class="close-accordion" aria-label="Свернуть" type="button">
            <div class="close-accordion">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_104239_7352)">
                    <circle cx="25" cy="25" r="25" fill="white" />
                    <path d="M24.9989 35.6074V15.9105M24.9989 15.9105L15.908 24.2438M24.9989 15.9105L34.0898 24.2438" stroke="#0090B8" stroke-width="2.27273" stroke-linecap="round" />
                  </g>
                  <defs>
                    <clipPath id="clip0_104239_7352">
                      <rect width="50" height="50" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
           </div>


            </div>
            <div class="col-lg-6 image-half">
                <div class="case-number">${displayNumber}</div>
                <div class="image-container">
                    <img class="case-image" src="" alt="" data-content="${blockName}-image" data-type="image">
                </div>
            </div>
            <div class="col-lg-6 description-half">
                <h4 data-content="case-title-${caseNumber}"></h4>
                <p data-content="case-description-${caseNumber}" data-type="textarea"></p>
                <a class="case-link" href="#">
                    Читати повний кейс
                </a>
            </div>
        </div>
    </div>
    `;

    // Объединяем HTML
    row.innerHTML = headerHTML + contentHTML;

    // Добавляем обработчик клика
    const toggleButton = row.querySelector('.accordion-toggle');
    const header = row.querySelector('.accordion-header');
    const content = row.querySelector('.accordion-content');
    const closeButton = row.querySelector('.close-accordion');

    const toggleAccordion = (e) => {
        e.stopPropagation();

        const isCollapsed = content.classList.contains('collapsed');

        // Если раскрываем текущий элемент, закрываем все остальные
        if (isCollapsed) {
            // Находим все открытые элементы аккордеона в текущей секции
            const sectionElement = findParentSection(row);
            if (sectionElement) {
                const expandedItems = sectionElement.querySelectorAll('.accordion-case-expanded');
                expandedItems.forEach(item => {
                    if (item !== row) {
                        // Закрываем другие элементы
                        collapseAccordionItem(item);
                    }
                });
            }
        }

        // Переключаем классы для текущего элемента
        content.classList.toggle('collapsed', !isCollapsed);
        content.classList.toggle('expanded', isCollapsed);
        row.classList.toggle('accordion-case-expanded', isCollapsed);

        // Обновляем иконку
        const icon = toggleButton.querySelector('.accordion-icon');
        if (icon) {
            icon.textContent = isCollapsed ? '−' : '+';
        }

        // Обновляем доступность
        toggleButton.setAttribute('aria-label', isCollapsed ? 'Свернуть' : 'Развернуть');

        // Анимируем высоту и скрываем/показываем header
        if (isCollapsed) {
            // Разворачиваем
            content.style.display = 'block';
            const scrollHeight = content.scrollHeight;
            content.style.maxHeight = `${scrollHeight}px`;

            // Скрываем заголовок
            header.style.display = 'none';
        } else {
            // Сворачиваем
            content.style.maxHeight = '0';

            // Показываем заголовок
            header.style.display = 'flex';

            // После завершения анимации скрываем элемент полностью
            setTimeout(() => {
                if (content.classList.contains('collapsed')) {
                    content.style.display = 'none';
                }
            }, 500); // время должно соответствовать времени transition в CSS
        }
    };

    // Функция для закрытия элемента аккордеона
    function collapseAccordionItem(accordionItem) {
        const itemHeader = accordionItem.querySelector('.accordion-header');
        const itemContent = accordionItem.querySelector('.accordion-content');
        const itemToggleButton = accordionItem.querySelector('.accordion-toggle');

        // Сворачиваем контент
        itemContent.classList.remove('expanded');
        itemContent.classList.add('collapsed');
        accordionItem.classList.remove('accordion-case-expanded');

        // Обновляем иконку если есть
        const icon = itemToggleButton ? itemToggleButton.querySelector('.accordion-icon') : null;
        if (icon) {
            icon.textContent = '+';
        }

        // Обновляем доступность
        if (itemToggleButton) {
            itemToggleButton.setAttribute('aria-label', 'Развернуть');
        }

        // Анимируем высоту
        itemContent.style.maxHeight = '0';

        // Показываем заголовок
        if (itemHeader) {
            itemHeader.style.display = 'flex';
        }

        // После завершения анимации скрываем элемент полностью
        setTimeout(() => {
            if (itemContent.classList.contains('collapsed')) {
                itemContent.style.display = 'none';
            }
        }, 500);
    }

    // Вспомогательная функция для поиска родительской секции
    function findParentSection(element) {
        let parent = element.parentElement;
        while (parent) {
            if (parent.hasAttribute('data-section')) {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    }

    // Клик по кнопке или заголовку раскрывает аккордеон
    toggleButton.addEventListener('click', toggleAccordion);
    header.addEventListener('click', function(e) {
        // Клик по заголовку, но не по кнопке
        if (e.target !== toggleButton && !toggleButton.contains(e.target)) {
            toggleAccordion(e);
        }
    });

    // Клик по кнопке закрытия внутри контента
    closeButton.addEventListener('click', toggleAccordion);

    // По умолчанию контент скрыт
    content.style.maxHeight = '0';
    content.style.display = 'none';

    parent.appendChild(row);
    return row;
}

export const accordionItemProps = {
    name: 'case',
    title: 'Кейс',
    description: 'Карточка с изображением, заголовком и описанием кейса',
    allowedParents: ['accordion-cases'],
    contentFields: [
        {name: 'title', type: 'text', label: 'Заголовок'},
        {name: 'description', type: 'textarea', label: 'Описание'},
        {name: 'image', type: 'image', label: 'Изображение'}
    ],
    renderPreview: (data) => {
        return `
      <div class="block-preview case-preview">
        <div class="row">
          <div class="col-lg-6">
            <div class="image-placeholder"></div>
          </div>
          <div class="col-lg-6">
            <h4>${data.title}</h4>
            <p>${data.description}</p>
          </div>
        </div>
      </div>
    `;
    }
};

