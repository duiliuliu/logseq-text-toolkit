import React, { useCallback, useEffect, useState } from 'react'
import { logseqAPI } from '../../logseq'
import { openHtmlViewer } from '../../lib/htmlViewer/register'

type Status = 'todo' | 'doing' | 'done' | 'waiting' | 'unknown'

interface Task {
  title: string
  status: Status
  updated: number
}

interface Attachment {
  uuid: string
  title: string
  page: string
  group: string
  updated: number
}

interface TagRow {
  name: string
  count: number
}

const STATUS_LABEL: Record<Status, string> = {
  todo: '待办', doing: '进行中', done: '已完成', waiting: '等待', unknown: '未标记',
}

function statusOf(raw: unknown): Status {
  const entity = raw as any
  const value = String(entity?.['block/title'] || entity?.title || entity || '').toLowerCase()
  if (value.endsWith('.todo') || value.endsWith('/todo') || value === 'todo') return 'todo'
  if (value.endsWith('.doing') || value.endsWith('/doing') || value === 'doing') return 'doing'
  if (value.endsWith('.done') || value.endsWith('/done') || value === 'done') return 'done'
  if (value.endsWith('.waiting') || value.endsWith('/waiting') || value === 'waiting') return 'waiting'
  return 'unknown'
}

function sinceDays(ms: number, days: number): boolean {
  return Date.now() - ms <= days * 86400000
}

