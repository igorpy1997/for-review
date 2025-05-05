export const config = {
  api: {
    localUrl: 'http://127.0.0.1:8001',
    paths: {
      auth: '/api/admin/me',
      content: '/api/content',
      contentImage: '/api/content/image',
      media: '/api/media',
      blocks: '/api/blocks',
      blocksByParent: '/api/blocks/by-parent',
      deleteBlock: '/api/blocks',
      reorderBlocks: '/api/blocks/reorder'
    }
  },
  carousel: {
    autoScroll: true,
    autoScrollDelay: 5000,
    maxVisibleCards: 4,
    cardGap: 24,
    minCardWidth: 200, // Добавлен минимальный размер карточки
    selectors: {
      // Обновленные селекторы для поиска элементов карусели
      cardsContainer: '.cards-book[data-section="carousel"]',
      card: '.diagnostic-card',
      navigation: '.carousel-navigation',
      container: '.carousel-container'
    }
  },
  accordion: {
    selectors: {
      accordionContainer: '[data-section="accordion"]',
      caseRow: '.row',
      imageContainer: '.image-container',
      caseImage: '.case-image',
      title: 'h4',
      description: 'p'
    }
  },
  editor: {
    publishBtnDelay: 3000,
    selectors: {
      publishButton: 'publish-button'
    }
  }
};

export function getApiBaseUrl() {
  return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? config.api.localUrl
      : window.location.origin;
}

export function getBlockApiUrl(blockId) {
  return `${config.api.paths.blocks}/${blockId}`;
}