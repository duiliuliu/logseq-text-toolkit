import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';
import logger from '../logger';

export class Query {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    logger.debug('[Query:queryBlocks] method called', {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      timestamps: { start: startTimestamp, end: endTimestamp }
    });

    // 查询所有块，包含页面信息
    logger.debug('[Query:queryBlocks] executing logseqAPI.DB.datascriptQuery: get all blocks with page');
    const allBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b [*]) ?page-name
       :where
       [?b :block/content ?content]
       [?b :block/created-at ?created]
       [(>= ?created ${startTimestamp})]
       [(<= ?created ${endTimestamp})]
       [?b :block/page ?page]
       [?page :page/name ?page-name]]
    `);
    logger.debug('[Query:queryBlocks] allBlocks result', { count: allBlocks.length });

    // 查询所有在时间范围内更新的块
    logger.debug('[Query:queryBlocks] executing logseqAPI.DB.datascriptQuery: get updated blocks');
    const updatedBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find ?b
       :where
       [?b :block/updated-at ?updated]
       [(>= ?updated ${startTimestamp})]
       [(<= ?updated ${endTimestamp})]]
    `);
    logger.debug('[Query:queryBlocks] updatedBlocks result', { count: updatedBlocks.length });

    // 查询所有标签，直接从查询获取
    logger.debug('[Query:queryBlocks] executing logseqAPI.DB.datascriptQuery: get all tags for blocks');
    const blockTags = await logseqAPI.DB.datascriptQuery(`
      [:find ?b ?tag-name
       :where
       [?b :block/tags ?t]
       [?t :block/title ?tag-name]
       [?b :block/created-at ?created]
       [(>= ?created ${startTimestamp})]
       [(<= ?created ${endTimestamp})]]
    `);
    logger.debug('[Query:queryBlocks] blockTags result', { count: blockTags.length });

    const tagCount: Record<string, number> = {};
    const pageCount: Record<string, number> = {};
    let totalContentLength = 0;

    // 统计页面和内容长度
    for (const block of allBlocks) {
      if (!block || !Array.isArray(block) || block.length < 1) continue;
      
      const blockData = block[0] as any;
      const pageName = block[1] as string;
      const content = blockData?.['content'] || '';
      
      totalContentLength += content.length;

      // 统计页面
      if (pageName) {
        pageCount[pageName] = (pageCount[pageName] || 0) + 1;
      }
    }

    // 统计标签
    for (const tagEntry of blockTags) {
      if (!tagEntry || !Array.isArray(tagEntry) || tagEntry.length < 2) continue;
      const tagName = tagEntry[1] as string;
      if (tagName) {
        tagCount[tagName] = (tagCount[tagName] || 0) + 1;
      }
    }

    const created = allBlocks.length;
    const modified = updatedBlocks.length;
    const total = allBlocks.length;

    logger.info('[Query:queryBlocks] completed', {
      total,
      created,
      modified,
      avgContentLength: total > 0 ? Math.round(totalContentLength / total) : 0,
      tagsCount: Object.keys(tagCount).length,
      pagesCount: Object.keys(pageCount).length
    });

    return {
      total,
      created,
      modified,
      avgContentLength: total > 0 ? Math.round(totalContentLength / total) : 0,
      tags: tagCount,
      pages: pageCount,
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
      [:find (pull ?b [*]) ?status-title ?priority-title
       :where
       [?b :block/tags ?t]
       [?t :block/title "Task"]
       [?b :block/created-at ?date]
       [(>= ?date ${startTimestamp})]
       [(<= ?date ${endTimestamp})]
       [?b :logseq.property/status ?status]
       [?status :block/title ?status-title]
       [?b :logseq.property/priority ?priority]
       [?priority :block/title ?priority-title]
      ]
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
      const statusTitle = task[1] as string;
      const priorityTitle = task[2] as string;
      const status = statusTitle ? statusTitle.toLowerCase() : 'todo';
      const priority = priorityTitle ? priorityTitle.toLowerCase() : 'none';

      logger.debug('[Query:queryTasks] processing task', {
        blockId: block?.['uuid'],
        status,
        priority: priority
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
      const scheduled = block?.['scheduled'] || block?.[':logseq.property/scheduled'];
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
      if (priority) {
        const priorityKey = String(priority).toLowerCase();
        byPriority[priorityKey] = (byPriority[priorityKey] || 0) + 1;
        logger.debug('[Query:queryTasks] task priority found', {
          blockId: block?.['uuid'],
          priority: priorityKey,
          count: byPriority[priorityKey]
        });
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
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    logger.debug('[Query:queryPages] method called', {
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      timestamps: { start: startTimestamp, end: endTimestamp }
    });

    logger.debug('[Query:queryPages] executing logseqAPI.DB.datascriptQuery: get all pages');
    const pages = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?p [*])
       :where [?p :page/name ?name]
              [?p :page/created-at ?createdAt]
              [?p :page/updated-at ?updatedAt]]
    `);
    logger.debug('[Query:queryPages] pages result', { count: pages.length });

    // 查询页面标签
    logger.debug('[Query:queryPages] executing logseqAPI.DB.datascriptQuery: get page tags');
    const pageTags = await logseqAPI.DB.datascriptQuery(`
      [:find ?p ?tag-name
       :where
       [?p :block/tags ?t]
       [?t :block/title ?tag-name]]
    `);
    logger.debug('[Query:queryPages] pageTags result', { count: pageTags.length });

    let newPages = 0;
    let modifiedPages = 0;
    const byTag: Record<string, number> = {};
    const byProperty: Record<string, Record<string, number>> = {};

    for (const page of pages) {
      if (!page || !Array.isArray(page) || page.length < 1) continue;
      
      const pageData = page[0] as any;
      const createdAt = pageData?.['created-at'] || pageData?.[':page/created-at'];
      const updatedAt = pageData?.['updated-at'] || pageData?.[':page/updated-at'];

      // 检查创建时间
      if (createdAt && createdAt >= startTimestamp && createdAt <= endTimestamp) {
        newPages++;
        logger.debug('[Query:queryPages] new page found', { pageName: pageData?.['name'] || pageData?.[':page/name'] });
      }

      // 检查更新时间
      if (updatedAt && updatedAt >= startTimestamp && updatedAt <= endTimestamp) {
        modifiedPages++;
        logger.debug('[Query:queryPages] modified page found', { pageName: pageData?.['name'] || pageData?.[':page/name'] });
      }
    }

    // 统计标签
    for (const tagEntry of pageTags) {
      if (!tagEntry || !Array.isArray(tagEntry) || tagEntry.length < 2) continue;
      const tagName = tagEntry[1] as string;
      if (tagName) {
        byTag[tagName] = (byTag[tagName] || 0) + 1;
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
