// 全局状态管理
export const state = {
  TOTAL_PAGES: 0,
  currentPage: 1,
  pageCache: {} // 仅缓存 HTML string
};

// DOM 元素引用
export const dom = {
  sidebarList: document.getElementById('sidebar-list'),
  pageIndicator: document.getElementById('page-indicator'),
  motherLayer: document.getElementById('mother-layer'),
  contentLayer: document.getElementById('content-layer'),
  notesInput: document.getElementById('notes-input'),
  canvasWrapper: document.getElementById('canvas-wrapper'),
  canvas: document.getElementById('canvas'),
  toast: document.getElementById('toast'),
  overlay: document.getElementById('overlay'),
  overlayMsg: document.getElementById('overlay-msg'),
  progressBar: document.getElementById('progress-bar')
};