(async () => {
  const results = [];
  const add = (name, pass, detail) => results.push({ name, pass: !!pass, detail });
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const waitFor = async (selector, timeout = 5000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await wait(50);
    }
    return null;
  };
  const waitForFrame = async (timeout = 5000) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const frame = document.querySelector('.ltt-html-viewer-frame');
      try {
        if (frame?.contentDocument?.body?.textContent?.includes('HTML E2E Report')) return frame;
      } catch {
        // not ready / not same-origin yet
      }
      await wait(50);
    }
    return null;
  };
  const setInput = (input, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
      || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const s = window.__state;

  try {
    await s.commands['[Text Toolkit] Open HTML Viewer']();
    const panel = await waitFor('.ltt-html-viewer-panel');
    const assetButton = await waitFor('.ltt-html-viewer-assets button');
    assetButton?.click();
    const frame = await waitForFrame();
    add('html-viewer-open', !!panel && !!assetButton && !!frame && !String(frame?.getAttribute('sandbox') || '').includes('allow-scripts'), {
      panel: !!panel,
      assetButton: !!assetButton,
      frame: !!frame,
      sandbox: frame?.getAttribute('sandbox'),
      noScripts: !String(frame?.getAttribute('sandbox') || '').includes('allow-scripts'),
    });

    if (frame) {
      const doc = frame.contentDocument;
      const target = Array.from(doc.body.querySelectorAll('p'))
        .find((p) => p.textContent?.includes('annotation flow'));
      if (target) {
        const range = doc.createRange();
        range.selectNodeContents(target);
        const selection = doc.defaultView.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        doc.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
      const annotate = await waitFor('.ltt-html-viewer-annotate');
      annotate?.click();
      const composer = await waitFor('.ltt-html-viewer-composer');
      const textarea = composer?.querySelector('textarea');
      if (textarea) setInput(textarea, 'E2E HTML note');
      await wait(80);
      composer?.querySelector('.primary')?.click();
      await wait(700);

      const sidebarText = document.querySelector('.ltt-html-viewer-sidebar')?.textContent || '';
      const graphBlocks = s.blocks.filter((block) => String(block.content || '').includes('annotation flow'));
      const stored = Array.from(s.fileStorage.values()).join('\n');
      const highlightCount = frame.contentWindow?.CSS?.highlights?.size ?? 0;
      add('html-viewer-annotation',
        !!composer &&
        sidebarText.includes('E2E HTML note') &&
        graphBlocks.length > 0 &&
        stored.includes('E2E HTML note') &&
        highlightCount > 0,
        {
          composer: !!composer,
          sidebarText: sidebarText.slice(0, 160),
          graphBlocks: graphBlocks.length,
          stored: stored.includes('E2E HTML note'),
          highlightCount,
        });

      const sideButton = document.querySelectorAll('.ltt-html-viewer-actions button')[1];
      sideButton?.click();
      await wait(100);
      const switchedLeft = document.querySelector('.ltt-html-viewer-panel')?.classList.contains('is-left');
      const fullButton = document.querySelectorAll('.ltt-html-viewer-actions button')[2];
      fullButton?.click();
      await wait(100);
      const fullscreen = document.querySelector('.ltt-html-viewer-panel')?.classList.contains('is-fullscreen');
      add('html-viewer-panel-controls', !!switchedLeft && !!fullscreen, { switchedLeft, fullscreen });
    }
  } catch (error) {
    add('html-viewer-open', false, String(error));
  }

  try {
    document.querySelector('.ltt-html-viewer-actions button:last-child')?.click();
    await wait(400);
    const closed = !document.querySelector('.ltt-html-viewer-panel');
    await s.commands['[Text Toolkit] Open HTML Viewer']();
    const reopened = await waitFor('.ltt-html-viewer-panel');
    const assetButton = await waitFor('.ltt-html-viewer-assets button');
    assetButton?.click();
    await waitForFrame();
    const sidebarText = document.querySelector('.ltt-html-viewer-sidebar')?.textContent || '';
    add('html-viewer-persistence', closed && !!reopened && sidebarText.includes('E2E HTML note'), {
      closed,
      reopened: !!reopened,
      sidebarText: sidebarText.slice(0, 160),
    });
  } catch (error) {
    add('html-viewer-persistence', false, String(error));
  }

  return results;
})()
