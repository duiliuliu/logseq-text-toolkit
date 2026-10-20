(() => {
  // 阻止 @logseq/libs 用 postmate 版 LSPluginUser 覆盖我们的 Host mock。
  window.__LSP__HOST__ = window.__LSP__HOST__ || { mode: 'e2e' };

  const state = {
    ready: false,
    macroHandlers: [],
    selectionHandler: null,
    settingsHandlers: [],
    graphHandlers: [],
    models: {},
    commands: {},
    updates: [],
    queries: [],
    pages: [],
    pushes: [],
    pageBlocks: [{ uuid: 'page-block-1', content: '' }],
    blocks: [],
    messages: [],
    settingsPatches: [],
    fileStorage: new Map(),
    currentBlock: { uuid: 'block-1', content: 'hello world' },
  };
  window.__state = state;

  const now = Date.now();
  const dateBlock = (i) => ({
    'block/uuid': `heat-${i}`,
    'block/title': `heat block ${i}`,
    'block/created-at': now - i * 86400000,
  });

  const queryResult = (query) => {
    if (query.includes(':logseq.property/status') && query.includes(':block/uuid')
        && query.includes(':block/parent')) {
      return [
        [{ uuid: 'task-1', title: 'Task A', 'logseq.property/status': { 'block/title': 'Done' } }],
        [{ uuid: 'task-2', title: 'Task B (tag only)' }],
      ];
    }
    if (query.includes(':logseq.property/status') && query.includes('block/created-at')) {
      return [
        [{ 'block/title': 'Task A', 'block/created-at': now, 'logseq.property/status': { 'block/title': 'Done' } }],
        [{ 'block/title': 'Task B', 'block/created-at': now, 'logseq.property/status': { 'block/title': 'Doing' } }],
      ];
    }
    if (query.includes('clojure.string/includes?')) {
      return [
        [{ 'block/uuid': 'ms-1', 'block/title': 'Initiation task', ':logseq.property/status': { 'block/title': 'Done' }, ':block/created-at': now - 86400000 }],
        [{ 'block/uuid': 'ms-2', 'block/title': 'Planning task', ':logseq.property/status': { 'block/title': 'Doing' }, ':block/created-at': now - 172800000 }],
      ];
    }
    if (query.includes(':block/name')) {
      return [
        [{ 'block/title': 'Page A', 'block/name': 'page a', 'block/created-at': now, 'block/updated-at': now, tags: [{ 'block/title': 'Project' }] }],
      ];
    }
    if (query.includes('block/created-at') || query.includes('logseq.property/scheduled') || query.includes('block/updated-at')) {
      return [[dateBlock(1)], [dateBlock(2)], [dateBlock(3)]];
    }
    return [];
  };

  const provideUI = (ui) => {
    if (!ui) return;
    if (ui.slot) {
      let slot = document.getElementById(ui.slot);
      if (!slot) {
        slot = document.createElement('div');
        slot.id = ui.slot;
        slot.className = 'lsp-hook-ui-slot';
        (document.getElementById('main-content-container') || document.body).appendChild(slot);
      }
      if (ui.reset) slot.innerHTML = ui.template || '';
      else slot.insertAdjacentHTML('beforeend', ui.template || '');
      return;
    }
    if (ui.path) {
      const existing = ui.key ? document.getElementById(ui.key) : null;
      if (existing) return;
      const root = document.querySelector(ui.path);
      if (!root) return;
      const template = document.createElement('template');
      template.innerHTML = ui.template || '';
      root.appendChild(template.content.cloneNode(true));
    }
  };

  const editor = {
    registerSlashCommand: (name, cb) => {
      state.commands[name] = cb;
      return () => { delete state.commands[name]; };
    },
    insertAtEditingCursor: async (text) => {
      state.updates.push({ type: 'insert', text });
    },
    getCurrentBlock: async () => state.currentBlock,
    getBlock: async (id) => {
      if (state.currentBlock && (state.currentBlock.uuid === id || state.currentBlock.id === id)) {
        return { ...state.currentBlock, children: [] };
      }
      return { uuid: String(id), content: '{{renderer :blockview, view=list}}', children: [] };
    },
    updateBlock: async (id, content) => {
      state.updates.push({ type: 'update', id, content });
      if (state.currentBlock && state.currentBlock.uuid === id) state.currentBlock.content = content;
      return true;
    },
    getEditingBlockContent: async () => state.currentBlock?.content || '',
    getEditingCursorPosition: async () => ({
      left: 10,
      top: 20,
      height: 20,
      pos: 6,
      rect: { x: 100, y: 200, width: 300, height: 20, top: 200, left: 100, right: 400, bottom: 220 },
    }),
    onInputSelectionEnd: (handler) => {
      state.selectionHandler = handler;
      return () => { if (state.selectionHandler === handler) state.selectionHandler = null; };
    },
    getPage: async (name) => {
      if (String(name).startsWith('周度总结')) return null;
      return { uuid: 'page-1', name, title: name };
    },
    createPage: async (name) => {
      const page = { uuid: 'page-1', name, title: name };
      state.pages.push(page);
      return page;
    },
    getPageBlocksTree: async () => state.pageBlocks.map((b) => ({ ...b })),
    insertBlock: async (parent, content) => {
      const block = { uuid: `created-${state.blocks.length + 1}`, content };
      state.blocks.push({ parent, ...block });
      return block;
    },
    removeBlock: async (id) => {
      state.updates.push({ type: 'remove', id });
      state.pageBlocks = state.pageBlocks.filter((b) => b.uuid !== id && b.id !== id);
      return true;
    },
    getBlockProperties: async () => ({}),
    upsertBlockProperty: async () => true,
    scrollToBlockInPage: () => {},
  };

  if (new URLSearchParams(location.search).has('native')) {
    delete editor.onInputSelectionEnd;
  }

  const app = {
    onMacroRendererSlotted: (handler) => { state.macroHandlers.push(handler); },
    registerUIItem: (type, config) => {
      const host = document.getElementById('toolbar');
      if (host && config?.template) host.insertAdjacentHTML('beforeend', config.template);
    },
    getUserConfigs: async () => ({}),
    pushState: async (type, args) => { state.pushes.push({ type, args }); return true; },
    insertTemplate: async () => true,
    onCurrentGraphChanged: (handler) => { state.graphHandlers.push(handler); return () => {}; },
  };

  state.invokeMacro = async (payload, slot) => {
    const results = [];
    for (const handler of state.macroHandlers) {
      try { results.push(await handler({ payload, slot })); }
      catch (e) { console.error('macro handler error', e); results.push({ error: String(e) }); }
    }
    return results;
  };

  const assetUrl = (path) => `${location.origin}/${String(path).replace(/^\/+/, '')}`;

  const htmlViewerApi = {
    Assets: {
      listFilesOfCurrentGraph: async () => ([
        { path: 'assets/sample.html', size: 1024, modifiedTime: Date.now() },
      ]),
      makeUrl: async (path) => assetUrl(path),
      builtInOpen: async () => true,
    },
    FileStorage: {
      getItem: async (key) => state.fileStorage.get(key),
      setItem: async (key, value) => { state.fileStorage.set(key, value); },
      removeItem: async (key) => { state.fileStorage.delete(key); },
      hasItem: async (key) => state.fileStorage.has(key),
      allKeys: async () => Array.from(state.fileStorage.keys()),
      clear: async () => { state.fileStorage.clear(); },
    },
  };

  window.logseq = {
    ...htmlViewerApi,
    ready: (cb) => {
      setTimeout(() => {
        state.ready = true;
        try { cb?.(); } catch (e) { console.error('ready callback error', e); }
      }, 0);
      return Promise.resolve();
    },
    settings: window.__LTT_SETTINGS__ || {},
    provideUI,
    provideStyle: (style) => {
      const css = typeof style === 'string' ? style : style?.style || style?.content || '';
      if (!css) return;
      const el = document.createElement('style');
      el.textContent = css;
      document.head.appendChild(el);
    },
    provideModel: (model) => Object.assign(state.models, model || {}),
    onSettingsChanged: (handler) => { state.settingsHandlers.push(handler); return () => {}; },
    updateSettings: (patch) => {
      Object.assign(window.logseq.settings, patch || {});
      state.settingsPatches.push(patch);
    },
    App: app,
    Editor: editor,
    DB: {
      datascriptQuery: async (query) => {
        state.queries.push(query);
        const result = queryResult(query);
        state.lastQueryResult = result;
        return result;
      },
    },
    UI: {
      showMsg: (message, type) => state.messages.push({ message, type }),
    },
  };
})();
