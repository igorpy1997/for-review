import { config } from '../../config/app-config';

export function initCarousel(options = {}) {
  const settings = {
    ...config.carousel,
    ...options
  };

  // Поиск всех элементов cards-book с атрибутом data-section="carousel"
  const carouselBooks = document.querySelectorAll('.cards-book[data-section="carousel"]');

  if (!carouselBooks.length) {
    console.warn('No carousel books found on the page');
    return;
  }

  // Инициализация каждой найденной карусели
  carouselBooks.forEach((cardsBook, index) => {
    initSingleCarousel(cardsBook, settings, index);
  });
}

function initSingleCarousel(cardsBook, settings, carouselIndex) {
  // Теперь cardsBook уже передается как параметр, так как это и есть наш элемент с атрибутом data-section="carousel"

  const cards = cardsBook.querySelectorAll(settings.selectors.card);
  if (!cards.length) {
    console.warn(`Carousel book #${carouselIndex} does not contain any cards`);
    return;
  }

  console.log(`Initializing carousel #${carouselIndex} with ${cards.length} cards`);

  const state = {
    currentPosition: 0,
    visibleCards: settings.maxVisibleCards,
    autoScrollInterval: null,
    originalCardWidth: 0,
    gap: settings.cardGap,
    carouselId: `carousel-${carouselIndex}`
  };

  // Добавляем ID к cards-book для возможности селекции
  if (!cardsBook.id) {
    cardsBook.id = state.carouselId;
  }

  // Получаем родительский контейнер
  const carouselContainer = cardsBook.closest('.carousel-container') || cardsBook.parentElement;
  const navigation = createNavigation(settings, carouselContainer, state.carouselId);

  updateCardSizes(cardsBook, cards, settings);
  state.originalCardWidth = cards[0].offsetWidth;
  updateCarouselState(cardsBook, cards, navigation, state);
  setupEventListeners(cardsBook, cards, navigation, state, settings);

  if (settings.autoScroll) {
    startAutoScroll(state, () => nextSlide(cardsBook, cards, navigation, state));
  }

  // Привязка обработчика изменения размеров окна к конкретной карусели
  const resizeHandler = () => handleResize(cardsBook, cards, navigation, state, settings);
  document.addEventListener('app:resize', resizeHandler);

  // Сохраняем ссылку на обработчик для возможности удаления
  cardsBook.setAttribute('data-resize-handler-id', state.carouselId);
  window.carouselResizeHandlers = window.carouselResizeHandlers || {};
  window.carouselResizeHandlers[state.carouselId] = resizeHandler;

  console.log(`Carousel #${carouselIndex} initialized with ${cards.length} cards, showing ${settings.maxVisibleCards} at once`);
}

function createNavigation(settings, container, carouselId) {
  let prevBtn, nextBtn;
  const existingNav = container.querySelector('.carousel-navigation');

  if (!existingNav) {
    const navigation = document.createElement('div');
    navigation.className = 'carousel-navigation';
    navigation.setAttribute('data-carousel-id', carouselId);

    prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev';
    prevBtn.setAttribute('aria-label', 'Предыдущий слайд');

    // Создаем изображение для кнопки "назад"
    const prevImage = document.createElement('img');
    prevImage.src = 'images/arrow-left.svg';
    prevImage.alt = '← Назад';
    prevBtn.appendChild(prevImage);

    nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next';
    nextBtn.setAttribute('aria-label', 'Следующий слайд');

    // Создаем изображение для кнопки "вперед"
    const nextImage = document.createElement('img');
    nextImage.src = 'images/arrow-right.svg';
    nextImage.alt = 'Вперед →';
    nextBtn.appendChild(nextImage);

    navigation.appendChild(prevBtn);
    navigation.appendChild(nextBtn);

    container.appendChild(navigation);
  } else {
    prevBtn = existingNav.querySelector('.carousel-prev');
    nextBtn = existingNav.querySelector('.carousel-next');
  }

  return { prevBtn, nextBtn };
}

