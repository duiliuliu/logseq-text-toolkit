import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getSettings } from '../../settings'
import { logseqAPI } from '../../logseq'
import { getDocument, getWindow } from '../../logseq/utils'
import { t } from '../../translations/i18n'
import {
  anchorToRange,
  applyHighlights,
  rangeToAnchor,
  scrollToRange,
} from '../../lib/htmlViewer/anchors'
import {
  loadAnnotations,
  saveAnnotations,
} from '../../lib/htmlViewer/storage'
import {
  removeAnnotationBlock,
  writeAnnotationToGraph,
} from '../../lib/htmlViewer/graph'
import { sanitizeHtml } from '../../lib/htmlViewer/sanitize'
import type { HtmlAnnotation, HtmlAssetFile, SelectionSnapshot } from '../../lib/htmlViewer/types'
import './htmlViewer.css'

interface HtmlViewerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPath?: string;
}

interface ViewerSettings {
  defaultSide: 'left' | 'right';
  defaultWidth: number;
  allowScripts: boolean;
  allowRemote: boolean;
  writeAnnotationsToGraph: boolean;
  annotationPagePrefix: string;
}

const DEFAULT_VIEWER_SETTINGS: ViewerSettings = {
  defaultSide: 'right',
  defaultWidth: 56,
  allowScripts: false,
  allowRemote: false,
  writeAnnotationsToGraph: true,
  annotationPagePrefix: 'HTML 标注 - ',
}

function currentSettings(): ViewerSettings {
  return {
    ...DEFAULT_VIEWER_SETTINGS,
    ...(getSettings().htmlViewer || {}),
  }
}

function basename(path: string): string {
  return path.split('/').pop() || path
}

function clampWidth(value: number): number {
  return Math.min(90, Math.max(30, Math.round(value)))
}