function fmtDay(ms: number): string {
  if (!ms) return '—'
  const d = new Date(ms)
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`
}

function cleanTitle(value: unknown): string {
  let text = String(value || '')
  for (let i = 0; i < 3; i += 1) text = text.replace(/\[\[([^[\]]+)\]\]/g, '$1')
  return text.replace(/\s*#\S+/g, '').trim()
}

async function query(query: string): Promise<any[]> {
  const db = (logseqAPI as any).DB
  if (!db?.datascriptQuery) return []
  try {
    const rows = await db.datascriptQuery(query)
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

function pull(row: any): any {
  return row?.[0] ?? row
}

function field(block: any, ...keys: string[]): any {
  for (const key of keys) {
    if (block?.[key] !== undefined && block?.[key] !== null) return block[key]
  }
  return undefined
}

function nestedTitle(value: any): string {
  return String(value?.['block/title'] || value?.title || '')
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [tags, setTags] = useState<TagRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const taskRows = (await query(
        '[:find (pull ?b [:block/title :block/updated-at {:logseq.property/status [:block/title]}]) :where [?b :block/tags ?t] [?t :block/title "Task"]]'
      )).map(pull).map((block: any) => ({
        title: cleanTitle(field(block, 'block/title', 'title')),
        status: statusOf(field(block, 'logseq.property/status', ':logseq.property/status')),
        updated: Number(field(block, 'block/updated-at', 'updated-at') || 0),
      }))

      const allAssets = (await query(
        '[:find (pull ?b [:block/uuid :block/title :block/updated-at {:block/page [:block/title]} {:block/parent [:block/title]}]) :where [?b :logseq.property.asset/type "html"]]'
      )).map(pull)
      const assetRows = allAssets.map((block: any) => {
        const page = nestedTitle(field(block, 'block/page', 'page'))
        const group = nestedTitle(field(block, 'block/parent', 'parent'))
        return {
          uuid: String(field(block, 'block/uuid', 'uuid') || ''),
          title: cleanTitle(field(block, 'block/title', 'title')) || 'HTML 附件',
          page,
          group,
          updated: Number(field(block, 'block/updated-at', 'updated-at') || 0),
        }
      }).filter((x: Attachment) => x.uuid && ['业务看板', '金融报告'].includes(x.page))

      const tagRows = (await query(
        '[:find ?t (count ?b) :where [?b :block/tags ?tag] [?tag :block/title ?t]]'
      )).map((row: any[]) => ({ name: String(row[0]), count: Number(row[1]) }))
        .filter((row: TagRow) => !['Task', 'Page', 'Journal', 'Asset', 'Property', 'Comment', 'Comments', 'Tag', 'Query', 'Card', 'Template', 'pinned', 'Code', 'Quote', 'Rate'].includes(row.name))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)

      if (cancelled) return
      setTasks(taskRows)
      setAttachments(assetRows)
      setTags(tagRows)
      setLoading(false)
    }
    void load()
    return () => { cancelled = true }
  }, [refreshKey])

  const openAsset = useCallback(async (item: Attachment) => {
    openHtmlViewer(`assets/${item.uuid}.html`, { fullscreen: false })
  }, [])

  const recent7 = tasks.filter(t => t.updated && sinceDays(t.updated, 7))
  const recent30 = tasks.filter(t => t.updated && sinceDays(t.updated, 30))
  const dedupe = (items: Attachment[]) => {
    const byTitle = new Map<string, Attachment>()
    for (const item of items) {
      const key = `${item.page}|${item.title}`
      const prev = byTitle.get(key)
      if (!prev || item.updated > prev.updated) byTitle.set(key, item)
    }
    return [...byTitle.values()].sort((a, b) => b.updated - a.updated)
  }
  const latest = (page: string) => dedupe(attachments.filter(a => a.page === page)).slice(0, 4)
  const latestBusiness = latest('业务看板')
  const latestFinance = latest('金融报告')
  const statusCounts = recent30.reduce<Record<Status, number>>((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, { todo: 0, doing: 0, done: 0, waiting: 0, unknown: 0 })
  const recentTasks = [...recent30].sort((a, b) => b.updated - a.updated).slice(0, 5)

  return (
    <div className="ltt-dashboard">
      <div className="ltt-dashboard-head">
        <div>
          <div className="ltt-dashboard-kicker">LIVE · LOGSEQ SDK</div>
          <h3>工作台</h3>
          <p>任务与标签实时读取当前 graph；业务 / 金融读取内部附件节点。</p>
        </div>
        <button type="button" className="ltt-dashboard-refresh" onClick={() => setRefreshKey(v => v + 1)}>
          {loading ? '刷新中…' : '刷新数据'}
        </button>
      </div>

      <div className="ltt-dashboard-stats">
        <div><b>{recent7.length}</b><span>近 7 天任务</span></div>
        <div><b>{recent30.length}</b><span>近 30 天任务</span></div>
        <div><b>{dedupe(attachments).length}</b><span>内部报告附件</span></div>
        <div><b>{tags.length}</b><span>核心标签</span></div>
      </div>

      <div className="ltt-dashboard-grid">
        <section className="ltt-dashboard-card">
          <header><span>任务</span><button onClick={() => logseqAPI.App.pushState('page', { name: 'Tasks' })}>打开 ↗</button></header>
          <div className="ltt-dashboard-status">
            {(Object.keys(statusCounts) as Status[]).map(key => (
              <span key={key} className={`ltt-dashboard-pill status-${key}`}>{STATUS_LABEL[key]} <b>{statusCounts[key]}</b></span>
            ))}
          </div>
          <ul className="ltt-dashboard-list">
            {recentTasks.length ? recentTasks.map((task, index) => (
              <li key={`${task.title}-${index}`}>
                <i className={`status-${task.status}`} />
                <span title={task.title}>{task.title || '(未命名)'}</span>
                <time>{fmtDay(task.updated)}</time>
              </li>
            )) : <li className="ltt-dashboard-empty">最近 30 天没有更新任务</li>}
          </ul>
        </section>

        <section className="ltt-dashboard-card">
          <header><span>业务看板</span><button onClick={() => logseqAPI.App.pushState('page', { name: '业务看板' })}>页面 ↗</button></header>
          {latestBusiness.length ? (
            <div className="ltt-dashboard-reports">
              {latestBusiness.map(item => (
                <button key={item.uuid} onClick={() => void openAsset(item)}>
                  <b>{item.group || item.title}</b>
                  <span>{item.title} · {fmtDay(item.updated)}</span>
                </button>
              ))}
            </div>
          ) : <p className="ltt-dashboard-empty">还没有附件。把 HTML 简报挂到「业务看板」页的「最新简报」节点。</p>}
        </section>

        <section className="ltt-dashboard-card">
          <header><span>金融报告</span><button onClick={() => logseqAPI.App.pushState('page', { name: '金融报告' })}>页面 ↗</button></header>
          {latestFinance.length ? (
            <div className="ltt-dashboard-reports">
              {latestFinance.map(item => (
                <button key={item.uuid} onClick={() => void openAsset(item)}>
                  <b>{item.group || item.title}</b>
                  <span>{item.title} · {fmtDay(item.updated)}</span>
                </button>
              ))}
            </div>
          ) : <p className="ltt-dashboard-empty">还没有附件。把 HTML 报告挂到「金融报告」页的「最新报告」节点。</p>}
        </section>

        <section className="ltt-dashboard-card">
          <header><span>核心标签</span><button onClick={() => logseqAPI.App.pushState('page', { name: 'Pages' })}>Graph ↗</button></header>
          <div className="ltt-dashboard-tags">
            {tags.length ? tags.map(tag => (
              <span key={tag.name}><b>{tag.name}</b><i>{tag.count}</i></span>
            )) : <p className="ltt-dashboard-empty">暂无标签数据</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