function updateCardSizes(cardsBook, cards, settings) {
  if (!cardsBook || !cards.length) return;

  const containerWidth = cardsBook.parentElement.offsetWidth;
  const minCardWidth = Math.max(
      settings.minCardWidth || 200,
      containerWidth / settings.maxVisibleCards - settings.cardGap
  );

  cards.forEach(card => {
    card.style.minWidth = `${minCardWidth}px`;
    card.style.flexBasis = `${minCardWidth}px`;
  });
}

function updateCarouselState(cardsBook, cards, navigation, state) {
  const maxPosition = Math.max(0, cards.length - state.visibleCards);
  state.currentPosition = Math.min(Math.max(0, state.currentPosition), maxPosition);

  const offset = state.currentPosition * (state.originalCardWidth + state.gap);
  cardsBook.style.transform = `translateX(-${offset}px)`;

  navigation.prevBtn.disabled = state.currentPosition === 0;
  navigation.nextBtn.disabled = state.currentPosition >= maxPosition;

  navigation.prevBtn.style.opacity = navigation.prevBtn.disabled ? "0.5" : "1";
  navigation.nextBtn.style.opacity = navigation.nextBtn.disabled ? "0.5" : "1";
}

function nextSlide(cardsBook, cards, navigation, state) {
  if (state.currentPosition >= cards.length - state.visibleCards) {
    state.currentPosition = 0;
  } else {
    state.currentPosition++;
  }
  updateCarouselState(cardsBook, cards, navigation, state);
}

function handleResize(cardsBook, cards, navigation, state, settings) {
  stopAutoScroll(state);
  updateCardSizes(cardsBook, cards, settings);
  state.originalCardWidth = cards[0].offsetWidth;
  updateCarouselState(cardsBook, cards, navigation, state);
  if (settings.autoScroll) {
    startAutoScroll(state, () => nextSlide(cardsBook, cards, navigation, state));
  }
}

function startAutoScroll(state, callback) {
  stopAutoScroll(state);
  state.autoScrollInterval = setInterval(callback, config.carousel.autoScrollDelay);
}

function stopAutoScroll(state) {
  if (state.autoScrollInterval) {
    clearInterval(state.autoScrollInterval);
    state.autoScrollInterval = null;
  }
}

function setupEventListeners(cardsBook, cards, navigation, state, settings) {
  navigation.prevBtn.addEventListener('click', () => {
    stopAutoScroll(state);
    state.currentPosition--;
    updateCarouselState(cardsBook, cards, navigation, state);
    if (settings.autoScroll) startAutoScroll(state, () => nextSlide(cardsBook, cards, navigation, state));
  });

  navigation.nextBtn.addEventListener('click', () => {
    stopAutoScroll(state);
    nextSlide(cardsBook, cards, navigation, state);
    if (settings.autoScroll) startAutoScroll(state, () => nextSlide(cardsBook, cards, navigation, state));
  });

  if (settings.autoScroll) {
    cardsBook.addEventListener('mouseenter', () => stopAutoScroll(state));
    cardsBook.addEventListener('mouseleave', () =>
        startAutoScroll(state, () => nextSlide(cardsBook, cards, navigation, state))
    );
  }
}

export function hasCarousel() {
  return document.querySelectorAll('.cards-book[data-section="carousel"]').length > 0;
}

export function reinitializeCarousel() {
  console.log('Reinitializing all carousels...');

  // Очистка предыдущих обработчиков событий
  if (window.carouselResizeHandlers) {
    Object.keys(window.carouselResizeHandlers).forEach(id => {
      document.removeEventListener('app:resize', window.carouselResizeHandlers[id]);
    });
  }

  // Перезапуск всех каруселей
  window.carousel = window.carousel || {};
  window.carousel.initialized = false;
  initCarousel();
}