function createId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `html-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

export const HtmlViewer: React.FC<HtmlViewerProps> = ({ isOpen, onClose, initialPath }) => {
  const language = getSettings().language || 'zh-CN'
  const [viewerSettings, setViewerSettings] = useState<ViewerSettings>(() => currentSettings())
  const [assets, setAssets] = useState<HtmlAssetFile[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [manualPath, setManualPath] = useState('')
  const [selectedPath, setSelectedPath] = useState('')
  const [html, setHtml] = useState('')
  const [htmlKey, setHtmlKey] = useState(0)
  const [frameReady, setFrameReady] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [annotations, setAnnotations] = useState<HtmlAnnotation[]>([])
  const [selection, setSelection] = useState<SelectionSnapshot | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [side, setSide] = useState<'left' | 'right'>('right')
  const [width, setWidth] = useState(56)
  const [fullscreen, setFullscreen] = useState(false)
  const [showList, setShowList] = useState(true)
  const [activeId, setActiveId] = useState('')
  const [message, setMessage] = useState('')

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const annotationsRef = useRef<HtmlAnnotation[]>([])
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    annotationsRef.current = annotations
  }, [annotations])

  useEffect(() => {
    if (!isOpen) return
    const next = currentSettings()
    setViewerSettings(next)
    setSide(next.defaultSide)
    setWidth(clampWidth(next.defaultWidth))
    setFullscreen(false)
    setError('')
    setMessage('')
    void refreshAssets()
    if (initialPath) {
      void openAsset(initialPath)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPath])

  const refreshAssets = async () => {
    setAssetsLoading(true)
    try {
      const files = await logseqAPI.Assets?.listFilesOfCurrentGraph?.(['html', 'htm'])
      const list = Array.isArray(files) ? files : []
      setAssets(
        [...list].sort((a, b) => (b.modifiedTime || 0) - (a.modifiedTime || 0))
      )
    } catch {
      setAssets([])
    } finally {
      setAssetsLoading(false)
    }
  }

  const openAsset = async (path: string) => {
    const normalized = path.trim()
    if (!normalized) return
    setSelectedPath(normalized)
    setLoading(true)
    setError('')
    setHtml('')
    setFrameReady(0)
    setAnnotations([])
    setSelection(null)
    setComposerOpen(false)
    setMessage('')
    setActiveId('')

    try {
      const url = await logseqAPI.Assets?.makeUrl?.(normalized)
      if (!url) throw new Error('ASSET_URL_UNAVAILABLE')
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const raw = await response.text()
      const clean = sanitizeHtml(raw, {
        allowScripts: viewerSettings.allowScripts,
        allowRemote: viewerSettings.allowRemote,
        baseUrl: url,
      })
      const stored = await loadAnnotations(normalized)
      setHtml(clean)
      setHtmlKey((value) => value + 1)
      setAnnotations(stored)
    } catch (loadError) {
      setError(String(loadError))
    } finally {
      setLoading(false)
    }
  }

  const getFrameDocument = (): Document | null => {
    try {
      return iframeRef.current?.contentDocument || null
    } catch {
      return null
    }
  }

  const refreshHighlights = useCallback(() => {
    const doc = getFrameDocument()
    if (!doc) return
    applyHighlights(doc, annotationsRef.current)
  }, [])

  const handleFrameLoad = () => {
    const doc = getFrameDocument()
    if (!doc) {
      setError(t('settings.htmlViewer.fetchHint' as any, language))
      return
    }
    setFrameReady((value) => value + 1)
    refreshHighlights()
  }

  useEffect(() => {
    if (!selectedPath || !html) return
    const timer = window.setTimeout(() => {
      handleFrameLoad()
    }, 120)
    return () => window.clearTimeout(timer)
  }, [html, selectedPath, annotations, refreshHighlights])

  // Selection events live inside the sandboxed document. Scripts are disabled,
  // but allow-same-origin lets the host attach read-only selection listeners.
  useEffect(() => {
    if (!html || !frameReady) return
    const doc = getFrameDocument()
    if (!doc) return

    const onSelection = () => {
      window.setTimeout(() => {
        const currentDoc = getFrameDocument()
        if (!currentDoc) return
        const win = currentDoc.defaultView
        const sel = win?.getSelection()
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setSelection(null)
          return
        }
        const range = sel.getRangeAt(0)
        const anchor = rangeToAnchor(currentDoc, range)
        if (!anchor) {
          setSelection(null)
          return
        }
        const frameRect = iframeRef.current?.getBoundingClientRect()
        const rangeRect = range.getBoundingClientRect()
        if (!frameRect) return
        setSelection({
          anchor,
          top: frameRect.top + rangeRect.bottom + 8,
          left: Math.min(window.innerWidth - 120, frameRect.left + rangeRect.left),
        })
      }, 20)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const link = target?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link) return
      const href = link.getAttribute('href') || ''
      if (/^https?:\/\//i.test(href)) {
        event.preventDefault()
        void logseqAPI.App?.openExternalLink?.(href)
      }
    }

    doc.addEventListener('mouseup', onSelection)
    doc.addEventListener('keyup', onSelection)
    doc.addEventListener('click', onClick)
    return () => {
      doc.removeEventListener('mouseup', onSelection)
      doc.removeEventListener('keyup', onSelection)
      doc.removeEventListener('click', onClick)
    }
  }, [html, htmlKey, frameReady])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (composerOpen) {
        setComposerOpen(false)
        return
      }
      if (fullscreen) {
        setFullscreen(false)
        return
      }
      onCloseRef.current()
    }
    const doc = getDocument()
    doc.addEventListener('keydown', onKeyDown)
    return () => doc.removeEventListener('keydown', onKeyDown)
  }, [isOpen, composerOpen, fullscreen])

  const jumpTo = (annotation: HtmlAnnotation) => {
    const doc = getFrameDocument()
    if (!doc) return
    const range = anchorToRange(doc, annotation.anchor)
    setActiveId(annotation.id)
    if (!range) {
      setMessage(t('settings.htmlViewer.anchorLost' as any, language))
      return
    }
    scrollToRange(doc, range)
    setMessage('')
  }

  const saveAnnotation = async () => {
    if (!selection) return
    setSaving(true)
    setMessage('')
    const annotation: HtmlAnnotation = {
      id: createId(),
      assetPath: selectedPath,
      quote: selection.anchor.quote,
      comment: comment.trim(),
      anchor: selection.anchor,
      createdAt: Date.now(),
    }

    try {
      if (viewerSettings.writeAnnotationsToGraph) {
        const result = await writeAnnotationToGraph(annotation, viewerSettings.annotationPagePrefix)
        if (result) {
          annotation.blockUuid = result.blockUuid
          annotation.pageName = result.pageName
        }
      }
      const next = [...annotationsRef.current, annotation]
      await saveAnnotations(selectedPath, next)
      setAnnotations(next)
      annotationsRef.current = next
      refreshHighlights()
      setComposerOpen(false)
      setComment('')
      setSelection(null)
      setMessage(t('settings.htmlViewer.annotationSaved' as any, language))
    } catch {
      setMessage(t('settings.htmlViewer.annotationFailed' as any, language))
    } finally {
      setSaving(false)
    }
  }

  const deleteAnnotation = async (annotation: HtmlAnnotation) => {
    await removeAnnotationBlock(annotation.blockUuid)
    const next = annotationsRef.current.filter((item) => item.id !== annotation.id)
    await saveAnnotations(selectedPath, next)
    setAnnotations(next)
    annotationsRef.current = next
    refreshHighlights()
    if (activeId === annotation.id) setActiveId('')
  }

  const startResize = (event: React.PointerEvent) => {
    event.preventDefault()
    setFullscreen(false)
    const startX = event.clientX
    const startWidth = width
    const onMove = (moveEvent: PointerEvent) => {
      const delta = side === 'right' ? startX - moveEvent.clientX : moveEvent.clientX - startX
      setWidth(clampWidth(startWidth + (delta / getWindow().innerWidth) * 100))
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      getDocument().body.style.cursor = ''
      getDocument().body.style.userSelect = ''
    }
    getDocument().body.style.cursor = 'col-resize'
    getDocument().body.style.userSelect = 'none'
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  if (!isOpen) return null

  const visibleAssets = assets.filter((file) => {
    const lower = file.path.toLowerCase()
    if (!lower.endsWith('.html') && !lower.endsWith('.htm')) return false
    return !search.trim() || lower.includes(search.trim().toLowerCase())
  })
  const panelWidth = fullscreen ? 100 : width

  return (
    <div className="ltt-html-viewer-layer">
      <div
        ref={panelRef}
        className={`ltt-html-viewer-panel ${fullscreen ? 'is-fullscreen' : ''} is-${side}`}
        data-side={side}
        style={{ width: `${panelWidth}%` }}
        role="dialog"
        aria-modal="true"
        aria-label={t('settings.htmlViewer.assets' as any, language)}
      >
        <div
          className="ltt-html-viewer-resizer"
          onPointerDown={startResize}
          role="separator"
          aria-orientation="vertical"
        />
        <header className="ltt-html-viewer-header">
          <div className="ltt-html-viewer-heading">
            <strong>HTML</strong>
            <span className="ltt-html-viewer-file" title={selectedPath}>
              {selectedPath ? basename(selectedPath) : t('settings.htmlViewer.assets' as any, language)}
            </span>
          </div>
          <div className="ltt-html-viewer-actions">
            {selectedPath && (
              <button type="button" onClick={() => setSelectedPath('')} title={t('settings.htmlViewer.assets' as any, language)}>
                ☰
              </button>
            )}
            <button
              type="button"
              onClick={() => setSide(side === 'right' ? 'left' : 'right')}
              title={side === 'right' ? t('settings.htmlViewer.left' as any, language) : t('settings.htmlViewer.right' as any, language)}
            >
              {side === 'right' ? '⇤' : '⇥'}
            </button>
            <button
              type="button"
              onClick={() => setFullscreen((value) => !value)}
              title={fullscreen ? t('settings.htmlViewer.exitFullscreen' as any, language) : t('settings.htmlViewer.fullscreen' as any, language)}
            >
              {fullscreen ? '⤢' : '⛶'}
            </button>
            <button type="button" onClick={onClose} title={t('settings.htmlViewer.close' as any, language)} aria-label={t('settings.htmlViewer.close' as any, language)}>
              ×
            </button>
          </div>
        </header>

        {!selectedPath ? (
          <div className="ltt-html-viewer-picker">
            <div className="ltt-html-viewer-toolbar">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('settings.htmlViewer.search' as any, language)}
              />
              <button type="button" onClick={() => void refreshAssets()}>{t('settings.htmlViewer.refresh' as any, language)}</button>
            </div>
            {assetsLoading ? <div className="ltt-html-viewer-muted">…</div> : null}
            {!assetsLoading && visibleAssets.length === 0 ? (
              <div className="ltt-html-viewer-empty">
                <p>{t('settings.htmlViewer.noAssets' as any, language)}</p>
                <div className="ltt-html-viewer-manual">
                  <input
                    value={manualPath}
                    onChange={(event) => setManualPath(event.target.value)}
                    placeholder="assets/report.html"
                  />
                  <button type="button" onClick={() => void openAsset(manualPath)}>{t('settings.htmlViewer.open' as any, language)}</button>
                </div>
              </div>
            ) : (
              <ul className="ltt-html-viewer-assets">
                {visibleAssets.map((file) => (
                  <li key={file.path}>
                    <button type="button" onClick={() => void openAsset(file.path)}>
                      <span>{basename(file.path)}</span>
                      <small>{file.path}</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="ltt-html-viewer-content">
            <div className="ltt-html-viewer-main">
              {loading ? <div className="ltt-html-viewer-status">…</div> : null}
              {error ? (
                <div className="ltt-html-viewer-error">
                  <strong>{t('settings.htmlViewer.loadError' as any, language)}</strong>
                  <p>{error}</p>
                  <p>{t('settings.htmlViewer.fetchHint' as any, language)}</p>
                  <div className="ltt-html-viewer-error-actions">
                    <button type="button" onClick={() => void openAsset(selectedPath)}>{t('settings.htmlViewer.refresh' as any, language)}</button>
                    <button
                      type="button"
                      onClick={() => void logseqAPI.Assets?.builtInOpen?.(selectedPath)}
                    >
                      {t('settings.htmlViewer.openInBrowser' as any, language)}
                    </button>
                  </div>
                </div>
              ) : (
                <iframe
                  key={`${selectedPath}-${htmlKey}`}
                  ref={iframeRef}
                  className="ltt-html-viewer-frame"
                  title={basename(selectedPath)}
                  srcDoc={html}
                  sandbox={viewerSettings.allowScripts ? 'allow-same-origin allow-scripts' : 'allow-same-origin'}
                  referrerPolicy="no-referrer"
                  onLoad={handleFrameLoad}
                />
              )}
              {selection && !composerOpen && !loading && !error ? (
                <button
                  type="button"
                  className="ltt-html-viewer-annotate"
                  style={{ top: selection.top, left: selection.left }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setComposerOpen(true)
                    setComment('')
                  }}
                >
                  {t('settings.htmlViewer.annotation' as any, language)}
                </button>
              ) : null}
              {composerOpen && selection ? (
                <div className="ltt-html-viewer-composer">
                  <blockquote>{selection.anchor.quote}</blockquote>
                  <textarea
                    autoFocus
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder={t('settings.htmlViewer.commentPlaceholder' as any, language)}
                  />
                  <div className="ltt-html-viewer-composer-actions">
                    <button type="button" onClick={() => { setComposerOpen(false); setComment('') }}>{t('settings.htmlViewer.cancel' as any, language)}</button>
                    <button type="button" className="primary" onClick={() => void saveAnnotation()} disabled={saving}>
                      {saving ? '…' : t('settings.htmlViewer.saveAnnotation' as any, language)}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            {showList ? (
              <aside className="ltt-html-viewer-sidebar">
                <div className="ltt-html-viewer-sidebar-title">
                  <strong>{t('settings.htmlViewer.annotationList' as any, language)} ({annotations.length})</strong>
                  <button type="button" onClick={() => setShowList(false)}>×</button>
                </div>
                {annotations.length === 0 ? (
                  <p className="ltt-html-viewer-muted">{t('settings.htmlViewer.noAnnotations' as any, language)}</p>
                ) : (
                  <ul>
                    {annotations.map((annotation) => (
                      <li key={annotation.id} className={activeId === annotation.id ? 'active' : ''}>
                        <button type="button" className="ltt-html-viewer-annotation-jump" onClick={() => jumpTo(annotation)}>
                          <span>“{annotation.quote.slice(0, 90)}{annotation.quote.length > 90 ? '…' : ''}”</span>
                          {annotation.comment ? <small>{annotation.comment}</small> : null}
                        </button>
                        <div className="ltt-html-viewer-annotation-actions">
                          {annotation.pageName ? (
                            <button
                              type="button"
                              onClick={() => void logseqAPI.App.pushState('page', { name: annotation.pageName! })}
                            >
                              {t('settings.htmlViewer.openPage' as any, language)}
                            </button>
                          ) : null}
                          <button type="button" onClick={() => void deleteAnnotation(annotation)}>
                            {t('settings.htmlViewer.deleteAnnotation' as any, language)}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {message ? <p className="ltt-html-viewer-message">{message}</p> : null}
              </aside>
            ) : (
              <button type="button" className="ltt-html-viewer-list-toggle" onClick={() => setShowList(true)}>
                {t('settings.htmlViewer.annotationList' as any, language)} ({annotations.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
