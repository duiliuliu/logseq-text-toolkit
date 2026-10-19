(async () => {
  const results = [];
  const add = (name, pass, detail) => results.push({ name, pass: !!pass, detail });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (sel, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(sel);
      if (el) return el;
      await wait(50);
    }
    return null;
  };
  const s = window.__state;
  try {
    add('native-host-no-sdk-hook', typeof window.logseq.Editor.onInputSelectionEnd === 'undefined' && s.selectionHandler == null,
      { hook: typeof window.logseq.Editor.onInputSelectionEnd, handler: typeof s.selectionHandler });
    const ta = document.getElementById('native-editor');
    document.querySelector('.ls-block[blockid="block-1"] .block-main-container').appendChild(ta);
    s.currentBlock = { uuid: 'block-1', content: 'hello world' };
    ta.focus();
    ta.setSelectionRange(6, 11);
    ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 150, clientY: 220 }));
    const toolbar = await waitFor('.ltt-floating-toolbar');
    const items = toolbar ? toolbar.querySelectorAll('.ltt-toolbar-main-item') : [];
    items[0]?.click();
    await wait(400);
    const update = s.updates.filter(u => u.type === 'update').slice(-1)[0];
    add('native-selection-bold', !!toolbar && items.length === 2 && update?.content === 'hello **world**',
      { toolbar: !!toolbar, items: items.length, update });
  } catch (e) { add('native-selection-bold', false, String(e)); }
  return results;
})()
