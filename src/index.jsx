import "@logseq/libs"
import { setup, t } from "logseq-l10n"
import { render } from "preact"
import { debounce, throttle } from "rambdax"
import Toolbar from "./Toolbar.jsx"
import zhCN from "./translations/zh-CN.json"
import ja from "./translations/ja.json"

const TOOLBAR_ID = "kef-wrap-toolbar"
const SPONSOR_BAR_ID = "kef-wrap-sponsor-bar"
let toolbar
let sponsorBar
let textarea

// 检测是否在测试模式
const isTestMode = typeof window !== 'undefined' && window.location.pathname.includes('test.html')

async function main() {
  // Reset values.
  toolbar = null
  textarea = null

  await setup({ builtinTranslations: { "zh-CN": zhCN, "ja": ja } })

  const definitions = await getDefinitions()

  provideStyles()

  const model = {}
  for (const definition of definitions) {
    if (definition.key.startsWith("group-")) {
      for (const def of definition.items) {
        registerModel(model, def)
      }
    } else {
      registerModel(model, definition)
    }
  }
  logseq.provideModel(model)

  if (logseq.settings?.toolbar ?? true) {
    if (!isTestMode) {
      logseq.provideUI({
        key: TOOLBAR_ID,
        path: "#app-container",
        template: `<div id="${TOOLBAR_ID}"></div>`,
      })

      // 提供赞赏栏UI
      if (logseq.settings?.sponsorBar ?? true) {
        logseq.provideUI({
          key: SPONSOR_BAR_ID,
          path: "#app-container",
          template: `<div id="${SPONSOR_BAR_ID}"><iframe src="https://duiliuliu.github.io/sponsor-page/" scrolling="no" frameborder="0"></iframe></div>`,
        })
      }

      if (logseq.settings?.toolbarShortcut) {
        logseq.App.registerCommandPalette(
          {
            key: "toggle-toolbar",
            label: t("Toggle toolbar display"),
            keybinding: { binding: logseq.settings?.toolbarShortcut },
          },
          toggleToolbarDisplay,
        )
      } else {
        logseq.App.registerCommandPalette(
          { key: "toggle-toolbar", label: t("Toggle toolbar display") },
          toggleToolbarDisplay,
        )
      }

      // Let div root element get generated first.
      setTimeout(async () => {
        toolbar = parent.document.getElementById(TOOLBAR_ID)
        render(<Toolbar items={definitions} model={model} />, toolbar)

        // 获取赞赏栏元素
        if (logseq.settings?.sponsorBar ?? true) {
          sponsorBar = parent.document.getElementById(SPONSOR_BAR_ID)
        }

        toolbar.addEventListener("transitionend", onToolbarTransitionEnd)
        parent.document.addEventListener("focusout", onBlur)

        const mainContentContainer = parent.document.getElementById(
          "main-content-container",
        )
        mainContentContainer.addEventListener("scroll", onScroll, {
          passive: true,
        })
      }, 0)
    }
  }

  parent.document.addEventListener("selectionchange", onSelectionChange)

  logseq.beforeunload(async () => {
    if (textarea) {
      textarea.removeEventListener("keydown", deletionWorkaroundHandler)
    }
    if (!isTestMode) {
      const mainContentContainer = parent.document.getElementById(
        "main-content-container",
      )
      mainContentContainer.removeEventListener("scroll", onScroll, {
        passive: true,
      })
    }
    toolbar?.removeEventListener("transitionend", onToolbarTransitionEnd)
    parent.document.removeEventListener("focusout", onBlur)
    parent.document.removeEventListener("selectionchange", onSelectionChange)
  })

  for (const definition of definitions) {
    if (definition.key.startsWith("group-")) {
      for (const def of definition.items) {
        registerCommand(model, def)
      }
    } else {
      registerCommand(model, definition)
    }
  }

  console.log("#wrap loaded")
}

