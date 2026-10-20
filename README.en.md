# Logseq Text Toolkit ✨

A DB-first Logseq toolkit for text formatting, task progress, heatmaps, block
views, summaries, HTML reading/annotation and AI-generated dashboards.

[中文版本](README.md) | English

👉 [Live preview](https://duiliuliu.github.io/logseq-text-toolkit/) | [Experimental preview](https://duiliuliu.github.io/logseq-text-toolkit/dev/) | [User guide](docs/USER_GUIDE.en.md) | [HTML Viewer design](docs/architecture/HTML-Viewer.md)

---

## Features

| Module | What it does |
|---|---|
| **Text formatting** | Bold, italic, strike, sub/sup, code, highlight, text color, underline, file link, inline comments |
| **Selection toolbar** | Appears on text selection; configurable buttons and shortcuts |
| **Task Progress** | Nested task counting, five display styles, custom status colors, completion fireworks |
| **Heatmap** | Year / month / week views, tag/page/property queries, custom colors, page creation |
| **Block View** | List, table, gallery, board and experimental mind map; multiple themes |
| **Milestone** | Capsule/badge/track/card/compact views, tag/page/property queries, templates |
| **Summary** | Weekly/monthly/yearly/custom ranges, GTD/minimal dashboard/OKR/study templates |
| **HTML Viewer** | Sandboxed HTML attachment preview, text annotations and notes, jump-back highlights |
| **HTML Dashboard** | Select a periodically generated HTML file as a fullscreen dashboard; links open Logseq pages/blocks |
| **Theme / i18n** | Light/dark, Chinese/English/Japanese, CSS overrides |

> Requires a **Logseq DB graph**. `minSDKVersion` is **0.3.1**. File graphs are not supported.

---

## Quick start

### Install

**Marketplace (recommended)**

1. Logseq → menu → **Plugins**
2. Search `logseq-text-toolkit` → **Install**

**Load from GitHub**

1. Logseq → menu → **Plugins**
2. **Load plugin from URL**
3. Enter `https://github.com/duiliuliu/logseq-text-toolkit/`

Current version: **1.2.12**.

### Text formatting

Select text → click a toolbar button.

```markdown
**bold**  *italic*  ~~strike~~  `code`  ==highlight==
```

### Task progress

```markdown
- My project {{renderer :taskprogress}}
  - Task 1 #task status:: todo
  - Task 2 #task status:: doing
  - Task 3 #task status:: done
```

### Heatmap

```markdown
{{renderer :heatmap, view=year, tag=work}}
{{renderer :heatmap, view=month, page=My Page}}
{{renderer :heatmap, view=week, property=category::work}}
```

### Block View

```markdown
{{renderer :block-view, view=table, theme=notion}}
{{renderer :block-view, view=gallery}}
{{renderer :block-view, view=board}}
{{renderer :block-view, view=mind}}
```

### Milestone

```markdown
{{renderer :milestone, filterTag=project, milestonePropKey=phase, milestoneList=Requirement;Design;Development;Testing;Launch}}
{{renderer :milestone, template=my_template}}
```

### Summary

Open the Summary modal from the plugin command, or run:

```text
[Text Toolkit] Generate Summary
```

Choose summary type, template and range. GTD work review, minimal dashboard,
bullet journal, OKR review and study summary templates are available.

---

## HTML Viewer

Open:

```text
[Text Toolkit] Open HTML Viewer
```

or use the compact preview button on an HTML asset block. The top toolbar button is reserved for a configured Dashboard.

- Left/right dock, drag to resize, fullscreen, close
- Select text → **Annotate** → optional note
- Highlights are restored on reopen
- Annotations are written as child blocks of the HTML asset block; fallback is
  an `HTML 标注 - <filename>` page
- Precise text anchors are stored in plugin FileStorage

Security defaults:

- iframe sandbox is `allow-same-origin` without scripts
- remote resources and scripts are stripped/disabled
- only trusted HTML should enable scripts or remote resources in settings

---

## HTML Dashboard

Put a periodically generated file under `assets/`:

```text
assets/dashboard-2026-10-20.html
```

Then:

```text
Settings → HTML Viewer → Dashboard
```

- choose the HTML attachment
- keep **Open dashboard fullscreen** enabled
- optionally show the toolbar button

Click the toolbar dashboard button or run:

```text
[Text Toolkit] Open Dashboard
```

Regenerating the same file updates the dashboard; no plugin restart or DB
migration is required.

### Link dashboard HTML to Logseq

Scripts are disabled by default, but the viewer safely handles links:

```html
<a href="logseq://page/2026-W42">This week's report</a>
<a href="logseq://block/6a1f3c2e-...">Open task</a>
```

Restricted declarative navigation is also supported:

```html
<button data-ls-call="App.pushState"
        data-ls-args='{"k":"page","params":{"name":"2026-W42"}}'>
  This week's report
</button>
```

Allowed navigation methods: `App.pushState`, `App.openExternalLink`,
`Editor.openInRightSidebar`. Write operations are intentionally blocked.

> Dashboard opens from the toolbar/command. Logseq's `:default-home` is not
> modified. Making it the startup page requires a real page macro plus
> `:default-home`.

---

## Settings

The settings modal has eight tabs:

```text
General / Toolbar / Task Progress / Heatmap / Block View / Summary / Milestone / HTML Viewer
```

HTML Viewer settings include:

| Setting | Default | Description |
|---|---|---|
| Default side | right | left or right dock |
| Default width | 56 | percentage of viewport |
| Dashboard toolbar button | on | show the Dashboard button when a dashboard is configured |
| Dashboard asset | empty | chosen HTML attachment |
| Dashboard fullscreen | on | open dashboard fullscreen |
| Write annotations to graph | on | asset child block, fallback page |
| Annotation page prefix | `HTML 标注 - ` | fallback page prefix |
| Allow scripts | off | dangerous; trusted files only |
| Allow remote resources | off | keep self-contained HTML offline |

---

## Tests and docs

- [Full functional report](docs/testing/reports/2026-10-19-functional-test-report.html)
- [User guide](docs/USER_GUIDE.en.md)
- [HTML Viewer design and limitations](docs/architecture/HTML-Viewer.md)
- [Real Logseq smoke checklist](docs/architecture/Real-Logseq-Smoke-Test.md)

Current verification:

```text
Vitest: 80 files / 718 tests passed
Electron E2E: 25/25 passed
```

The Electron suite uses a host mock, not a real Logseq installation. Run the
real-device smoke checklist before claiming full production validation.

---

## Development

```bash
npm install
npm run dev
npm test
npm run check
npm run build:plugin
npm run e2e
npm run validate:translations
```

Project structure:

```text
src/
├── components/       # React UI (Toolbar, TaskProgress, Heatmap, BlockView, Summary, HtmlViewer, Settings)
├── lib/              # business logic (blockView, summary, htmlViewer, render, ...)
├── settings/         # settings schema and defaults
├── translations/     # zh-CN / en / ja
└── utils/
```

## License

MIT
