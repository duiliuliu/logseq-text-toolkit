import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';

export class QueryService {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

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
      [:find ?b ?content ?tags
       :where [?b :block/content ?content]
              [?b :block/created-at ?ca]
              [(>= ?ca "${startStr}")]
              [(<= ?ca "${endStr}")]
              (optional [?b :block/tags ?tags])]
    `);

    const tagCount: Record<string, number> = {};
    let totalContentLength = 0;

    for (const block of allBlocks) {
      const content = block[1] as string;
      const tags = block[2] as string[] || [];
      
      totalContentLength += content.length;
      
      for (const tag of tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }

    const created = createdBlocks.length > 0 ? Number(createdBlocks[0][0]) : 0;
    const modified = modifiedBlocks.length > 0 ? Number(modifiedBlocks[0][0]) : 0;
    const total = allBlocks.length;

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

    const tasks = await logseqAPI.DB.datascriptQuery(`
      [:find ?b ?content ?status ?priority ?scheduled
       :where [?b :block/content ?content]
              [?b :block/marker ?marker]
              [(contains? #{"TODO" "DOING" "DONE"} ?marker)]
              [?b :block/scheduled ?scheduled]
              [(>= ?scheduled "${startStr}")]
              [(<= ?scheduled "${endStr}")]
              (optional [?b :block/priority ?priority])
              (optional [?b :block/status ?status])]
    `);

    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let overdue = 0;
    const byPriority: Record<string, number> = {};

    const now = new Date();

    for (const task of tasks) {
      const content = task[1] as string;
      const status = task[2] as string || '';
      const priority = task[3] as string || '';
      const scheduled = task[4] as string;

      if (status === 'done' || content.includes('[x]') || content.includes('- [x]')) {
        completed++;
      } else if (status === 'doing' || content.includes('[~]') || content.includes('- [~]')) {
        inProgress++;
      } else {
        todo++;
      }

      if (scheduled && new Date(scheduled) < now && status !== 'done') {
        overdue++;
      }

      if (priority) {
        byPriority[priority] = (byPriority[priority] || 0) + 1;
      }
    }

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

    const pages = await logseqAPI.DB.datascriptQuery(`
      [:find ?p ?name ?createdAt ?updatedAt ?tags ?properties
       :where [?p :page/name ?name]
              [?p :page/created-at ?createdAt]
              [?p :page/updated-at ?updatedAt]
              (optional [?p :page/tags ?tags])
              (optional [?p :block/properties ?properties])]
    `);

    let newPages = 0;
    let modifiedPages = 0;
    const byTag: Record<string, number> = {};
    const byProperty: Record<string, Record<string, number>> = {};

    for (const page of pages) {
      const createdAt = page[2] as string;
      const updatedAt = page[3] as string;
      const tags = page[4] as string[] || [];
      const properties = page[5] as Record<string, any> || {};

      if (createdAt >= startStr && createdAt <= endStr) {
        newPages++;
      }

      if (updatedAt >= startStr && updatedAt <= endStr) {
        modifiedPages++;
      }

      for (const tag of tags) {
        byTag[tag] = (byTag[tag] || 0) + 1;
      }

      for (const [key, value] of Object.entries(properties)) {
        if (!byProperty[key]) {
          byProperty[key] = {};
        }
        const valueStr = String(value);
        byProperty[key][valueStr] = (byProperty[key][valueStr] || 0) + 1;
      }
    }

    return {
      total: pages.length,
      newPages,
      modifiedPages,
      byTag,
      byProperty,
    };
  }
}