export type ViewType = 'list' | 'table' | 'gallery' | 'board';

export interface ViewConfig {
  id: ViewType;
  name: string;
  icon: string;
  cssClass: string;
}

const VIEW_ICONS: Record<ViewType, string> = {
  list: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <path d="M3 3.5h8"/><path d="M3 7h8"/><path d="M3 10.5h8"/>
    <circle cx="1.5" cy="3.5" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="7" r=".5" fill="currentColor" stroke="none"/>
    <circle cx="1.5" cy="10.5" r=".5" fill="currentColor" stroke="none"/>
  </svg>`,

  table: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="11" height="10" rx="2"/>
    <path d="M5 2v10"/><path d="M1.5 5.5h11"/>
  </svg>`,

  gallery: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="4" height="4" rx="1"/>
    <rect x="8.5" y="2" width="4" height="4" rx="1"/>
    <rect x="1.5" y="8" width="4" height="4" rx="1"/>
    <rect x="8.5" y="8" width="4" height="4" rx="1"/>
  </svg>`,

  board: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="1.5" y="2" width="3" height="10" rx="1"/>
    <rect x="5.5" y="2" width="3" height="7" rx="1"/>
    <rect x="9.5" y="2" width="3" height="8" rx="1"/>
  </svg>`
};

export const VIEW_REGISTRY: Record<ViewType, ViewConfig> = {
  'list': {
    id: 'list',
    name: 'List',
    icon: VIEW_ICONS.list,
    cssClass: 'ltt-list-root',
  },
  'table': {
    id: 'table',
    name: 'Table',
    icon: VIEW_ICONS.table,
    cssClass: 'ltt-table-root',
  },
  'gallery': {
    id: 'gallery',
    name: 'Gallery',
    icon: VIEW_ICONS.gallery,
    cssClass: 'ltt-gallery-root',
  },
  'board': {
    id: 'board',
    name: 'Board',
    icon: VIEW_ICONS.board,
    cssClass: 'ltt-board-root',
  },
};
