(async () => {
  const results = [];
  const add = (name, pass, detail) => results.push({ name, pass: !!pass, detail });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (selector, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await wait(50);
    }
    return null;
  };
  const s = window.__state;
  if (!s) return [{ name: 'harness', pass: false, detail: 'window.__state missing' }];

  try {
    add('plugin-registration',
      s.ready === true && s.macroHandlers.length === 4 && Object.keys(s.commands).length === 5,
      { ready: s.ready, handlers: s.macroHandlers.length, commands: Object.keys(s.commands) });
    add('style-and-i18n', document.styleSheets.length >= 10,
      { styleSheets: document.styleSheets.length });
  } catch (e) { add('plugin-registration', false, String(e)); }

  // Settings modal
  try {
    await s.models.settingToggle();
    const modal = await waitFor('.ltt-settings-container');
    const tabs = modal ? Array.from(modal.querySelectorAll('.ltt-settings-tab')).map(t => t.innerText) : [];
    const modalRect = modal?.getBoundingClientRect();
    const settingsHit = modalRect
      ? document.elementFromPoint(modalRect.left + modalRect.width / 2, modalRect.top + 20)
      : null;
    const settingsClickable = !!(settingsHit && modal.contains(settingsHit));
    let tabOk = false;
    if (modal) {
      const bv = Array.from(modal.querySelectorAll('.ltt-settings-tab')).find(t => t.innerText.includes('块视图'));
      if (bv) { bv.click(); await wait(200); tabOk = document.querySelector('.ltt-settings-tab.active')?.innerText.includes('块视图'); }
    }
    add('settings-modal', !!modal && tabs.length === 7 && tabOk && settingsClickable, { tabs, tabOk, settingsClickable });
    document.querySelector('#text-toolkit-settings .modal-close')?.click();
    await wait(300);
  } catch (e) { add('settings-modal', false, String(e)); }

  // SDK selection toolbar + bold
  try {
    s.currentBlock = { uuid: 'block-1', content: 'hello world' };
    s.selectionHandler({ text: 'world', start: 6, end: 11, point: { x: 150, y: 220 } });
    const toolbar = await waitFor('.ltt-floating-toolbar');
    const items = toolbar ? toolbar.querySelectorAll('.ltt-toolbar-main-item') : [];
    items[0]?.click();
    await wait(350);
    const update = s.updates.filter(u => u.type === 'update').slice(-1)[0];
    add('selection-sdk-bold', !!toolbar && items.length === 2 && update?.content === 'hello **world**',
      { toolbar: !!toolbar, items: items.length, update });
  } catch (e) { add('selection-sdk-bold', false, String(e)); }

  // Comment modal
  try {
    s.selectionHandler({ text: 'world', start: 8, end: 13, point: { x: 150, y: 220 } });
    const toolbar = await waitFor('.ltt-floating-toolbar');
    toolbar?.querySelectorAll('.ltt-toolbar-main-item')[1]?.click();
    const modal = await waitFor('.ltt-inline-comment-modal');
    let saved = false;
    if (modal) {
      const ta = modal.querySelector('textarea');
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, 'e2e note');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      await wait(80);
      modal.querySelector('.ltt-btn-primary')?.click();
      await wait(450);
      const update = s.updates.filter(u => u.type === 'update').slice(-1)[0];
      saved = !!update && update.content.includes('data-comment "e2e note"') && update.content.includes('world');
    }
    add('comment-inline', !!modal && saved, { modal: !!modal, saved });
  } catch (e) { add('comment-inline', false, String(e)); }

  // BlockView macro + table switch + CSS
  try {
    s.currentBlock = { uuid: 'block-1', content: '{{renderer :blockview, view=list}}' };
    await s.invokeMacro({ uuid: 'block-1', arguments: [':blockview', 'view=list'] }, 'slot-bv-e2e');
    const bar = await waitFor('.ltt-view-bar');
    const block = document.querySelector('.ls-block[blockid="block-1"]');
    const buttons = bar ? Array.from(bar.querySelectorAll('.ltt-view-btn')).map(b => b.getAttribute('data-view')) : [];
    bar?.querySelector('.ltt-view-btn[data-view="table"]')?.click();
    await wait(500);
    const tableBlock = document.querySelector('.ls-block[blockid="block-1"]');
    const tableOk = tableBlock?.className.includes('ltt-table-root');
    const tableWrap = tableBlock?.querySelector(':scope > .block-children-container > .block-children > .blocks-list-wrap');
    const tableRow = tableWrap?.firstElementChild;
    const tableCols = tableRow ? getComputedStyle(tableRow).gridTemplateColumns : '';
    const rowControl = tableRow?.querySelector(':scope > .block-control-wrap');
    const rowControlHidden = !rowControl || getComputedStyle(rowControl).display === 'none';
    bar?.querySelector('.ltt-view-btn[data-view="gallery"]')?.click();
    await wait(500);
    const galleryBlock = document.querySelector('.ls-block[blockid="block-1"]');
    const galleryOk = galleryBlock?.className.includes('ltt-gallery-root');
    const galleryWrap = galleryBlock?.querySelector(':scope > .block-children-container > .block-children > .blocks-list-wrap');
    const galleryCols = galleryWrap ? getComputedStyle(galleryWrap).gridTemplateColumns : '';
    const update = s.updates.filter(u => u.type === 'update').slice(-1)[0];
    add('blockview-macro-switch',
      !!bar && buttons.join(',') === 'list,table,gallery,board' &&
      tableOk &&
      galleryOk &&
      tableCols.split(' ').length === 3 && rowControlHidden && !!galleryCols &&
      update?.content.includes('gallery'),
      { buttons, tableCols, galleryCols, tableOk, galleryOk, rowControlHidden, update });
  } catch (e) { add('blockview-macro-switch', false, String(e)); }

  // BlockView settings refresh
  try {
    window.logseq.settings.blockView.hideViewBar = true;
    s.settingsHandlers.forEach(h => h(window.logseq.settings, {}));
    await wait(700);
    const bar = document.querySelector('.ltt-view-bar');
    const hidden = bar ? getComputedStyle(bar).display === 'none' : false;
    window.logseq.settings.blockView.hideViewBar = false;
    s.settingsHandlers.forEach(h => h(window.logseq.settings, {}));
    await wait(500);
    const visible = getComputedStyle(document.querySelector('.ltt-view-bar')).display !== 'none';
    add('blockview-settings-refresh', hidden && visible, { hidden, visible });
  } catch (e) { add('blockview-settings-refresh', false, String(e)); }

  // TaskProgress
  try {
    await s.invokeMacro({ uuid: 'tp-e2e', arguments: [':taskprogress'] }, 'slot-tp-e2e');
    const el = await waitFor('.task-progress');
    add('taskprogress-macro', !!el && el.innerText.includes('1/2'), { text: el?.innerText?.slice(0, 80) });
  } catch (e) { add('taskprogress-macro', false, String(e)); }

  // Heatmap + interaction
  try {
    await s.invokeMacro({ uuid: 'hm-e2e', arguments: [':heatmap', 'view=month', 'tag=Task'] }, 'slot-hm-e2e');
    const el = await waitFor('.heatmap-container');
    const before = el?.querySelector('.nav-label')?.innerText;
    const week = el ? Array.from(el.querySelectorAll('.view-btn')).find(b => b.innerText.includes('周')) : null;
    week?.click();
    await wait(500);
    const after = document.querySelector('.heatmap-container .nav-label')?.innerText;
    add('heatmap-macro-interaction', !!el && !!before && before !== after, { before, after });
  } catch (e) { add('heatmap-macro-interaction', false, String(e)); }

  // Milestone
  try {
    await s.invokeMacro({ uuid: 'ms-e2e', arguments: [':milestone', 'milestoneList=Initiation;Planning'] }, 'slot-ms-e2e');
    const el = await waitFor('.ltt-milestone-container');
    await wait(500);
    const text = el?.innerText || '';
    add('milestone-macro', !!el && text.includes('Initiation') && text.includes('Planning'), { text: text.slice(0, 120) });
  } catch (e) { add('milestone-macro', false, String(e)); }

  // Summary modal + generation
  try {
    const beforeBlocks = s.blocks.length;
    s.pageBlocks = [{ uuid: 'page-block-1', content: '' }];
    await s.commands['[Text Toolkit] Generate Summary']();
    const modal = await waitFor('.summary-modal-container');
    const modalRect = modal?.getBoundingClientRect();
    const summaryHit = modalRect
      ? document.elementFromPoint(modalRect.left + modalRect.width / 2, modalRect.top + 20)
      : null;
    const summaryClickable = !!(summaryHit && modal.contains(summaryHit));

    const gen = modal ? Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('生成总结')) : null;
    gen?.click();
    await wait(2500);

    const newBlocks = s.blocks.slice(beforeBlocks);
    const newContents = newBlocks.map((block) => block.content || '');
    const firstSummary = newContents.find((content) => content.includes('.ltt-summary-page')) || '';
    const removedEmptyFirstBlock = s.updates.some(
      (update) => update.type === 'remove' && update.id === 'page-block-1'
    );

    add('summary-generate',
      !!modal &&
      newBlocks.length > 0 &&
      !document.querySelector('.summary-modal-container') &&
      removedEmptyFirstBlock &&
      firstSummary.includes('周度总结') &&
      newContents.some((content) => content.includes('活跃块数')) &&
      newContents.some((content) => content.includes('自动洞察')) &&
      newContents.some((content) => content.includes(':heatmap, view=week')) &&
      summaryClickable,
      {
        modal: !!modal,
        blocksBefore: beforeBlocks,
        blocksAfter: s.blocks.length,
        removedEmptyFirstBlock,
        firstSummary,
        summaryClickable,
      });
  } catch (e) { add('summary-generate', false, String(e)); }

  // Slash commands
  try {
    const before = s.updates.filter(u => u.type === 'insert').length;
    for (const name of Object.keys(s.commands)) {
      if (name.includes('Generate Summary')) continue;
      await s.commands[name]();
    }
    await wait(150);
    const inserts = s.updates.filter(u => u.type === 'insert').slice(before);
    add('slash-commands', inserts.length === 4 && inserts.every(i => i.text.startsWith('{{renderer :')),
      { inserts });
  } catch (e) { add('slash-commands', false, String(e)); }

  // Settings save
  try {
    await s.models.settingToggle();
    await wait(250);
    const modal = await waitFor('.ltt-settings-container');
    const bv = modal ? Array.from(modal.querySelectorAll('.ltt-settings-tab')).find(t => t.innerText.includes('块视图')) : null;
    bv?.click();
    await wait(200);
    const save = Array.from(modal?.querySelectorAll('button') || []).find(b => b.innerText.includes('保存块视图设置'));
    save?.click();
    await wait(400);
    add('settings-save', !!save && s.settingsPatches.length > 0 && s.messages.some(m => m.type === 'success'),
      { patches: s.settingsPatches.length, messages: s.messages });
    document.querySelector('#text-toolkit-settings .modal-close')?.click();
  } catch (e) { add('settings-save', false, String(e)); }

  return results;
})()
