import { useCallback, useEffect, useMemo, useState } from 'react';
import { logseqAPI } from '../../logseq';
import {
  addRow,
  DEFAULT_STATUSES,
  propertyValue,
  queryRows,
  QueryRow,
  QuerySource,
  removeRow,
  statusOf,
  updateRowStatus,
  updateRowTitle,
} from '../../lib/blockView/query';
import type { ThemeType, ViewType } from '../../lib/blockView/types';
import './queryView.css';

interface QueryBlockViewProps {
  blockId: string;
  source: QuerySource;
  view: ViewType;
  theme: ThemeType;
  language?: string;
}

const STATUS_KEY = 'logseq.property/status';

function pageOf(row: QueryRow): string {
  return row.page || propertyValue(row, 'block/page');
}

async function openRow(row: QueryRow): Promise<void> {
  const page = pageOf(row);
  try {
    if (page) await logseqAPI.App?.pushState?.('page', { name: page });
    await (logseqAPI.Editor as any)?.scrollToBlockInPage?.(page, row.uuid);
  } catch {
    // Navigation is best effort.
  }
}

export function QueryBlockView({ blockId, source, view, theme }: QueryBlockViewProps) {
  const [rows, setRows] = useState<QueryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(200);
  const [editing, setEditing] = useState<{ uuid: string; title: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await queryRows(source));
    } catch (err) {
      setError(String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [source.type, source.value]);

  useEffect(() => {
    void load();
  }, [load]);

  const statuses = useMemo(() => {
    const values = new Set(DEFAULT_STATUSES);
    rows.forEach((row) => values.add(statusOf(row)));
    return Array.from(values);
  }, [rows]);

  const visibleRows = rows.slice(0, limit);

  const changeStatus = async (row: QueryRow, status: string) => {
    const previous = row.properties[STATUS_KEY];
    setRows((current) => current.map((item) => item.uuid === row.uuid
      ? { ...item, properties: { ...item.properties, [STATUS_KEY]: status } }
      : item));
    try {
      await updateRowStatus(row.uuid, status);
    } catch (err) {
      setRows((current) => current.map((item) => item.uuid === row.uuid
        ? { ...item, properties: { ...item.properties, [STATUS_KEY]: previous } }
        : item));
      setError(String(err));
    }
  };

  const saveTitle = async () => {
    if (!editing) return;
    const { uuid, title } = editing;
    const next = title.trim();
    if (!next) {
      setEditing(null);
      return;
    }
    const previous = rows.find((row) => row.uuid === uuid)?.title || '';
    setRows((current) => current.map((row) => row.uuid === uuid ? { ...row, title: next } : row));
    setEditing(null);
    try {
      await updateRowTitle(uuid, next);
    } catch (err) {
      setRows((current) => current.map((row) => row.uuid === uuid ? { ...row, title: previous } : row));
      setError(String(err));
    }
  };

  const deleteRow = async (row: QueryRow) => {
    if (!window.confirm(`Delete "${row.title}"?`)) return;
    const snapshot = rows;
    setRows((current) => current.filter((item) => item.uuid !== row.uuid));
    try {
      await removeRow(row.uuid);
    } catch (err) {
      setRows(snapshot);
      setError(String(err));
    }
  };

  const add = async () => {
    try {
      await addRow(blockId, source);
      await load();
    } catch (err) {
      setError(String(err));
    }
  };

  const renderTitle = (row: QueryRow) => {
    if (editing?.uuid === row.uuid) {
      return (
        <input
          className="ltt-query-title-input"
          value={editing.title}
          autoFocus
          onChange={(event) => setEditing({ uuid: row.uuid, title: event.target.value })}
          onBlur={() => void saveTitle()}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void saveTitle();
            if (event.key === 'Escape') setEditing(null);
          }}
        />
      );
    }
    return (
      <button
        type="button"
        className="ltt-query-title"
        onClick={() => void openRow(row)}
        onDoubleClick={() => setEditing({ uuid: row.uuid, title: row.title })}
        title="Open block · double click to rename"
      >
        {row.title || '(untitled)'}
      </button>
    );
  };

  const statusSelect = (row: QueryRow) => (
    <select
      className="ltt-query-status"
      value={statusOf(row)}
      onChange={(event) => void changeStatus(row, event.target.value)}
      aria-label="Status"
    >
      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
    </select>
  );

  if (loading) return <div className="ltt-query-state">Loading…</div>;
  if (error && rows.length === 0) {
    return (
      <div className="ltt-query-state ltt-query-error">
        <span>Unable to load rows: {error}</span>
        <button type="button" onClick={() => void load()}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`ltt-query-view ltt-query-theme-${theme}`} data-view={view}>
      {error && <div className="ltt-query-inline-error">{error}</div>}
      {rows.length === 0 ? (
        <div className="ltt-query-empty">No matching blocks.</div>
      ) : view === 'table' ? (
        <div className="ltt-query-table-wrap">
          <table className="ltt-query-table">
            <thead>
              <tr>
                <th>Block</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Page</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.uuid}>
                  <td>{renderTitle(row)}</td>
                  <td>{statusSelect(row)}</td>
                  <td>
                    <div className="ltt-query-tags">
                      {row.tags.map((tag) => <span key={tag} className="ltt-query-tag">#{tag}</span>)}
                    </div>
                  </td>
                  <td>
                    {pageOf(row) ? (
                      <button type="button" className="ltt-query-page" onClick={() => void openRow(row)}>
                        {pageOf(row)}
                      </button>
                    ) : '-'}
                  </td>
                  <td>
                    <button type="button" className="ltt-query-delete" onClick={() => void deleteRow(row)} title="Delete block">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ltt-query-footer">
            <button type="button" className="ltt-query-add" onClick={() => void add()}>+ Add row</button>
            {rows.length > visibleRows.length && (
              <button type="button" className="ltt-query-more" onClick={() => setLimit((value) => value + 200)}>
                Show {Math.min(200, rows.length - visibleRows.length)} more
              </button>
            )}
            <span className="ltt-query-count">{rows.length} rows</span>
          </div>
        </div>
      ) : view === 'board' ? (
        <div className="ltt-query-board">
          {statuses.map((status) => {
            const columnRows = rows.filter((row) => statusOf(row) === status);
            return (
              <section
                key={status}
                className="ltt-query-column"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const uuid = event.dataTransfer.getData('text/ltt-block');
                  const row = rows.find((item) => item.uuid === uuid);
                  if (row) void changeStatus(row, status);
                }}
              >
                <header>
                  <span>{status}</span>
                  <span className="ltt-query-count">{columnRows.length}</span>
                </header>
                <div className="ltt-query-cards">
                  {columnRows.slice(0, limit).map((row) => (
                    <article
                      key={row.uuid}
                      className="ltt-query-card"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/ltt-block', row.uuid);
                        event.dataTransfer.effectAllowed = 'move';
                      }}
                    >
                      <button type="button" className="ltt-query-card-title" onClick={() => void openRow(row)}>
                        {row.title || '(untitled)'}
                      </button>
                      <div className="ltt-query-tags">
                        {row.tags.map((tag) => <span key={tag} className="ltt-query-tag">#{tag}</span>)}
                      </div>
                      <span className="ltt-query-card-page">{pageOf(row)}</span>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="ltt-query-gallery">
          {visibleRows.map((row) => (
            <article key={row.uuid} className="ltt-query-gallery-card">
              <button type="button" className="ltt-query-card-title" onClick={() => void openRow(row)}>
                {row.title || '(untitled)'}
              </button>
              {statusSelect(row)}
              <div className="ltt-query-tags">
                {row.tags.map((tag) => <span key={tag} className="ltt-query-tag">#{tag}</span>)}
              </div>
              <span className="ltt-query-card-page">{pageOf(row)}</span>
            </article>
          ))}
          {rows.length > visibleRows.length && (
            <button type="button" className="ltt-query-more" onClick={() => setLimit((value) => value + 200)}>Show more</button>
          )}
        </div>
      )}
      {view !== 'table' && <div className="ltt-query-footer"><span className="ltt-query-count">{rows.length} rows</span></div>}
    </div>
  );
}

export default QueryBlockView;
