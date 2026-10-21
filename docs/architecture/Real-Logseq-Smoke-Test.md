# Real Logseq Release Smoke Test

This checklist is for the final release gate. Routine regression uses
`scripts/e2e` (Electron + Host mock); this document covers the residual risk of
the real Logseq runtime.

## Why manual

A real Logseq UI test depends on:

- the installed Logseq version and bundled SDK
- the user's graph/profile and DB schema
- plugin installation and reload behavior
- OS-specific Electron packaging and single-instance locks
- onboarding / graph selection

Automating all of that in CI is brittle and can touch real user data. Use a
disposable profile/graph and run this checklist before a release.

## Safety

1. Do **not** test against your primary graph.
2. Create a disposable DB graph, or back up the graph first.
3. Keep the real Logseq instance closed while using any isolated-profile test.
4. Never commit API keys or graph data from the test.

## Setup

1. Build the plugin:

   ```bash
   npm run check
   ```

2. Open Logseq DB 2.0.2 (or the minimum supported DB build).
3. Enable Developer mode.
4. Load this repository as an unpacked plugin (`dist/index.html` as entry).
5. Open the disposable DB graph.

## Checklist

### Boot / registration

- [ ] Plugin loads without a red error in the developer console.
- [ ] Settings toolbar button exists.
- [ ] Slash commands are present: Task Progress, Heatmap, Summary, Block View, Milestone, Open HTML Viewer, Open Dashboard.
- [ ] No uncaught exception after 30 seconds idle.

### Selection toolbar

- [ ] Select text in a block: toolbar appears near the selection.
- [ ] Apply bold/italic/link/quote; block content updates exactly once.
- [ ] Select duplicate text (e.g. two `world` occurrences); the selected occurrence is replaced.
- [ ] Comment item opens modal; save writes an inline comment.
- [ ] Comment text containing `"` renders correctly after save.
- [ ] Toolbar hides on scroll/Escape/click outside.

### BlockView

- [ ] `{{renderer :blockview, view=list}}` shows the view bar.
- [ ] List / Table / Gallery / Board switch correctly.
- [ ] Table with two nested cells shows first column + 2 data columns.
- [ ] Gallery cards-per-row / spacing settings apply.
- [ ] `hideViewBar` hides the bar and restores it after settings change.
- [ ] Collapsed block does not show “empty” hint.
- [ ] Delete/undo a block containing a BlockView macro; no stale bar remains.

### TaskProgress

- [ ] Task-tag-only block without status is counted as todo.
- [ ] Done / Doing / Canceled statuses update the progress.
- [ ] Nested tasks obey the configured nesting level.
- [ ] Tooltip opens and does not break the editor.

### Heatmap

- [ ] Year / Month / Week views switch and navigate.
- [ ] `tag=Task` counts expected blocks.
- [ ] `dateField=scheduled` uses scheduled dates, not created dates.
- [ ] `dateField=custom` with a user property key works.
- [ ] Empty period renders without crashing.

### Milestone

- [ ] Default macro renders.
- [ ] `milestoneList=...` renders each stage.
- [ ] Empty data shows the empty state.
- [ ] Long labels/tooltips do not overflow.

### Summary

- [ ] Modal opens from slash command.
- [ ] Weekly generation creates a page named `周度总结-YYYY-Www`.
- [ ] Monthly generation covers the last day of the month.
- [ ] Yearly generation uses `年度总结-YYYY` and the minimal template.
- [ ] Custom range covers both selected dates; invalid range is rejected.
- [ ] Generated page includes active blocks, task stats, insights and a heatmap macro.
- [ ] Re-generate the same page: old generated summary is replaced; user notes remain.
- [ ] AI disabled: local insights are shown.
- [ ] AI enabled with a valid key: suggestions appear; invalid key/network failure falls back to local insights.
- [ ] Page navigation after generation works.

### Settings

- [ ] Save BlockView settings; existing blocks refresh.
- [ ] Save Summary page-name templates; next generation uses them.
- [ ] Toggle toolbar / sponsor / language; reload plugin and verify persistence.

### HTML Viewer

- [ ] Real `assets/*.html` attachment can be fetched via `Assets.makeUrl`.
- [ ] HTML renders in the sandboxed iframe with scripts disabled.
- [ ] Selecting text shows the Annotate action; saving creates an annotation.
- [ ] Annotation block appears under the HTML asset block (or fallback page).
- [ ] Reopen the attachment: annotations and highlights restore.
- [ ] Delete an annotation: graph block is removed when UUID is available.
- [ ] Left/right, resize, fullscreen and close work at real viewport size.
- [ ] Error fallback appears if asset fetch is blocked.

### HTML Dashboard

- [ ] Settings → HTML Viewer lists real HTML assets.
- [ ] Save a dashboard asset; toolbar button opens it without plugin reload.
- [ ] Dashboard opens fullscreen and annotation sidebar is hidden by default.
- [ ] `logseq://page/...` link navigates to the target page.
- [ ] `logseq://block/...` link opens the page and scrolls to the block.
- [ ] `data-ls-call` navigation whitelist works; non-whitelisted calls show a warning.
- [ ] Regenerating the same HTML file refreshes the dashboard after reopen.

### Compatibility

- [ ] Test on latest DB build and the minimum supported SDK build if available.
- [ ] Switch graphs; BlockView state and settings do not leak across graphs.
- [ ] Reload the plugin; no duplicate view bars or toolbar listeners.

## Evidence to capture

- Logseq version, plugin version, OS
- DevTools console screenshot/export
- One screenshot per major feature
- Any DB query used to cross-check Summary/Heatmap counts
