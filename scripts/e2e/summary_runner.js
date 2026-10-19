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
  const setInput = (input, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const chooseType = async (label) => {
    const modal = document.querySelector('.summary-modal-container');
    modal.querySelector('.custom-select__control').click();
    await wait(60);
    const option = Array.from(modal.querySelectorAll('.custom-select__option'))
      .find((element) => element.innerText.includes(label));
    option?.click();
    await wait(150);
  };
  const generate = async (modal) => {
    const button = Array.from(modal.querySelectorAll('button'))
      .find((element) => element.innerText.includes('生成总结'));
    button?.click();
    await wait(2500);
  };

  const s = window.__state;
  const currentYear = new Date().getFullYear();

  // Custom range: local dates, inclusive end, custom page name.
  try {
    const beforeBlocks = s.blocks.length;
    s.pageBlocks = [];
    await s.commands['[Text Toolkit] Generate Summary']();
    const modal = await waitFor('.summary-modal-container');
    await chooseType('自定义');

    const dates = modal.querySelectorAll('input[type="date"]');
    setInput(dates[0], '2026-01-01');
    setInput(dates[1], '2026-01-31');
    await wait(100);
    await generate(modal);

    const push = s.pushes[s.pushes.length - 1];
    const newContents = s.blocks.slice(beforeBlocks).map((block) => block.content || '');
    add('summary-custom-range',
      !!modal &&
      push?.args?.name === '自定义总结-2026-01-01' &&
      newContents.some((content) => content.includes('2026-01-01')) &&
      newContents.some((content) => content.includes('2026-01-31')),
      { push, newBlocks: s.blocks.length - beforeBlocks });
  } catch (error) {
    add('summary-custom-range', false, String(error));
  }

  // Yearly: minimal template + yearly page name.
  try {
    const beforeBlocks = s.blocks.length;
    s.pageBlocks = [];
    await s.commands['[Text Toolkit] Generate Summary']();
    const modal = await waitFor('.summary-modal-container');
    await chooseType('年度');

    const labels = Array.from(modal.querySelectorAll('.custom-select__value')).map((element) => element.textContent);
    const templateIsMinimal = labels.some((label) => label.includes('极简'));
    await generate(modal);

    const push = s.pushes[s.pushes.length - 1];
    const firstNew = s.blocks.slice(beforeBlocks).map((block) => block.content || '')
      .find((content) => content.includes('.ltt-summary-page')) || '';
    add('summary-yearly',
      templateIsMinimal &&
      push?.args?.name === `年度总结-${currentYear}` &&
      firstNew.includes(`${currentYear}-01-01`) &&
      firstNew.includes(`${currentYear}-12-31`),
      { labels, push, firstNew });
  } catch (error) {
    add('summary-yearly', false, String(error));
  }

  // Existing generated summary should be replaced, user note preserved.
  try {
    s.pageBlocks = [
      { uuid: 'old-summary', content: '[:div.ltt-summary-page "old"]' },
      { uuid: 'user-note', content: 'keep me' },
    ];
    window.logseq.Editor.getPage = async (name) => ({ uuid: 'page-1', name, title: name });

    const beforeBlocks = s.blocks.length;
    await s.commands['[Text Toolkit] Generate Summary']();
    const modal = await waitFor('.summary-modal-container');
    await generate(modal);

    const removes = s.updates.filter((update) => update.type === 'remove');
    const removedOld = removes.some((update) => update.id === 'old-summary');
    const removedNote = removes.some((update) => update.id === 'user-note');
    const noteStillExists = s.pageBlocks.some((block) => block.uuid === 'user-note');

    add('summary-replace',
      !!modal &&
      removedOld &&
      !removedNote &&
      noteStillExists &&
      s.blocks.length > beforeBlocks,
      { removes, pageBlocks: s.pageBlocks, added: s.blocks.length - beforeBlocks });
  } catch (error) {
    add('summary-replace', false, String(error));
  }

  return results;
})()
