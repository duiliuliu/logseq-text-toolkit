# Electron functional E2E

This harness loads the **real built plugin** (`dist/index.js`) inside Electron and
drives the real React UI with a mock Logseq Host.

It is intentionally not a real Logseq profile test:

- no user graph or profile is touched
- no plugin installation / onboarding / graph initialization is required
- the HTTP server serves the harness, `settings.js`, and `dist/` with `no-store`
- the plugin still exercises the real DOM, React, SDK selection path and built CSS

## Latest report

[docs/testing/reports/2026-10-19-functional-test-report.html](../../docs/testing/reports/2026-10-19-functional-test-report.html)

## Run

```bash
npm run e2e
```

`e2e` first builds the plugin, then runs the browser suite. If `dist/index.js`
already exists and is current:

```bash
npm run e2e:no-build
```

Requirements:

- Node 22+ (the runner uses the global `WebSocket`)
- Electron installed locally:

  ```bash
  npm i -D electron
  ```

  or point at an existing binary:

  ```bash
  ELECTRON_BIN=/path/to/Electron npm run e2e:no-build
  ```

- On Linux CI, an X server or `xvfb-run` is required.

## Coverage

The suite covers:

| Area | Checks |
| --- | --- |
| Registration | plugin ready, 4 macro handlers, 5 slash commands, CSS/i18n |
| Settings | modal tabs, BlockView tab, save success |
| Selection toolbar | SDK `onInputSelectionEnd`, format action, comment modal/save |
| BlockView | list/table/gallery/board, table grid columns, live settings refresh |
| TaskProgress | macro render, tag-only task counted |
| Heatmap | macro render, month/week switch, scheduled date attribute |
| Milestone | macro render with stages |
| Summary | generation, local insights, heatmap macro, custom range, yearly page, safe replacement |
| HTML viewer | asset list, sandboxed preview, text annotation/highlight, panel controls, dashboard fullscreen/link, persistence |
| Slash commands | all insert commands |
| Old-host fallback | no SDK selection hook; and SDK hook present but silent |

## Why not real Logseq in CI?

A real Logseq profile test has a different failure surface:

- Logseq single-instance locks and app-data paths
- onboarding / graph selection
- plugin installation and reload semantics
- OS-specific Electron packaging
- user graph state and schema drift

It is a useful **release smoke test**, but a poor routine regression gate. Keep it
manual; use this harness for deterministic UI/API contract checks and use the
Logseq CLI + real DB queries for Datalog validation.

## Manual real-Logseq smoke checklist

Before a release, on a disposable profile/graph:

1. Install the built plugin and open a DB graph.
2. Select text in a block; verify toolbar appears and formatting/comment work.
3. Render BlockView and switch all four views.
4. Render TaskProgress, Heatmap, Milestone.
5. Generate weekly, monthly, yearly and custom summaries.
6. Regenerate a summary page; verify old generated summary is replaced and user notes remain.
7. Change BlockView/Summary settings and verify they apply.
