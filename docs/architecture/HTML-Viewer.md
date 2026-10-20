# HTML Viewer / HTML Attachment Annotations

## What it does

Text Toolkit can open `.html` / `.htm` attachments from a DB graph in a
PDF-like reading panel:

- open from the slash command **Open HTML Viewer** or from an HTML asset block
- dock the panel to the left or right
- drag the divider to resize; toggle fullscreen
- select text in the rendered HTML, add an annotation and an optional note
- jump back to a saved annotation (text-quote + prefix/suffix anchor)
- restore annotations when the same asset is opened again
- optionally write each annotation as a **child block of the HTML asset block**
  (fallback: a page named `HTML 标注 - <filename>` if the asset block cannot be resolved)

The panel is deliberately **not** a native Logseq right-sidebar renderer. It is
a self-contained docked panel implemented with `provideUI` and the plugin's React
root. This keeps it available on stable SDK hosts and avoids depending on a
particular sidebar implementation.

## Entry points

1. Slash command: `[Text Toolkit] Open HTML Viewer`
2. Experimental `registerBlockRenderer`: an HTML asset block (detected via
   `:logseq.property.asset/type` = `html` / `htm` / `text/html`) is replaced with
   a launcher card. This is best-effort and is skipped if the Experiments API is
   unavailable.

The asset picker lists `Assets.listFilesOfCurrentGraph(['html', 'htm'])`; if the
host does not implement asset listing, a path can be entered manually
(`assets/report.html`).

## Annotation storage

Two layers:

1. **Anchor metadata** (`quote`, `start`, `end`, `prefix`, `suffix`) is stored in
   plugin `FileStorage`, keyed by asset path. This is what makes jump-back
   reliable when an HTML file changes.
2. **Graph block** (optional, default on): quote + note + source path is inserted
   as a child block of the HTML asset block. This mirrors the PDF model where
   annotation blocks live under the asset block and are associated with it.
   If the asset block cannot be resolved (manual path/external URL), fallback to
   a page named `<prefix><filename>`. Deleting an annotation removes that block
   when its UUID is known.

The graph block is intentionally human-readable markdown, not an opaque JSON
blob. The side effect is that if plugin file storage is cleared, the visible
blocks remain but the precise selector metadata is lost. That is an explicit
trade-off for the MVP.

## Security model

- `sandbox="allow-same-origin"` by default; **scripts are disabled**.
- scripts can be enabled only by an explicit setting; this combination is
  dangerous and disabled by default.
- remote `src` / `href` / `poster` / `srcset` and remote CSS `url()` / `@import`
  are stripped by default.
- `iframe`, `object`, `embed`, `applet`, `form`, event-handler attributes and
  `javascript:` URLs are removed.
- `meta http-equiv=refresh` and existing `<base>` elements are removed.
- A same-origin `srcdoc` iframe is used so the host can attach selection
  listeners and render CSS Highlight API highlights; no scripts are required
  inside the attachment for this.
- Remote links are opened via Logseq's external-link API rather than navigated
  inside the reading panel.

## SDK dependencies

- `Assets.listFilesOfCurrentGraph`, `Assets.makeUrl`, `Assets.builtInOpen`
- `FileStorage`
- `Editor.getPage`, `createPage`, `insertBlock`, `removeBlock`
- `App.pushState`, `App.openExternalLink`
- optional `Experiments.registerBlockRenderer`

The stable path (asset picker + viewer + annotation) works without the
Experiments API. The asset-block launcher is the only experimental part.

## Known limitations

- `Assets.makeUrl` may return a URL that cannot be fetched by a plugin in some
  Logseq versions. The error state offers "Open in system browser" fallback.
- This is not the native PDF viewer: no PDF-style toolbar, zoom, outline, area
  highlights, or unified PDF annotation list.
- Annotations are child blocks of the asset block (plus a best-effort
  `:logseq.property/asset` property). They do not use the private
  `Pdf-annotation` class, so they are not part of the core PDF annotation
  unified view.
- Mobile/web plugin runtimes may not expose the same asset APIs; the feature is
  desktop-first.
- HTML with scripts is intentionally restricted; interactive dashboards that
  require JavaScript will not work until the user opts in.

## Tests

- Unit: sanitizer, text anchors, annotation storage, graph writer, asset block
  detection.
- Electron E2E: open asset, select text, annotate, verify highlight + sidebar +
  graph block, panel left/right/fullscreen, close/reopen persistence.
- Real Logseq release smoke: open a real self-contained HTML asset and verify
  fetch, selection and annotation page on the supported DB build.
