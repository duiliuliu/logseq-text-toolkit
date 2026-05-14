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

    // 合并查询：一次获取 blocks + page-name + tags + updated-at
    // 使用 or-join 处理可选的 tags，避免多次查询
    logger.debug('[Query:queryBlocks] executing combined query for blocks, pages, tags, and updated info');
    const allBlocksWithMeta = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b [*]) ?page-name ?tag-name ?updated
       :where
       [?b :block/content ?content]
       [?b :block/created-at ?created]
       [(>= ?created ${startTimestamp})]
       [(<= ?created ${endTimestamp})]
       [?b :block/page ?page]
       [?page :page/name ?page-name]
       [?b :block/updated-at ?updated]
       (or-join [?b ?tag-name]
         (and [?b :block/tags ?t] [?t :block/title ?tag-name])
         (and [(identity nil) ?tag-name]))]
    `);
    logger.debug('[Query:queryBlocks] allBlocksWithMeta result', { count: allBlocksWithMeta.length });

    const tagCount: Record<string, number> = {};
    const pageCount: Record<string, number> = {};
    const updatedBlockIds = new Set<string>();
    let totalContentLength = 0;

    // 统计页面、标签、内容长度和更新信息
    for (const row of allBlocksWithMeta) {
      if (!row || !Array.isArray(row) || row.length < 1) continue;
      
      const blockData = row[0] as any;
      const pageName = row[1] as string;
      const tagName = row[2] as string | null;
      const updatedAt = row[3] as number;
      const content = blockData?.['content'] || '';
      const blockId = blockData?.['uuid'] || blockData?.[':block/uuid'];
      
      totalContentLength += content.length;

      // 统计页面
      if (pageName) {
        pageCount[pageName] = (pageCount[pageName] || 0) + 1;
      }

      // 统计标签（可能为 null）
      if (tagName) {
        tagCount[tagName] = (tagCount[tagName] || 0) + 1;
      }

      // 统计更新的块（在时间范围内更新）
      if (updatedAt && updatedAt >= startTimestamp && updatedAt <= endTimestamp) {
        if (blockId) {
          updatedBlockIds.add(blockId);
        }
      }
    }

    const created = allBlocksWithMeta.length;
    const modified = updatedBlockIds.size;
    const total = allBlocksWithMeta.length;

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
