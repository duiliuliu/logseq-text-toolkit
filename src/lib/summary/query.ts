import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';
import logger from '../logger';

function readTitle(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value['block/title']
    ?? value[':block/title']
    ?? value['title']
    ?? value[':title']
    ?? '';
}

function readTimestamp(value: any): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value instanceof Date) return value.getTime();

  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) return asNumber;

  const asDate = new Date(String(value));
  return Number.isNaN(asDate.getTime()) ? null : asDate.getTime();
}

function readProperty(block: any, key: string): any {
  if (!block) return undefined;
  return block[key]
    ?? block[`:${key}`]
    ?? block[key.replace(/^:/, '')];
}

export class Query {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    // 统计“本周期创建或修改过”的块，避免 total 与 created 完全重复。
    const touchedBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b
                [:block/title
                 :block/created-at
                 :block/updated-at
                 {:block/page [:block/title]}
                 {:block/tags [:block/title]}
                 {:block/refs [:block/title]}])
       :where
       (or-join [?b]
         (and [?b :block/created-at ?created]
              [(>= ?created ${startTimestamp})]
              [(<= ?created ${endTimestamp})])
         (and [?b :block/updated-at ?updated]
              [(>= ?updated ${startTimestamp})]
              [(<= ?updated ${endTimestamp})]))
       (not [?b :block/name])
     ]
    `);

    const tagCount: Record<string, number> = {};
    const pageCount: Record<string, number> = {};
    let totalContentLength = 0;
    let created = 0;
    let modified = 0;

    for (const row of touchedBlocks) {
      if (!row || !Array.isArray(row) || row.length < 1) continue;

      const blockData = row[0] as any;
      const content = readTitle(blockData)
        || blockData?.['content']
        || blockData?.[':block/content']
        || '';
      const pageData = blockData?.['page'] || blockData?.[':block/page'] || blockData?.['block/page'];
      const tagsData = blockData?.['tags'] || blockData?.[':block/tags'] || blockData?.['block/tags'];

      const createdAt = readTimestamp(readProperty(blockData, 'block/created-at'));
      const updatedAt = readTimestamp(readProperty(blockData, 'block/updated-at'));

      if (createdAt != null && createdAt >= startTimestamp && createdAt <= endTimestamp) {
        created++;
      }
      if (updatedAt != null && updatedAt >= startTimestamp && updatedAt <= endTimestamp) {
        modified++;
      }

      totalContentLength += content.length;

      if (pageData) {
        const pageName = readTitle(pageData);
        if (pageName) {
          pageCount[pageName] = (pageCount[pageName] || 0) + 1;
        }
      }

      if (tagsData && Array.isArray(tagsData)) {
        tagsData.forEach((tagData: any) => {
          const tagName = readTitle(tagData);
          if (tagName) {
            tagCount[tagName] = (tagCount[tagName] || 0) + 1;
          }
        });
      }
    }

    const total = touchedBlocks.length;

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

    // 任务范围：本周期创建、计划在本周期、或本周期有更新（完成状态变化通常落在 updated-at）。
    const tasks = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b
                [:block/title
                 :block/created-at
                 :block/updated-at
                 {:block/page [:block/title]}
                 {:block/tags [:block/title]}
                 {:logseq.property/status [:block/title]}
                 {:logseq.property/priority [:block/title]}
                 :logseq.property/scheduled])
       :where
       (or-join [?b]
         (and [?b :block/created-at ?created]
              [(>= ?created ${startTimestamp})]
              [(<= ?created ${endTimestamp})])
         (and [?b :logseq.property/scheduled ?scheduled]
              [(>= ?scheduled ${startTimestamp})]
              [(<= ?scheduled ${endTimestamp})])
         (and [?b :block/updated-at ?updated]
              [(>= ?updated ${startTimestamp})]
              [(<= ?updated ${endTimestamp})]))
       (or-join [?b]
         (and [?b :block/tags ?t]
              [?t :block/title "Task"])
         [?b :logseq.property/status ?status])]
    `);

    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let overdue = 0;
    let cancelled = 0;
    const byPriority: Record<string, number> = {};

    const now = new Date();

    for (const task of tasks) {
      if (!task || !Array.isArray(task) || task.length < 1) continue;

      const block = task[0] as any;

      const statusData = readProperty(block, 'logseq.property/status');
      const priorityData = readProperty(block, 'logseq.property/priority');

      const status = readTitle(statusData).toLowerCase() || 'todo';
      const priority = readTitle(priorityData).toLowerCase() || 'none';

      if (['done', 'completed'].includes(status)) {
        completed++;
      } else if (['cancelled', 'canceled'].includes(status)) {
        cancelled++;
      } else if (
        ['doing', 'now', 'in progress', 'in-progress', 'in-review', 'in review'].includes(status)
      ) {
        inProgress++;
      } else {
        // waiting / later / todo 都归入待办，保证各状态数量之和等于 total
        todo++;
      }

      const scheduledRaw = readProperty(block, 'logseq.property/scheduled')
        || block?.['scheduled']
        || block?.['block/scheduled'];
      const scheduledTimestamp = readTimestamp(scheduledRaw);
      if (
        scheduledTimestamp != null &&
        !['done', 'completed', 'cancelled', 'canceled'].includes(status)
      ) {
        if (scheduledTimestamp < now.getTime()) {
          overdue++;
        }
      }

      if (priority && priority !== 'none') {
        const priorityKey = String(priority).toLowerCase();
        byPriority[priorityKey] = (byPriority[priorityKey] || 0) + 1;
      }
    }

    const completionBase = Math.max(1, total - cancelled);
    const completionRate = total > 0 ? Math.round((completed / completionBase) * 100) : 0;

    logger.info('[Query:queryTasks] completed', {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      cancelled,
      completionRate,
      byPriority
    });

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      cancelled,
      completionRate,
      byPriority,
    };
  }

  async queryPages(_dateRange: DateRange): Promise<PageStats> {
    const { start, end } = _dateRange;
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    // 所有正常页面（排除内置/属性/类页面），用于“总页面数”；
    // 新增/修改再按本周期计算，避免早创建但本周期修改的页面被漏掉。
    const pages = await logseqAPI.DB.datascriptQuery(`
      [:find  (pull ?b
                [:block/title
                 :block/name
                 :block/created-at
                 :block/updated-at
                 {:block/tags [:block/title]}])
       :where
       [?b :block/name]
       [(get-else $ ?b :logseq.property/built-in? false) ?builtin]
       [(false? ?builtin)]
       (not-join [?b]
         [?b :block/tags ?pt]
         [?pt :block/title "Property"])
       (not-join [?b]
         [?b :block/tags ?ct]
         [?ct :block/title "Class"])
     ]
    `);

    let newPages = 0;
    let modifiedPages = 0;
    const byTag: Record<string, number> = {};
    const byProperty: Record<string, Record<string, number>> = {};

    for (const page of pages) {
      if (!page || !Array.isArray(page) || page.length < 1) continue;

      const pageData = page[0] as any;
      const createdAt = readTimestamp(readProperty(pageData, 'block/created-at'));
      const updatedAt = readTimestamp(readProperty(pageData, 'block/updated-at'));
      const tagsData = pageData?.['tags'] || pageData?.[':block/tags'] || pageData?.['block/tags'];

      if (createdAt != null && createdAt >= startTimestamp && createdAt <= endTimestamp) {
        newPages++;
      }
      if (updatedAt != null && updatedAt >= startTimestamp && updatedAt <= endTimestamp) {
        modifiedPages++;
      }

      if (tagsData && Array.isArray(tagsData)) {
        tagsData.forEach((tagData: any) => {
          const tagName = readTitle(tagData);
          if (tagName) {
            byTag[tagName] = (byTag[tagName] || 0) + 1;
          }
        });
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
