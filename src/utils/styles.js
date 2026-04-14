export function provideStyles() {
  logseq.provideStyle(`
    :root {
      --kef-wrap-tb-bg-light: #333e;
      --kef-wrap-tb-bg-dark: #777e;
    }
    #kef-wrap-toolbar.light-theme {
      background: var(--kef-wrap-tb-bg-light);
    }
    #kef-wrap-toolbar.dark-theme {
      background: var(--kef-wrap-tb-bg-dark);
    }
    #kef-wrap-sponsor-bar.light-theme {
      background: var(--kef-wrap-tb-bg-light);
    }
    #kef-wrap-sponsor-bar.dark-theme {
      background: var(--kef-wrap-tb-bg-dark);
    }
    #kef-wrap-toolbar {
      position: absolute;
      top: 0;
      left: -99999px;
      z-index: var(--ls-z-index-level-2);
      opacity: 0;
      will-change: opacity;
      transition: opacity 100ms ease-in-out;
      border-radius: 6px;
      color: #fff;
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 10px;
    }
    .kef-wrap-tb-list {
      position: relative;
    }
    .kef-wrap-tb-list:hover .kef-wrap-tb-itemlist {
      transform: scaleY(1);
    }
    .kef-wrap-tb-itemlist {
      position: absolute;
      top: 100%;
      left: 0;
      background: var(--kef-wrap-tb-bg);
      border-radius: 0 0 6px 6px;
      transform: scaleY(0);
      transform-origin: top center;
      will-change: transform;
      transition: transform 100ms ease-in-out;
    }
    .kef-wrap-tb-item {
      width: 28px;
      line-height: 20px;
      height: 30px;
      overflow: hidden;
      text-align: center;
      padding: 5px 4px;
      margin: 0;
      cursor: pointer;
    }
    .kef-wrap-tb-item:hover {
      filter: drop-shadow(0 0 3px #fff);
    }
    .kef-wrap-tb-item img {
      width: 20px;
      height: 20px;
      vertical-align: initial;
    }
    .kef-wrap-hidden #kef-wrap-toolbar {
      display: none;
    }

    #kef-wrap-sponsor-bar {
      position: absolute;
      top: 40px;
      left: -99999px;
      z-index: var(--ls-z-index-level-2);
      opacity: 0;
      will-change: opacity;
      transition: opacity 100ms ease-in-out;
      border-radius: 6px;
      color: #fff;
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 10px;
      width: 100%;
      max-width: 100%;
    }

    #kef-wrap-sponsor-bar iframe {
      width: 100%;
      height: 20px;
      border: none;
      overflow: hidden;
    }

    .kef-wrap-hidden #kef-wrap-sponsor-bar {
      display: none;
    }

    .white-theme,
    html[data-theme=light] {
      --mark-red: #ffc7c7;
      --mark-yellow: #fff380;
      --mark-blue: #abdfff;
      --mark-green: #ccffc1;
      --mark-purple: #e8ccff;
      --span-red: #ff0000;
      --span-yellow: #e6b800;
      --span-blue: #0066ff;
      --span-green: #00cc00;
      --span-purple: #9933cc;
      --mark-underline-red: #ff0000;
      --mark-underline-yellow: #e6b800;
      --mark-underline-blue: #0066ff;
      --mark-underline-green: #00cc00;
      --mark-underline-purple: #9933cc;
      --mark-text-color: #262626;
      --mark-thickness: 2px;
      --mark-border-radius: 0.25rem;
    }

    .dark-theme,
    html[data-theme=dark] {
      --mark-red: #8b000080;
      --mark-yellow: #b8860b80;
      --mark-blue: #00008b80;
      --mark-green: #00640080;
      --mark-purple: #80008080;
      --span-red: #ff6666;
      --span-yellow: #ffdd77;
      --span-blue: #88b3ff;
      --span-green: #88ff88;
      --span-purple: #cc99ff;
      --mark-underline-red: #ff6666;
      --mark-underline-yellow: #ffdd77;
      --mark-underline-blue: #88b3ff;
      --mark-underline-green: #88ff88;
      --mark-underline-purple: #cc99ff;
      --mark-text-color: #f0f0f0;
      --mark-thickness: 2px;
      --mark-border-radius: 0.25rem;
    }

    mark.red, mark.yellow, mark.blue, mark.green, mark.purple {
      color: var(--mark-text-color) !important;
      border-radius: var(--mark-border-radius) !important;
      padding: 2px 4px !important;
      display: inline-flex !important;
      text-decoration: none !important;
    }

    mark.red { background-color: var(--mark-red) !important; }
    mark.yellow { background-color: var(--mark-yellow) !important; }
    mark.blue { background-color: var(--mark-blue) !important; }
    mark.green { background-color: var(--mark-green) !important; }
    mark.purple { background-color: var(--mark-purple) !important; }

    span.red, span.yellow, span.blue, span.green, span.purple {
      background: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
      display: inline !important;
      border: none !important;
    }

    span.red { color: var(--span-red) !important; }
    span.yellow { color: var(--span-yellow) !important; }
    span.blue { color: var(--span-blue) !important; }
    span.green { color: var(--span-green) !important; }
    span.purple { color: var(--span-purple) !important; }

    mark.red-underline, mark.yellow-underline, mark.blue-underline, 
    mark.green-underline, mark.purple-underline {
      background: transparent !important;
      color: var(--mark-text-color) !important;
      border-radius: 0 !important;
      padding: 0 !important;
      text-decoration: underline !important;
      text-decoration-thickness: var(--mark-thickness) !important;
      text-decoration-skip-ink: none !important;
    }

    mark.red-underline { text-decoration-color: var(--mark-underline-red) !important; }
    mark.yellow-underline { text-decoration-color: var(--mark-underline-yellow) !important; }
    mark.blue-underline { text-decoration-color: var(--mark-underline-blue) !important; }
    mark.green-underline { text-decoration-color: var(--mark-underline-green) !important; }
    mark.purple-underline { text-decoration-color: var(--mark-underline-purple) !important; }

    mark, span {
      visibility: visible !important;
      opacity: 1 !important;
      border: none !important;
    }

    .block-content-inner:has(+ .block-body [data-ref="#caption"] + mark) > .flex-1 {
      text-align: center;
    }
  `)
}
