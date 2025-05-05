import { blockSystemAPI, initBlockSystem } from './block-system';
import { sortableAPI, initAllSortables } from './block-sortable';

// Объединяем API сортировки с API системы блоков
const extendedBlockSystemAPI = {
  ...blockSystemAPI,
  sortable: sortableAPI
};

export {
  initBlockSystem,
  extendedBlockSystemAPI as blockSystemAPI,
  initAllSortables
};