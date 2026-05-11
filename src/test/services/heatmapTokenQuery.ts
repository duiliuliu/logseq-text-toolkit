import { HeatmapQueryParams, HeatmapViewType, HeatmapDataPoint, ColorFormula, BlockEntity } from '../../lib/heatmap/types'
import { calculateColorValueWeighted } from '../../lib/heatmap/colorCalculator'
import { logseqAPI } from './logseqAPI'

const escapeDatalogString = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')

const getCreatedAt = (block: any): number | null => {
  const v = block?.['block/created-at'] ?? block?.['created-at'] ?? block?.createdAt ?? block?.created_at
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

const pad2 = (n: number) => String(n).padStart(2, '0')

const formatLocalDateTimeNoTZ = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`

const buildWhereClause = (queryParams: HeatmapQueryParams) => {
  const value = escapeDatalogString(queryParams.value || '')
  if (queryParams.type === 'tag') {
    return `
      [?b :block/tags ?t]
      (or-join [?t]
        [?t :block/name "${value}"]
        [?t :block/title "${value}"]
      )
    `
  }

  if (queryParams.type === 'page') {
    return `
      (or-join [?p]
        [?p :block/name "${value}"]
        [?p :block/title "${value}"]
      )
      [?b :block/page ?p]
    `
  }

  const key = (queryParams.propertyKey || '').trim()
  const escapedKey = key.replace(/[^a-zA-Z0-9_\\-]/g, '_')
  return `
    [?b :block/properties ?props]
    [(get ?props :${escapedKey}) ?pv]
    [(str ?pv) ?pvStr]
    [(= ?pvStr "${value}")]
  `
}

const buildQuery = (queryParams: HeatmapQueryParams, startMs: number, endMs: number) => {
  const whereClause = buildWhereClause(queryParams)
  return `
    [:find (pull ?b [:block/uuid :block/content :block/title :block/created-at :block/updated-at :block/properties :block/tags :block/page])
     :where
     [?b :block/created-at ?created]
     [(>= ?created ${startMs})]
     [(< ?created ${endMs})]
     ${whereClause}
    ]
  `
}

export async function fetchHeatmapDataByTokenQuery(
  queryParams: HeatmapQueryParams,
  viewType: HeatmapViewType,
  colorFormula: ColorFormula,
  referenceDate: Date
): Promise<HeatmapDataPoint[]> {
  if (!queryParams.value?.trim()) return []

  if (viewType === 'week') {
    const dayOfWeek = referenceDate.getDay()
    const monday = new Date(referenceDate)
    monday.setDate(referenceDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)
    const startMs = monday.getTime()
    const endMs = startMs + 7 * 86400000

    const query = buildQuery(queryParams, startMs, endMs)
    const result = await logseqAPI.executeQuery(query)
    const blocks = (result.data || []).filter(Boolean)

    const buckets: Record<string, BlockEntity[]> = {}
    for (const b of blocks) {
      const createdAt = getCreatedAt(b)
      if (!createdAt) continue
      const dt = new Date(createdAt)
      const dayIndex = Math.floor((dt.getTime() - startMs) / 86400000)
      if (dayIndex < 0 || dayIndex >= 7) continue
      const hourIndex = Math.floor(dt.getHours() / 4)
      if (hourIndex < 0 || hourIndex >= 6) continue
      const key = `${dayIndex}-${hourIndex}`
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(b as BlockEntity)
    }

    const data: HeatmapDataPoint[] = []
    for (let hourIndex = 0; hourIndex < 6; hourIndex++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + dayIndex)
        d.setHours(hourIndex * 4, 0, 0, 0)
        const key = `${dayIndex}-${hourIndex}`
        const cellBlocks = buckets[key] || []
        const count = colorFormula === 'simple' ? cellBlocks.length : calculateColorValueWeighted(cellBlocks)
        data.push({
          date: formatLocalDateTimeNoTZ(d),
          count,
          blocks: cellBlocks,
        })
      }
    }
    return data
  }

  const year = referenceDate.getFullYear()
  const monthIndex = referenceDate.getMonth()

  let startDate: Date
  let endDate: Date

  if (viewType === 'month') {
    startDate = new Date(year, monthIndex, 1)
    endDate = new Date(year, monthIndex + 1, 1)
  } else {
    startDate = new Date(year, 0, 1)
    endDate = new Date(year + 1, 0, 1)
  }

  const startMs = startDate.getTime()
  const endMs = endDate.getTime()
  const query = buildQuery(queryParams, startMs, endMs)
  const result = await logseqAPI.executeQuery(query)
  const blocks = (result.data || []).filter(Boolean)

  const buckets: Record<string, BlockEntity[]> = {}
  for (const b of blocks) {
    const createdAt = getCreatedAt(b)
    if (!createdAt) continue
    const dateKey = new Date(createdAt).toISOString().split('T')[0]
    if (!buckets[dateKey]) buckets[dateKey] = []
    buckets[dateKey].push(b as BlockEntity)
  }

  const data: HeatmapDataPoint[] = []
  for (const d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0]
    const dayBlocks = buckets[dateKey] || []
    const count = colorFormula === 'simple' ? dayBlocks.length : calculateColorValueWeighted(dayBlocks)
    data.push({
      date: dateKey,
      count,
      blocks: dayBlocks,
    })
  }
  return data
}

