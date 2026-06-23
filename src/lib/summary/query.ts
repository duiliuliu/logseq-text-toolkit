import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';
import logger from '../logger';

export class Query {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    const allBlocksWithMeta = await logseqAPI.DB.datascriptQuery(`
      [:find  (pull ?b 
                [:block/content 
                 :block/created-at
                 {:block/page [:block/title]}
                 {:block/tags [:block/title]}
                 {:block/refs [:block/title]}])
       :where
       [?b :block/created-at ?date]
       [(>= ?date ${startTimestamp})]
       [(<= ?date ${endTimestamp})]
     ]
    `);

    const tagCount: Record<string, number> = {};
    const pageCount: Record<string, number> = {};
    let totalContentLength = 0;

    for (const row of allBlocksWithMeta) {
      if (!row || !Array.isArray(row) || row.length < 1) continue;

      const blockData = row[0] as any;
      const content = blockData?.['content'] || blockData?.[':block/content'] || blockData?.[':block/title'] || '';
      const pageData = blockData?.['page'] || blockData?.[':block/page'];
      const tagsData = blockData?.['tags'] || blockData?.[':block/tags'];

      totalContentLength += content.length;

      if (pageData) {
        const pageName = pageData['title'] || pageData[':block/title'];
        if (pageName) {
          pageCount[pageName] = (pageCount[pageName] || 0) + 1;
        }
      }

      if (tagsData && Array.isArray(tagsData)) {
        tagsData.forEach((tagData: any) => {
          const tagName = tagData?.['title'] || tagData?.[':block/title'];
          if (tagName) {
            tagCount[tagName] = (tagCount[tagName] || 0) + 1;
          }
        });
      }
    }

    const created = allBlocksWithMeta.length;

    const modifiedBlocks = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b [:block/uuid])
       :where
       [?b :block/updated-at ?updated]
       [(>= ?updated ${startTimestamp})]
       [(<= ?updated ${endTimestamp})]
     ]
    `);
    const modified = modifiedBlocks.length;

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

    const tasks = await logseqAPI.DB.datascriptQuery(`
      [:find  (pull ?b 
                [:block/content 
                 :block/created-at
                 :block/title
                 {:block/page [:block/title]}
                 {:block/tags [:block/title]}
                 {:logseq.property/status [:block/title]}
                 {:logseq.property/priority [:block/title]}
                 :logseq.property/scheduled])
       :where
       [?b :block/created-at ?date]
       [(>= ?date ${startTimestamp})]
       [(<= ?date ${endTimestamp})]
       [?b :block/tags ?t]
       [?t :block/title "Task"]]
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
      
      const statusData = block?.['logseq.property/status'];
      const priorityData = block?.['logseq.property/priority'];
      
      const status = statusData?.[':block/title']?.toLowerCase() || 
                     statusData?.['title']?.toLowerCase() || 
                     'todo';
      const priority = priorityData?.[':block/title']?.toLowerCase() || 
                       priorityData?.['title']?.toLowerCase() || 
                       'none';

      if (status === 'done' || status === 'completed') {
        completed++;
      } else if (status === 'cancelled') {
        cancelled++;
      } else if (status === 'doing' || status === 'now') {
        inProgress++;
      } else if (status === 'waiting' || status === 'later') {
        // waiting
      } else {
        todo++;
      }

      const scheduled = block?.['scheduled'] || block?.[':logseq.property/scheduled'];
      if (scheduled && status !== 'done' && status !== 'completed' && status !== 'cancelled') {
        const scheduledDate = new Date(scheduled);
        if (scheduledDate < now) {
          overdue++;
        }
      }

      if (priority && priority !== 'none') {
        const priorityKey = String(priority).toLowerCase();
        byPriority[priorityKey] = (byPriority[priorityKey] || 0) + 1;
      }
    }

    logger.info('[Query:queryTasks] completed', {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority
    });

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority,
    };
  }

  async queryPages(dateRange: DateRange): Promise<PageStats> {
    const { start, end } = dateRange;
    const startTimestamp = start.getTime();
    const endTimestamp = end.getTime();

    const pages = await logseqAPI.DB.datascriptQuery(`
      [:find  (pull ?b 
                [:block/title
                 :block/created-at
                 :block/updated-at
                 {:block/tags [:block/title]}])
       :where
       [?b :block/tags ?t]
       [?t :block/title "Page"]
       [?b :block/created-at ?date]
       [(>= ?date ${startTimestamp})]
       [(<= ?date ${endTimestamp})]
     ]
    `);

    let newPages = 0;
    let modifiedPages = 0;
    const byTag: Record<string, number> = {};
    const byProperty: Record<string, Record<string, number>> = {};

    for (const page of pages) {
      if (!page || !Array.isArray(page) || page.length < 1) continue;

      const pageData = page[0] as any;
      const createdAt = pageData?.['created-at'] || pageData?.[':block/created-at'];
      const updatedAt = pageData?.['updated-at'] || pageData?.[':block/updated-at'];
      const tagsData = pageData?.['tags'] || pageData?.[':block/tags'];

      if (createdAt && createdAt >= startTimestamp && createdAt <= endTimestamp) {
        newPages++;
      }

      if (updatedAt && updatedAt >= startTimestamp && updatedAt <= endTimestamp) {
        modifiedPages++;
      }

      if (tagsData && Array.isArray(tagsData)) {
        tagsData.forEach((tagData: any) => {
          const tagName = tagData?.['title'] || tagData?.[':block/title'];
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
