import { reinitializeCarousel } from '../carousel';
import { reinitializeAccordion } from '../accordion';

export const sectionInitializers = {
  'carousel': (sectionElement) => {
    try {
      console.log('[SectionInitializer] Initializing carousel');
      // Теперь reinitializeCarousel будет обрабатывать все карусели
      // и будет находить их по атрибуту data-section="carousel"
      reinitializeCarousel();
    } catch (error) {
      console.error('[SectionInitializer] Error initializing carousel:', error);
    }
  },
  'accordion': (sectionElement) => {
    try {
      console.log('[SectionInitializer] Initializing accordion');
      // reinitializeAccordion будет обрабатывать все аккордеоны
      // и будет находить их по атрибуту data-section="accordion"
      reinitializeAccordion();
    } catch (error) {
      console.error('[SectionInitializer] Error initializing accordion:', error);
    }
  },
  'initial': () => {}
};

export function registerSectionInitializer(sectionType, initializer) {
  if (typeof initializer !== 'function') return;
  sectionInitializers[sectionType] = initializer;
}