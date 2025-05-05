import { initCarousel } from './components/carousel';
import { initAccordion } from './components/accordion';
import { initBlockSystem, initAllSortables } from './components/block-system';
import { initContentEditor } from './components/content-editor-src';
import { config } from './config/app-config';
import { isAuthenticated } from './components/auth';

const App = {
  debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  initialize() {
    console.log('Initializing application...');

    try {
      initCarousel(config.carousel);
      console.log('Carousel initialized');
    } catch (error) {
      console.error('Failed to initialize carousel:', error);
    }

    try {
      initAccordion(config.accordion);
      console.log('Accordion initialized');
    } catch (error) {
      console.error('Failed to initialize accordion:', error);
    }

    try {
      initBlockSystem();
      console.log('Block system initialized');

      // Если пользователь авторизован, инициализируем функцию перетаскивания
      if (isAuthenticated()) {
        try {
          initAllSortables();
          console.log('Block sortable initialized');
        } catch (sortableError) {
          console.error('Failed to initialize block sortable:', sortableError);
        }
      }
    } catch (error) {
      console.error('Failed to initialize block system:', error);
    }

    try {
      initContentEditor();
      console.log('Content editor initialized');
    } catch (error) {
      console.error('Failed to initialize content editor:', error);
    }

    console.log('Application initialized successfully');
  },

  handleResize: null
};

App.handleResize = App.debounce(() => {
  const resizeEvent = new CustomEvent('app:resize', {
    detail: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  });
  document.dispatchEvent(resizeEvent);
}, 150);

document.addEventListener('DOMContentLoaded', App.initialize);
window.addEventListener('resize', App.handleResize);

export default App;