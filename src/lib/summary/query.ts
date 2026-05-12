import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';
import logger from '../logger';

export class Query {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    logger.debug('[Query:queryBlocks] method called', {
      dateRange: { start: startStr, end: endStr }
    });

    logger.debug('[Query:queryBlocks] executing logseqAPI.DB.datascriptQuery: get created blocks count');
    const createdBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (count ?b)
       :where [?b :block/created-at ?ca]
              [(>= ?ca "${startStr}")]
              [(<= ?ca "${endStr}")]]
    `);
    logger.debug('[Query:queryBlocks] createdBlocks result', { createdBlocks });

    logger.debug('[Query:queryBlocks] executing logseqAPI.DB.datascriptQuery: get modified blocks count');
    const modifiedBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (count ?b)
       :where [?b :block/updated-at ?ua]
              [(>= ?ua "${startStr}")]
              [(<= ?ua "${endStr}")]]
    `);
    logger.debug('[Query:queryBlocks] modifiedBlocks result', { modifiedBlocks });

    logger.debug('[Query:queryBlocks] executing logseqAPI.DB.datascriptQuery: get all blocks with content');
    const allBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find ?b ?content
       :where [?b :block/content ?content]
              [?b :block/created-at ?ca]
              [(>= ?ca "${startStr}")]
              [(<= ?ca "${endStr}")]]
    `);
    logger.debug('[Query:queryBlocks] allBlocks count', { count: allBlocks.length });

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

    logger.info('[Query:queryBlocks] completed', {
      total,
      created,
      modified,
      avgContentLength: total > 0 ? Math.round(totalContentLength / total) : 0,
      tagsCount: Object.keys(tagCount).length
    });

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
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    logger.debug('[Query:queryTasks] method called', {
      dateRange: { startTimestamp, endTimestamp },
      start: start.toISOString(),
      end: end.toISOString()
    });

    // 查询任务，使用 create-at 时间过滤（时间戳格式）
    // 参考: {:query [:find (pull ?b [*]) :where [?b :block/tags ?t] [?t :block/title "Task"] [?b :block/created-at ?date] [(>= ?date 1777593600000)] [(<= ?date 1780185600000)]]}
    logger.debug('[Query:queryTasks] executing logseqAPI.DB.datascriptQuery: get tasks with tags "Task"');
    const tasks = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b [*]) ?scheduled
       :where
       [?b :block/tags ?t]
       [?t :block/title "Task"]
       [?b :block/created-at ?date]
       [(>= ?date ${startTimestamp})]
       [(<= ?date ${endTimestamp})]
       (optional [?b :logseq.property/scheduled ?scheduled])]
    `);
    logger.debug('[Query:queryTasks] tasks result', { count: tasks.length });

    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let overdue = 0;
    const byPriority: Record<string, number> = {};

    const now = new Date();

    for (const task of tasks) {
      if (!task || !Array.isArray(task) || task.length < 1) continue;
      
      const block = task[0] as any;
      const scheduled = task[1] as number | null;
      
      // 从 block 数据中获取状态
      let status = 'todo';
      if (block) {
        if (block[':logseq.property/status']) {
          // 有 status 属性
          status = 'custom';
        } else if (block[':marker']) {
          // 有 marker
          const marker = block[':marker'].toLowerCase();
          if (marker === 'done' || marker === 'completed' || marker === 'cancelled') {
            status = 'done';
          } else if (marker === 'doing' || marker === 'now') {
            status = 'doing';
          } else if (marker === 'waiting' || marker === 'later') {
            status = 'waiting';
          }
        } else if (block['content']?.includes('[x]')) {
          // 内容中有完成标记
          status = 'done';
        } else if (block['content']?.includes('[~]')) {
          status = 'doing';
        }
      }
      
      logger.debug('[Query:queryTasks] processing task', {
        blockId: block?.['uuid'],
        status,
        scheduled
      });
      
      if (status === 'done' || status === 'completed' || status === 'cancelled') {
        completed++;
        logger.debug('[Query:queryTasks] task completed', { blockId: block?.['uuid'] });
      } else if (status === 'doing' || status === 'now') {
        inProgress++;
        logger.debug('[Query:queryTasks] task in-progress', { blockId: block?.['uuid'] });
      } else if (status === 'waiting' || status === 'later') {
        logger.debug('[Query:queryTasks] task waiting/later', { blockId: block?.['uuid'] });
      } else {
        todo++;
        logger.debug('[Query:queryTasks] task todo', { blockId: block?.['uuid'] });
      }

      // 检查是否逾期：如果有 scheduled 日期，且已过期的未完成任务
      if (scheduled && status !== 'done' && status !== 'completed' && status !== 'cancelled') {
        const scheduledDate = new Date(scheduled);
        if (scheduledDate < now) {
          overdue++;
          logger.debug('[Query:queryTasks] task overdue', {
            blockId: block?.['uuid'],
            scheduled
          });
        }
      }

      // 优先级分析
      const content = block?.['content'] || '';
      if (content.includes('A)') || content.includes('[] A') || content.includes('#priority/A')) {
        byPriority['A'] = (byPriority['A'] || 0) + 1;
      } else if (content.includes('B)') || content.includes('[] B') || content.includes('#priority/B')) {
        byPriority['B'] = (byPriority['B'] || 0) + 1;
      } else if (content.includes('C)') || content.includes('[] C') || content.includes('#priority/C')) {
        byPriority['C'] = (byPriority['C'] || 0) + 1;
      }
    }

    logger.info('[Query:queryTasks] completed', {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority
    });

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

    logger.debug('[Query:queryPages] method called', {
      dateRange: { start: startStr, end: endStr }
    });

    logger.debug('[Query:queryPages] executing logseqAPI.DB.datascriptQuery: get all pages');
    const pages = await logseqAPI.DB.datascriptQuery(`
      [:find ?p ?name ?createdAt ?updatedAt
       :where [?p :page/name ?name]
              [?p :page/created-at ?createdAt]
              [?p :page/updated-at ?updatedAt]]
    `);
    logger.debug('[Query:queryPages] pages result', { count: pages.length });

    let newPages = 0;
    let modifiedPages = 0;
    const byTag: Record<string, number> = {};
    const byProperty: Record<string, Record<string, number>> = {};

    for (const page of pages) {
      const createdAt = page[2] as string;
      const updatedAt = page[3] as string;

      if (createdAt >= startStr && createdAt <= endStr) {
        newPages++;
        logger.debug('[Query:queryPages] new page found', { pageName: page[1] });
      }

      if (updatedAt >= startStr && updatedAt <= endStr) {
        modifiedPages++;
        logger.debug('[Query:queryPages] modified page found', { pageName: page[1] });
      }
    }

    logger.info('[Query:queryPages] completed', {
      total: pages.length,
      newPages,
      modifiedPages,
      byTagCount: Object.keys(byTag).length,
      byPropertyCount: Object.keys(byProperty).length
    });

    return {
      total: pages.length,
      newPages,
      modifiedPages,
      byTag,
      byProperty,
    };
  }
}
