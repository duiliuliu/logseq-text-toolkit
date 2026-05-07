/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 任务查询和统计逻辑
 */

import { TaskProgress, StatusStat, STATUS_COLORS } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'
import logger from '../../lib/logger/index';
import type { NestingLevel } from '../../settings/types'

function getStatusColor(status: string): string {
  const settings = getSettings()
  const normalizedStatus = status.toLowerCase()
  return settings?.taskProgress?.statusColors?.[normalizedStatus] ||
    settings?.taskProgress?.statusColors?.[status] ||
    STATUS_COLORS[normalizedStatus] ||
    STATUS_COLORS[status] ||
    '#6b7280'
}

function buildNestingQuery(parentBlockId: string, nestingLevel: NestingLevel): string {
  const parentClause = `[?p :block/uuid #uuid "${parentBlockId}"]`

  let nestingClauses = ''

  switch (nestingLevel) {
    case 1:
      nestingClauses = `[?b :block/parent ?p]`
      break
    case 2:
      nestingClauses = `
        (or-join [?p ?b]
          [?b :block/parent ?p]
          (and [?m1 :block/parent ?p] [?b :block/parent ?m1])
        )
      `
      break
    case 3:
      nestingClauses = `
        (or-join [?p ?b]
          [?b :block/parent ?p]
          (and [?m1 :block/parent ?p] [?b :block/parent ?m1])
          (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?b :block/parent ?m2])
        )
      `
      break
    case 'all':
    default:
      // 对于 "all"，我们使用 5 层嵌套作为合理的限制
      nestingClauses = `
        (or-join [?p ?b]
          [?b :block/parent ?p]
          (and [?m1 :block/parent ?p] [?b :block/parent ?m1])
          (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?b :block/parent ?m2])
          (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?m3 :block/parent ?m2] [?b :block/parent ?m3])
          (and [?m1 :block/parent ?p] [?m2 :block/parent ?m1] [?m3 :block/parent ?m2] [?m4 :block/parent ?m3] [?b :block/parent ?m4])
        )
      `
      break
  }

  return `${parentClause}\n${nestingClauses}`
}

function buildLeafOnlyClause(): string {
  return `(not [?child :block/parent ?b])`
}

function buildTaskFilter(): string {
  // 任务识别条件：有 #task 标签 或 有 status 属性
  return `
    (or-join [?b]
      (and [?b :block/tags ?t]
           [?t :block/title "Task"])
      (or-join [?b]
        [?b :logseq.property/status ?status]
      )
    )
  `
}

export async function calculateTaskProgress(
  parentBlockId: string,
  options?: { nestingLevel?: NestingLevel; onlyLeaves?: boolean }
): Promise<TaskProgress | null> {
  try {
    const settings = getSettings()
    const nestingLevel = options?.nestingLevel ?? settings?.taskProgress?.nestingLevel ?? 1
    const onlyLeaves = options?.onlyLeaves ?? settings?.taskProgress?.onlyLeaves ?? false

    // 构建查询
    const nestingClauses = buildNestingQuery(parentBlockId, nestingLevel)
    const leafClause = onlyLeaves ? buildLeafOnlyClause() : ''
    const taskFilterClause = buildTaskFilter()

    const query = `
      [:find (pull ?b [:block/uuid :block/title :block/properties :block/tags :logseq.property/status])
       :where
       ${nestingClauses}
       ${leafClause}
       ${taskFilterClause}
      ]
    `

    // 执行查询
    logger.info('[TaskProgress] 开始查询任务进度', { parentBlockId, nestingLevel, onlyLeaves })
    logger.info('[TaskProgress] 查询语句', query)

    const results = await logseqAPI.DB.datascriptQuery(query)

    logger.info('[TaskProgress] 查询结果摘要', {
      总结果数: results?.length || 0,
      结果详情: results?.map((r: any[], i: number) => ({
        索引: i,
        block_uuid: r[0]?.uuid || r[0]?.['block/uuid'],
        title: r[0]?.title || r[0]?.['block/title'],
        status: r[0]?.properties?.status || r[0]?.['logseq.property/status'] || r[0]?.['block/properties']?.status
      }))
    })

    if (!results || results.length === 0) {
      logger.info('[TaskProgress] 没有找到任务数据')
      return null
    }

    // 统计任务
    const statusCounts: Record<string, number> = {}
    const blocks = results.flat()

    for (const block of blocks) {
      // 从多个可能的位置获取 status
      let status =
        block['logseq.property/status'] ||
        block.properties?.status ||
        block['block/properties']?.status ||
        'todo'

      statusCounts[status] = (statusCounts[status] || 0) + 1
    }

    if (Object.keys(statusCounts).length === 0) {
      logger.info('[TaskProgress] 没有有效的任务状态数据')
      return null
    }

    const statusStats: StatusStat[] = []
    let totalTasks = 0

    for (const [status, count] of Object.entries(statusCounts)) {
      totalTasks += count
      statusStats.push({
        status,
        count,
        color: getStatusColor(status)
      })
    }

    const completedTasks = statusStats.find(s => s.status.toLowerCase() === 'done')?.count || 0
    const progress = Math.round((completedTasks / totalTasks) * 100)

    const result = {
      blockId: parentBlockId,
      parentBlockId: parentBlockId,
      totalTasks,
      completedTasks,
      statusStats,
      progress,
      nestingLevel: nestingLevel,
      leafTasksOnly: onlyLeaves
    }

    logger.info('[TaskProgress] 计算完成', result)

    return result
  } catch (error) {
    logger.error('[TaskProgress] calculateTaskProgress error:', error)
    return null
  }
}
