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
    add('sdk-hook-present', typeof window.logseq.Editor.onInputSelectionEnd === 'function' && typeof s.selectionHandler === 'function',
      { hook: typeof window.logseq.Editor.onInputSelectionEnd });
    const ta = document.getElementById('native-editor');
    document.querySelector('.ls-block[blockid="block-1"] .block-main-container').appendChild(ta);
    s.currentBlock = { uuid: 'block-1', content: 'hello world' };
    ta.focus();
    ta.setSelectionRange(6, 11);
    // 不调用 s.selectionHandler，模拟旧 Host “有 API 但不发事件”
    ta.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 150, clientY: 220 }));
    const toolbar = await waitFor('.ltt-floating-toolbar');
    toolbar?.querySelector('.ltt-toolbar-main-item')?.click();
    await wait(400);
    const update = s.updates.filter(u => u.type === 'update').slice(-1)[0];
    add('silent-sdk-native-fallback', !!toolbar && update?.content === 'hello **world**',
      { toolbar: !!toolbar, update });
  } catch (e) { add('silent-sdk-native-fallback', false, String(e)); }
  return results;
})()
