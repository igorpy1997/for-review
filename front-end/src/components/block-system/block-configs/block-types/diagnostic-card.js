export function createDiagnosticCard(block, parent) {
    const blockName = block.data_block_name;

    const article = document.createElement('article');
    article.className = block.class_name;
    article.setAttribute('data-block-name', blockName);

    if (block.id && block.id !== 'undefined') {
        article.setAttribute('data-block-id', block.id);
    }

    if (block.order !== undefined && block.order !== null) {
        article.setAttribute('data-order', String(block.order));
    } else {
        article.setAttribute('data-order', '0');
    }

    article.style.position = 'relative';

    article.innerHTML = `
    <h4 data-content="${blockName}-title"></h4>
    <p data-content="${blockName}-description" data-type="textarea"></p>
    <div class="image-container">
      <img class="diagnostic-card-image" src="" alt="" data-content="${blockName}-image" data-type="image">
    </div>
  `;

    parent.appendChild(article);
    return article;
}

export const diagnosticCardProps = {
    name: 'diagnostic-card',
    title: 'Диагностическая карточка',
    description: 'Карточка с заголовком, описанием и изображением',
    allowedParents: ['cards-book'],
    contentFields: [
        {name: 'title', type: 'text', label: 'Заголовок'},
        {name: 'description', type: 'textarea', label: 'Описание'},
        {name: 'image', type: 'image', label: 'Изображение'}
    ],
    renderPreview: (data) => {
        return `
      <div class="block-preview diagnostic-card-preview">
        <h4>${data.title || 'Заголовок карточки'}</h4>
        <p>${data.description || 'Описание карточки...'}</p>
        <div class="image-placeholder"></div>
      </div>
    `;
    }
};