import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';
import logger from '../logger';

export class QueryService {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    logger.debug('[QueryService] queryBlocks', { startStr, endStr });

    const createdBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (count ?b)
       :where [?b :block/created-at ?ca]
              [(>= ?ca "${startStr}")]
              [(<= ?ca "${endStr}")]]
    `);

    const modifiedBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (count ?b)
       :where [?b :block/updated-at ?ua]
              [(>= ?ua "${startStr}")]
              [(<= ?ua "${endStr}")]]
    `);

    const allBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find ?b ?content
       :where [?b :block/content ?content]
              [?b :block/created-at ?ca]
              [(>= ?ca "${startStr}")]
              [(<= ?ca "${endStr}")]]
    `);

    const tagCount: Record<string, number> = {};
    let totalContentLength = 0;

    for (const block of allBlocks) {
      const content = block[1] as string;
      totalContentLength += content.length;
      
      const tagMatches = content.match(/#\w+/g) || [];
      for (const tag of tagMatches) {
        const cleanTag = tag.substring(1);
        tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1;
      }
    }

    const created = createdBlocks.length > 0 ? Number(createdBlocks[0][0]) : 0;
    const modified = modifiedBlocks.length > 0 ? Number(modifiedBlocks[0][0]) : 0;
    const total = allBlocks.length;

    logger.info('[QueryService] queryBlocks completed', { total, created, modified });

    return {
      total,
      created,
      modified,
      avgContentLength: total > 0 ? Math.round(totalContentLength / total) : 0,
      tags: tagCount,
    };
  }

  async queryTasks(dateRange: DateRange): Promise<TaskStats> {
    const { start, end } = dateRange;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    logger.debug('[QueryService] queryTasks', { startStr, endStr });

    // 查询任务，使用 create-at 时间过滤
    // 同时获取 scheduled 日期用于判断是否逾期
    const tasks = await logseqAPI.DB.datascriptQuery(`
      [:find ?b (pull ?b [:block/uuid :block/content :block/properties]) ?marker ?scheduled
       :where
       [?b :block/content ?content]
       [?b :block/marker ?marker]
       [(contains? #{"TODO" "DOING" "DONE" "NOW" "LATER" "WAITING" "CANCELED"} ?marker)]
       [?b :block/created-at ?created]
       [(>= ?created "${startStr}")]
       [(<= ?created "${endStr}")]
       (optional [?b :block/scheduled ?scheduled])]
    `);

    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let overdue = 0;
    const byPriority: Record<string, number> = {};

    const now = new Date();

    for (const task of tasks) {
      if (!task || !Array.isArray(task) || task.length < 4) continue;
      
      const marker = task[2] as string;
      const scheduled = task[3] as string | null;
      const status = marker ? marker.toLowerCase() : 'todo';
      
      if (status === 'done' || status === 'completed' || status === 'cancelled') {
        completed++;
      } else if (status === 'doing' || status === 'now') {
        inProgress++;
      } else if (status === 'waiting' || status === 'later') {
        // waiting 和 later 状态的任务不算入 inProgress
      } else {
        todo++;
      }

      // 检查是否逾期：如果有 scheduled 日期，且已过期的未完成任务
      if (scheduled && status !== 'done' && status !== 'completed' && status !== 'cancelled') {
        const scheduledDate = new Date(scheduled);
        if (scheduledDate < now) {
          overdue++;
        }
      }

      // 优先级分析
      const content = (task[1] as any)?.content || '';
      if (content.includes('A)') || content.includes('[] A') || content.includes('#priority/A')) {
        byPriority['A'] = (byPriority['A'] || 0) + 1;
      } else if (content.includes('B)') || content.includes('[] B') || content.includes('#priority/B')) {
        byPriority['B'] = (byPriority['B'] || 0) + 1;
      } else if (content.includes('C)') || content.includes('[] C') || content.includes('#priority/C')) {
        byPriority['C'] = (byPriority['C'] || 0) + 1;
      }
    }

    logger.info('[QueryService] queryTasks completed', { total, completed, inProgress, todo, overdue });

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority,
    };
  }

  async queryPages(dateRange: DateRange): Promise<PageStats> {
    const { start, end } = dateRange;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    logger.debug('[QueryService] queryPages', { startStr, endStr });

    const pages = await logseqAPI.DB.datascriptQuery(`
      [:find ?p ?name ?createdAt ?updatedAt
       :where [?p :page/name ?name]
              [?p :page/created-at ?createdAt]
              [?p :page/updated-at ?updatedAt]]
    `);

    let newPages = 0;
    let modifiedPages = 0;
    const byTag: Record<string, number> = {};
    const byProperty: Record<string, Record<string, number>> = {};

    for (const page of pages) {
      const createdAt = page[2] as string;
      const updatedAt = page[3] as string;

      if (createdAt >= startStr && createdAt <= endStr) {
        newPages++;
      }

      if (updatedAt >= startStr && updatedAt <= endStr) {
        modifiedPages++;
      }
    }

    logger.info('[QueryService] queryPages completed', { total: pages.length, newPages, modifiedPages });

    return {
      total: pages.length,
      newPages,
      modifiedPages,
      byTag,
      byProperty,
    };
  }
}
