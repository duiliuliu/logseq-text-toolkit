/**
 * Copyright (c) 2026 duiliuliu
 * License: MIT
 * 
 * 任务查询和统计逻辑
 */

import { TaskProgress, TaskBlock, StatusStat, STATUS_COLORS } from './types'
import { logseqAPI } from '../../logseq'
import { getSettings } from '../../settings'

function getStatusColor(status: string): string {
  const settings = getSettings()
  return settings?.meta?.taskProgress?.statusColors?.[status] || settings?.taskProgress?.statusColors?.[status] || STATUS_COLORS[status] || '#6b7280'
}

export async function calculateTaskProgress(parentBlockId: string): Promise<TaskProgress | null> {
  try {
    // 使用 datascriptQuery 直接查询统计结果：状态 + 数量
    const results = await logseqAPI.DB.datascriptQuery(
      `[:find ?status-title (count ?b)
        :in $ ?parent
        :where
        [?p :block/uuid #uuid ?parent]
        [?b :block/parent ?p]
        [?b :block/tags ?t]
        [?t :block/title "task"]
        [?b :logseq.property/status ?status]
        [?status :block/title ?status-title]]`,
      parentBlockId
    )

    if (!results || !Array.isArray(results)) {
      return {
        blockId: parentBlockId,
        parentBlockId: parentBlockId,
        totalTasks: 0,
        completedTasks: 0,
        statusStats: [],
        progress: 0,
      }
    }

    const statusStats: StatusStat[] = []
    let totalTasks = 0
    let completedTasks = 0

    // 处理统计结果
    results.forEach((result: any) => {
      if (Array.isArray(result) && result.length >= 2) {
        const statusTitle = result[0] as string
        const count = result[1] as number

        totalTasks += count

        // 将状态标题转为小写用于匹配颜色
        const normalizedStatus = statusTitle.toLowerCase()
        if (normalizedStatus === 'done') {
          completedTasks += count
        }

        statusStats.push({
          status: normalizedStatus,
          count,
          color: getStatusColor(normalizedStatus),
        })
      }
    })

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      blockId: parentBlockId,
      parentBlockId: parentBlockId,
      totalTasks,
      completedTasks,
      statusStats,
      progress,
    }
  } catch (error) {
    console.error('[TaskProgress] calculateTaskProgress error:', error)
    return null
  }
}
