/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 *
 * 任务查询和统计逻辑
 */

import { TaskProgress, StatusStat, STATUS_COLORS } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'
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
  // 这里我们使用 pull 查询获取所有 block 数据，然后在客户端过滤
  return ''
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
    
    const query = `
      [:find (pull ?b [*])
       :where
       ${nestingClauses}
       ${leafClause}
      ]
    `

    // 执行查询
    const results = await logseqAPI.DB.datascriptQuery(query)
    if (!results || results.length === 0) {
      return null
    }

    // 过滤出任务块并统计
    const statusCounts: Record<string, number> = {}
    const blocks = results.flat()

    for (const block of blocks) {
      // 检查是否是任务块
      const hasTaskTag = block.tags?.some(
        (tag: any) => tag?.title?.toLowerCase() === 'task'
      )
      const hasStatus = block.properties?.status !== undefined
      
      if (hasTaskTag || hasStatus) {
        const status = block.properties?.status || 'todo'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      }
    }

    if (Object.keys(statusCounts).length === 0) {
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

    return {
      blockId: parentBlockId,
      parentBlockId: parentBlockId,
      totalTasks,
      completedTasks,
      statusStats,
      progress,
      nestingLevel: nestingLevel,
      leafTasksOnly: onlyLeaves
    }
  } catch (error) {
    console.error('[TaskProgress] calculateTaskProgress error:', error)
    return null
  }
}