function provideStyles() {
  logseq.provideStyle(`
    :root {
      --kef-wrap-tb-bg: #333e;
    }
    :root.dark {
      --kef-wrap-tb-bg: #777e;
    }
    #kef-wrap-toolbar {
      position: absolute;
      top: 0;
      left: -99999px;
      z-index: var(--ls-z-index-level-2);
      opacity: 0;
      will-change: opacity;
      transition: opacity 100ms ease-in-out;
      background: var(--kef-wrap-tb-bg);
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

    /* 赞赏栏样式 */
    #kef-wrap-sponsor-bar {
      position: absolute;
      top: 40px;
      left: -99999px;
      z-index: var(--ls-z-index-level-2);
      opacity: 0;
      will-change: opacity;
      transition: opacity 100ms ease-in-out;
      background: var(--kef-wrap-tb-bg);
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

    /* ==============================================
    主题变量定义 - 支持light/dark模式
    ============================================== */
    .white-theme,
    html[data-theme=light] {
      /* 背景高亮颜色 */
      --mark-red: #ffc7c7;
      --mark-yellow: #fff380;
      --mark-blue: #abdfff;
      --mark-green: #ccffc1;
      --mark-purple: #e8ccff;
      /* 字体颜色 */
      --span-red: #ff0000;
      --span-yellow: #e6b800;
      --span-blue: #0066ff;
      --span-green: #00cc00;
      --span-purple: #9933cc;
      /* 下划线高亮 */
      --mark-underline-red: #ff0000;
      --mark-underline-yellow: #e6b800;
      --mark-underline-blue: #0066ff;
      --mark-underline-green: #00cc00;
      --mark-underline-purple: #9933cc;
      /* 通用样式变量 */
      --mark-text-color: #262626;
      --mark-thickness: 2px;
      --mark-border-radius: 0.25rem;
    }

    .dark-theme,
    html[data-theme=dark] {
      /* 背景高亮颜色 */
      --mark-red: #8b000080;
      --mark-yellow: #b8860b80;
      --mark-blue: #00008b80;
      --mark-green: #00640080;
      --mark-purple: #80008080;
      /* 字体颜色 */
      --span-red: #ff6666;
      --span-yellow: #ffdd77;
      --span-blue: #88b3ff;
      --span-green: #88ff88;
      --span-purple: #cc99ff;
      /* 下划线高亮 */
      --mark-underline-red: #ff6666;
      --mark-underline-yellow: #ffdd77;
      --mark-underline-blue: #88b3ff;
      --mark-underline-green: #88ff88;
      --mark-underline-purple: #cc99ff;
      /* 通用样式变量 */
      --mark-text-color: #f0f0f0;
      --mark-thickness: 2px;
      --mark-border-radius: 0.25rem;
    }

    /* ==============================================
    1. 背景高亮样式（mark标签）
    ============================================== */
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

    /* ==============================================
    2. 字体颜色样式（span标签）
    ============================================== */
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

    /* ==============================================
    3. 下划线高亮样式
    ============================================== */
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

    /* ==============================================
    4. 兜底样式
    ============================================== */
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

async function getDefinitions() {
  const ret = Object.entries(logseq.settings ?? {})
    .filter(
      ([k, v]) =>
        k.startsWith("wrap-") ||
        k.startsWith("repl-") ||
        k.startsWith("group-"),
    )
    .map(([k, v]) => {
      if (k.startsWith("group-")) {
        return {
          key: k,
          items: Object.entries(v).map(([kk, vv]) => ({ key: kk, ...vv })),
        }
      } else {
        return { key: k, ...v }
      }
    })

  if (ret.length > 0) return ret

  const { preferredFormat } = await logseq.App.getUserConfigs()
  return [
    {
      key: "group-custom",
      items: [
        {
          key: "wrap-bold",
          label: t("Wrap bold"),
          binding: "",
          template: "**$^**",
          icon: '<svg t="1644033307902" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1224" width="200" height="200"><path d="M697.8 481.4c33.6-35 54.2-82.3 54.2-134.3v-10.2C752 229.3 663.9 142 555.3 142H259.4c-15.1 0-27.4 12.3-27.4 27.4v679.1c0 16.3 13.2 29.5 29.5 29.5h318.7c117 0 211.8-94.2 211.8-210.5v-11c0-73-37.4-137.3-94.2-175.1zM328 238h224.7c57.1 0 103.3 44.4 103.3 99.3v9.5c0 54.8-46.3 99.3-103.3 99.3H328V238z m366.6 429.4c0 62.9-51.7 113.9-115.5 113.9H328V542.7h251.1c63.8 0 115.5 51 115.5 113.9v10.8z" p-id="1225" fill="#eee"></path></svg>',
        },
        {
          key: "wrap-italic",
          label: t("Wrap italic"),
          binding: "mod+shift+i",
          template: "*$^*",
          icon: '<svg t="1644033462513" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2021" width="200" height="200"><path d="M382.72 810.666667L542.72 213.333333H426.666667a42.666667 42.666667 0 1 1 0-85.333333h341.333333a42.666667 42.666667 0 0 1 0 85.333333h-136.874667L471.04 810.666667H597.333333a42.666667 42.666667 0 0 1 0 85.333333H256a42.666667 42.666667 0 0 1 0-85.333333h126.72z" fill="#eee" p-id="2022"></path></svg>',
        },
        {
          key: "wrap-strike-through",
          label: t("Wrap strike through"),
          binding: "",
          template: "~~$^~~",
          icon: '<svg t="1647222242775" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1518" width="200" height="200"><path d="M1014.869333 468.650667H578.161778c-11.406222-2.275556-23.409778-4.579556-36.124445-6.855111a2110.094222 2110.094222 0 0 1-35.185777-6.627556c-58.624-11.434667-93.923556-22.869333-122.026667-39.111111-40.135111-23.409778-59.676444-55.182222-59.676445-97.251556 0-42.268444 17.351111-77.368889 50.289778-101.717333 32.426667-23.978667 78.620444-36.693333 133.489778-36.693333 62.606222 0 110.933333 16.497778 143.758222 48.924444a144.839111 144.839111 0 0 1 36.352 60.131556c1.479111 4.664889 3.185778 11.406222 4.892445 20.337777 1.052444 5.489778 5.973333 9.386667 11.320889 9.386667h83.2a11.576889 11.576889 0 0 0 11.548444-11.576889v-1.137778a268.629333 268.629333 0 0 0-2.275556-18.289777C789.333333 238.478222 765.724444 194.844444 729.486222 162.133333c-50.744889-46.307556-125.383111-70.627556-215.665778-70.627555-82.631111 0-157.013333 20.679111-209.464888 58.168889-29.269333 21.048889-51.911111 47.075556-66.986667 77.368889-15.416889 30.976-23.210667 66.730667-23.210667 106.154666 0 33.735111 6.542222 62.293333 19.797334 87.438222 9.472 17.92 22.385778 33.706667 38.968888 48.014223H9.102222a9.159111 9.159111 0 0 0-9.130666 9.130666v68.551111c0 5.034667 4.124444 9.159111 9.130666 9.159112h495.104l6.741334 1.365333c35.299556 7.111111 56.576 11.889778 76.117333 17.379555 26.282667 7.424 46.392889 15.217778 63.089778 24.576 40.903111 23.096889 60.899556 56.234667 60.899555 101.717334 0 40.334222-17.720889 76.344889-49.834666 101.489778-34.844444 27.306667-86.385778 41.585778-149.134223 41.585777-49.948444 0-92.216889-9.699556-125.952-28.558222-33.251556-18.631111-56.092444-45.511111-68.209777-79.445333a122.965333 122.965333 0 0 1-3.100445-10.268445 11.690667 11.690667 0 0 0-11.093333-8.590222H212.707556a11.576889 11.576889 0 0 0-11.548445 11.548445v1.137777c0.227556 2.645333 0.483556 4.835556 0.711111 6.542223 7.395556 55.751111 34.616889 101.461333 80.782222 135.765333 53.845333 39.765333 129.592889 60.785778 219.192889 60.785778 96.227556 0 176.924444-22.613333 233.386667-65.479111a215.893333 215.893333 0 0 0 65.251556-78.876445c14.848-30.947556 22.528-66.161778 22.528-104.561778 0-36.323556-6.627556-66.730667-20.366223-93.013333a157.184 157.184 0 0 0-24.888889-35.214222h237.141334a9.159111 9.159111 0 0 0 9.130666-9.130667v-68.579555a9.159111 9.159111 0 0 0-9.130666-9.016889z" p-id="1519" fill="#eee"></path></svg>',
        },
      ],
    },
    {
      key: "group-hl-custom", // 背景高亮组
      items: [
        {
          key: "wrap-red-hl",
          label: t("Wrap with red highlight"),
          binding: "",
          template: "[:mark.red $^]", // Hiccup语法 - 红色背景
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#ffc7c7"></path></svg>',
        },
        {
          key: "wrap-yellow-hl",
          label: t("Wrap with yellow highlight"),
          binding: "",
          template: "[:mark.yellow $^]", // Hiccup语法 - 黄色背景
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#ffe79a"></path></svg>',
        },
        {
          key: "wrap-blue-hl",
          label: t("Wrap with blue highlight"),
          binding: "",
          template: "[:mark.blue $^]", // Hiccup语法 - 蓝色背景
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#abdfff"></path></svg>',
        },
        {
          key: "wrap-green-hl",
          label: t("Wrap with green highlight"),
          binding: "",
          template: "[:mark.green $^]", // Hiccup语法 - 绿色背景
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#ccffc1"></path></svg>',
        },
        {
          key: "wrap-purple-hl",
          label: t("Wrap with purple highlight"),
          binding: "",
          template: "[:mark.purple $^]", // Hiccup语法 - 紫色背景
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#e8ccff"></path></svg>',
        },
      ],
    },
    {
      key: "group-text-custom", // 字体颜色组
      items: [
        {
          key: "wrap-red-text",
          label: t("Wrap with red text"),
          binding: "",
          template: "[:span.red $^]", // Hiccup语法 - 红色字体
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#f00"></path></svg>',
        },
        {
          key: "wrap-yellow-text",
          label: t("Wrap with yellow text"),
          binding: "",
          template: "[:span.yellow $^]", // Hiccup语法 - 黄色字体
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#e6b800"></path></svg>',
        },
        {
          key: "wrap-blue-text",
          label: t("Wrap with blue text"),
          binding: "",
          template: "[:span.blue $^]", // Hiccup语法 - 蓝色字体
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#0066ff"></path></svg>',
        },
        {
          key: "wrap-green-text",
          label: t("Wrap with green text"),
          binding: "",
          template: "[:span.green $^]", // Hiccup语法 - 绿色字体
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#00cc00"></path></svg>',
        },
        {
          key: "wrap-purple-text",
          label: t("Wrap with purple text"),
          binding: "",
          template: "[:span.purple $^]", // Hiccup语法 - 紫色字体
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#9933cc"></path></svg>',
        },
      ],
    },
    {
      key: "group-underline-custom", // 下划线高亮组
      items: [
        {
          key: "wrap-red-underline",
          label: t("Wrap with red underline"),
          binding: "",
          template: "[:mark.red-underline $^]", // Hiccup语法 - 红色下划线
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#ff0000"></path></svg>',
        },
        {
          key: "wrap-yellow-underline",
          label: t("Wrap with yellow underline"),
          binding: "",
          template: "[:mark.yellow-underline $^]", // Hiccup语法 - 黄色下划线
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#e6b800"></path></svg>',
        },
        {
          key: "wrap-blue-underline",
          label: t("Wrap with blue underline"),
          binding: "",
          template: "[:mark.blue-underline $^]", // Hiccup语法 - 蓝色下划线
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#0066ff"></path></svg>',
        },
        {
          key: "wrap-green-underline",
          label: t("Wrap with green underline"),
          binding: "",
          template: "[:mark.green-underline $^]", // Hiccup语法 - 绿色下划线
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#00cc00"></path></svg>',
        },
        {
          key: "wrap-purple-underline",
          label: t("Wrap with purple underline"),
          binding: "",
          template: "[:mark.purple-underline $^]", // Hiccup语法 - 紫色下划线
          icon: '<svg t="1643270432116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12761" width="200" height="200"><path d="M256 768h512a85.333333 85.333333 0 0 1 85.333333 85.333333v42.666667a85.333333 85.333333 0 0 1-85.333333 85.333333H256a85.333333 85.333333 0 0 1-85.333333-85.333333v-42.666667a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 85.333333v42.666667h512v-42.666667H256z m401.578667-341.333333H366.421333L298.666667 682.666667H213.333333l256.128-640H554.666667l256 640h-85.333334l-67.754666-170.666667z m-33.877334-85.333333L512 145.365333 400.298667 426.666667h223.402666z" p-id="12762" fill="#9933cc"></path></svg>',
        },
      ],
    },
    {
      key: "wrap-cloze",
      label: t("Wrap with cloze"),
      binding: "",
      template: " {{cloze $^}}",
      icon: '<svg t="1643261888324" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5478" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M341.333333 396.8V320H170.666667v384h170.666666v-76.8H256V396.8zM682.666667 396.8V320h170.666666v384h-170.666666v-76.8h85.333333V396.8zM535.04 533.333333h40.96v-42.666666h-40.96V203.093333l92.16-24.746666-11.093333-40.96-102.4 27.306666-102.4-27.306666-11.093334 40.96 92.16 24.746666v287.573334H448v42.666666h44.373333v287.573334l-92.16 24.746666 11.093334 40.96 102.4-27.306666 102.4 27.306666 11.093333-40.96-92.16-24.746666z" p-id="5479" fill="#eeeeee"></path></svg>',
    },
    {
      key: "group-annotation",
      items: [
        {
          key: "anno-add",
          label: t("Add annotation"),
          binding: "",
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#abdfff"></path></svg>',
        },
      ],
    },
    {
      key: "group-comment",
      items: [
        {
          key: "comment-page",
          label: t("Add page comment"),
          binding: "",
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#ccffc1"></path></svg>',
        },
        {
          key: "comment-journal",
          label: t("Add journal comment"),
          binding: "",
          icon: '<svg t="1643262039637" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6950" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"><defs><style type="text/css"></style></defs><path d="M114.727313 1024l0.305421-0.427589h-0.977347l0.671926 0.427589zM632.721199 809.365446c-156.680934 0-272.466006 41.644143-341.659116 75.927642L290.878831 972.108985C340.402833 942.605324 458.249497 885.720677 632.73647 885.720677H962.804862v-76.355231H632.73647z m-109.432317-72.018253l252.048617-528.378197a38.177615 38.177615 0 0 0-13.621773-48.790993L551.295981 24.464216a38.192886 38.192886 0 0 0-50.089031 7.696607L130.349594 483.908911a38.208157 38.208157 0 0 0-7.024682 35.886958c31.763776 100.315502 36.436716 182.626441 34.695817 234.777064L94.477906 870.449631h132.094549l32.221908-42.606219c49.78361-25.624815 134.15614-60.931474 233.326314-69.177839a38.147073 38.147073 0 0 0 31.152934-21.31838z m-59.343285-52.54767c-71.66702 8.505973-134.950235 28.572127-184.489509 49.157497l-45.339736-29.244053c-2.290657-50.883126-10.613377-114.716099-31.901215-187.849139l336.161539-409.874879 153.474014 98.986922-193.728492 408.653195-176.838714-112.746134-47.935814 60.015211 191.117142 121.847678-0.519215 1.053702z" p-id="6951" fill="#ffe79a"></path></svg>',
        },
      ],
    },
  ]
}

function registerCommand(model, { key, label, binding }) {
  if (binding) {
    logseq.App.registerCommandPalette(
      { key, label, keybinding: { binding } },
      model[key],
    )
  } else {
    logseq.App.registerCommandPalette({ key, label }, model[key])
  }
}

function registerModel(
  model,
  { key, template, pluginCommand, regex, replacement },
) {
  if (key.startsWith("wrap-")) {
    model[key] = () => updateBlockText(wrap, template, pluginCommand)
  } else if (key.startsWith("repl-")) {
    model[key] = () => updateBlockText(repl, regex, replacement)
  } else if (key.startsWith("anno-")) {
    model[key] = () => handleAnnotation()
  } else if (key.startsWith("comment-")) {
    if (key === "comment-page") {
      model[key] = () => handleComment("page")
    } else if (key === "comment-journal") {
      model[key] = () => handleComment("journal")
    }
  }
}

async function updateBlockText(producer, ...args) {
  const block = await logseq.Editor.getCurrentBlock()

  if (block == null || textarea == null) {
    logseq.App.showMsg(
      t("This command can only be used when editing text"),
      "error",
    )
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = textarea.value.substring(0, start)
  const selection = textarea.value.substring(start, end)
  const after = textarea.value.substring(end)
  const [text, selStart, selEnd] = await producer(
    before,
    selection,
    after,
    start,
    end,
    ...args,
  )
  
  if (isTestMode) {
    // 在测试模式下直接更新textarea
    textarea.value = text
    textarea.focus()
    textarea.setSelectionRange(selStart, selEnd)
  } else {
    // 在Logseq环境下使用Logseq API
    await logseq.Editor.updateBlock(block.uuid, text)
    if (textarea?.isConnected) {
      textarea.focus()
      textarea.setSelectionRange(selStart, selEnd)
    } else {
      await logseq.Editor.editBlock(block.uuid)
      parent.document.activeElement.setSelectionRange(selStart, selEnd)
    }
  }
}

async function wrap(
  before,
  selection,
  after,
  start,
  end,
  template,
  pluginCommand,
) {
  const m = selection.match(/\s+$/)
  const [text, whitespaces] =
    m == null ? [selection, ""] : [selection.substring(0, m.index), m[0]]

  if (template.includes("$%") && pluginCommand) {
    const pluginId = pluginCommand.split(".")[0]
    const pluginInfo = await logseq.App.getExternalPlugin(pluginId)
    if (pluginInfo != null && !pluginInfo.settings?.disabled) {
      const commandRet = await logseq.App.invokeExternalPlugin(pluginCommand)
      template = template.replace("$%", commandRet == null ? "" : commandRet)
    } else {
      logseq.UI.showMsg(
        t('You must have the plugin "${pluginId}" installed and enabled.', {
          pluginId,
        }),
        "warning",
        { timeout: 10000 },
      )
      return [`${before}${selection}${after}`, start, end]
    }
  }

  const [wrapBefore, wrapAfter] = template.split("$^")
  return [
    `${before}${wrapBefore}${text}${wrapAfter ?? ""}${whitespaces}${after}`,
    start,
    end + wrapBefore.length - whitespaces.length + (wrapAfter?.length || 0),
  ]
}

function repl(before, selection, after, start, end, regex, replacement) {
  const newText = selection.replace(new RegExp(regex, "g"), replacement)
  return [`${before}${newText}${after}`, start, start + newText.length]
}

async function onSelectionChange(e) {
  const activeElement = parent.document.activeElement
  if (
    activeElement !== textarea &&
    activeElement.nodeName.toLowerCase() === "textarea"
  ) {
    if (toolbar != null && textarea != null) {
      textarea.removeEventListener("keydown", deletionWorkaroundHandler)
    }
    textarea = activeElement
    if (toolbar != null) {
      textarea.addEventListener("keydown", deletionWorkaroundHandler)
    }
  }

  if (toolbar != null && activeElement === textarea) {
    if (
      textarea.selectionStart === textarea.selectionEnd &&
      toolbar.style.opacity !== "0"
    ) {
      toolbar.style.opacity = "0"
    } else if (textarea.selectionStart !== textarea.selectionEnd) {
      if (!isTestMode) {
        await positionToolbar()
      }
    }
  }
}

function deletionWorkaroundHandler(e) {
  if (
    (e.key === "Backspace" || e.key === "Delete") &&
    textarea.selectionStart === 0 &&
    textarea.selectionEnd === textarea.value.length &&
    toolbar.style.opacity !== "0"
  ) {
    toolbar.style.opacity = "0"
  }
}

async function positionToolbar() {
  const curPos = await logseq.Editor.getEditingCursorPosition()
  if (curPos != null) {
    // 计算位置和宽度
    let leftPosition
    let width = toolbar.clientWidth
    
    if (
      curPos.left + curPos.rect.x + width <=
      parent.window.innerWidth
    ) {
      leftPosition = `${curPos.left + curPos.rect.x}px`
    } else {
      width = parent.window.innerWidth - (curPos.left + curPos.rect.x)
      leftPosition = `${curPos.left + curPos.rect.x}px`
    }
    
    // 设置工具栏位置和宽度
    toolbar.style.top = `${curPos.top + curPos.rect.y - 35}px`
    toolbar.style.left = leftPosition
    toolbar.style.width = `${width}px`
    toolbar.style.opacity = "1"
    
    // 设置赞赏栏位置和宽度
    if (sponsorBar) {
      sponsorBar.style.top = `${curPos.top + curPos.rect.y - 5}px`
      sponsorBar.style.left = leftPosition
      sponsorBar.style.width = `${width}px`
      sponsorBar.style.opacity = "1"
    }
  }
}

function onToolbarTransitionEnd(e) {
  if (toolbar.style.opacity === "0") {
    toolbar.style.top = "0"
    toolbar.style.left = "-99999px"
    // 同时隐藏赞赏栏
    if (sponsorBar) {
      sponsorBar.style.top = "0"
      sponsorBar.style.left = "-99999px"
    }
  }
}

function onBlur(e) {
  // Update toolbar visibility upon activeElement change.
  if (document.activeElement !== textarea && toolbar?.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    // 同时隐藏赞赏栏
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}

// There is a large gap between 2 displays of the toolbar, so a large
// ms number is acceptable.
const hideToolbar = throttle(() => {
  if (toolbar.style.opacity !== "0") {
    toolbar.style.opacity = "0"
    // 同时隐藏赞赏栏
    if (sponsorBar) {
      sponsorBar.style.opacity = "0"
    }
  }
}, 1000)

const showToolbar = debounce(async () => {
  if (textarea != null && textarea.selectionStart !== textarea.selectionEnd) {
    await positionToolbar()
  }
}, 100)

function onScroll(e) {
  hideToolbar()
  showToolbar()
}

function toggleToolbarDisplay() {
  const appContainer = parent.document.getElementById("app-container")
  if (appContainer.classList.contains("kef-wrap-hidden")) {
    appContainer.classList.remove("kef-wrap-hidden")
  } else {
    appContainer.classList.add("kef-wrap-hidden")
  }
}

async function handleAnnotation() {
  // 获取当前页面
  const currentPage = await logseq.Editor.getCurrentPage()
  if (!currentPage) return

  // 获取当前编辑的块
  const currentBlock = await logseq.Editor.getCurrentBlock()
  if (!currentBlock) return

  // 获取选中的文本
  const activeElement = parent.document.activeElement
  if (activeElement.nodeName.toLowerCase() !== "textarea") {
    logseq.App.showMsg("请先选择要添加标注的文本", "error")
    return
  }
  
  const textarea = activeElement
  const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  if (!selection.trim()) {
    logseq.App.showMsg("请选择要添加标注的文本", "error")
    return
  }

  if (isTestMode) {
    // 在测试模式下的处理
    alert('标注功能已触发\n\n测试模式下的操作：\n1. 模拟在当前页面尾部添加 ## annotation 标题\n2. 将选中的文本作为子节点添加\n3. 在子节点下创建空白节点并定位光标')
    return
  }

  // 查找或创建 "## annotation" 块
  let annotationBlock = null
  const blocks = await logseq.Editor.getPageBlocksTree(currentPage.name)
  
  for (const block of blocks) {
    if (block.content.trim() === "## annotation") {
      annotationBlock = block
      break
    }
  }

  if (!annotationBlock) {
    // 创建 "## annotation" 块
    annotationBlock = await logseq.Editor.insertBlock(
      currentPage.uuid,
      "## annotation",
      { before: false }
    )
  }

  // 在 annotation 块下创建子块，内容为选中的文本
  const childBlock = await logseq.Editor.insertBlock(
    annotationBlock.uuid,
    selection.trim(),
    { before: false }
  )

  // 在子块下创建空白块并将光标定位到这里
  const commentBlock = await logseq.Editor.insertBlock(
    childBlock.uuid,
    "",
    { before: false }
  )

  // 编辑新创建的空白块
  await logseq.Editor.editBlock(commentBlock.uuid)
}

async function handleComment(type) {
  // 获取当前编辑的块
  const currentBlock = await logseq.Editor.getCurrentBlock()
  if (!currentBlock) return

  // 获取选中的文本
  const activeElement = parent.document.activeElement
  if (activeElement.nodeName.toLowerCase() !== "textarea") {
    logseq.App.showMsg("请先选择要添加评论的文本", "error")
    return
  }
  
  const textarea = activeElement
  const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
  if (!selection.trim()) {
    logseq.App.showMsg("请选择要添加评论的文本", "error")
    return
  }

  if (isTestMode) {
    // 在测试模式下的处理
    const commentType = type === 'page' ? '页面' : '日记'
    alert(`${commentType}评论功能已触发\n\n测试模式下的操作：\n1. 在${commentType}页面创建 ## comment 标题\n2. 创建子节点，内容为选中节点的引用\n3. 在子节点下创建空白节点并定位光标`)
    return
  }

  // 确定目标页面
  let targetPage
  if (type === "page") {
    // 使用当前页面
    targetPage = await logseq.Editor.getCurrentPage()
  } else if (type === "journal") {
    // 使用当前日期的 journal 页面
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const journalName = `${year}-${month}-${day}`
    targetPage = await logseq.Editor.createPage(journalName, {}, { journal: true })
  }

  if (!targetPage) return

  // 查找或创建 "## comment" 块
  let commentBlock = null
  const blocks = await logseq.Editor.getPageBlocksTree(targetPage.name)
  
  for (const block of blocks) {
    if (block.content.trim() === "## comment") {
      commentBlock = block
      break
    }
  }

  if (!commentBlock) {
    // 创建 "## comment" 块
    commentBlock = await logseq.Editor.insertBlock(
      targetPage.uuid,
      "## comment",
      { before: false }
    )
  }

  // 获取当前块的引用
  const blockRef = `(((${currentBlock.uuid}))`
  
  // 在 comment 块下创建子块，内容为块引用
  const refBlock = await logseq.Editor.insertBlock(
    commentBlock.uuid,
    blockRef,
    { before: false }
  )

  // 在子块下创建空白块并将光标定位到这里
  const newCommentBlock = await logseq.Editor.insertBlock(
    refBlock.uuid,
    "",
    { before: false }
  )

  // 编辑新创建的空白块
  await logseq.Editor.editBlock(newCommentBlock.uuid)
}

logseq.ready(main).catch(console.error)