import { logseqAPI } from '../../logseq';
import { DateRange, BlockStats, TaskStats, PageStats } from './types';

export class QueryService {
  async queryBlocks(dateRange: DateRange): Promise<BlockStats> {
    const { start, end } = dateRange;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    // Mock 模式下返回模拟数据
    if ((window as any).logseqIsMock) {
      return this.getMockBlockStats();
    }

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
      
      // 简单的标签提取
      const tagMatches = content.match(/#\w+/g) || [];
      for (const tag of tagMatches) {
        const cleanTag = tag.substring(1);
        tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1;
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

    // Mock 模式下返回模拟数据
    if ((window as any).logseqIsMock) {
      return this.getMockTaskStats();
    }

    // 参考 taskProgress 的查询逻辑
    const tasks = await logseqAPI.DB.datascriptQuery(`
      [:find (pull ?b [:block/uuid :block/content :block/properties]) ?status-title
       :where
       [?b :block/content ?content]
       [?b :logseq.property/status ?status]
       [?status :block/title ?status-title]
       [?b :block/scheduled ?scheduled]
       [(>= ?scheduled "${startStr}")]
       [(<= ?scheduled "${endStr}")]]
    `);

    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let overdue = 0;
    const byPriority: Record<string, number> = {};

    const now = new Date();

    for (const task of tasks) {
      if (!task || !Array.isArray(task) || task.length < 2) continue;
      
      const block = task[0];
      const statusTitle = task[1];
      const status = statusTitle ? statusTitle.toLowerCase() : 'todo';
      
      if (status === 'done') {
        completed++;
      } else if (status === 'doing' || status === 'in-progress') {
        inProgress++;
      } else {
        todo++;
      }

      // 检查逾期
      if (status !== 'done' && block?.properties?.scheduled) {
        const scheduledDate = new Date(block.properties.scheduled);
        if (scheduledDate < now) {
          overdue++;
        }
      }

      // 简单的优先级分析
      if (block?.content?.includes('A)') || block?.content?.includes('[] A')) {
        byPriority['A'] = (byPriority['A'] || 0) + 1;
      } else if (block?.content?.includes('B)') || block?.content?.includes('[] B')) {
        byPriority['B'] = (byPriority['B'] || 0) + 1;
      } else if (block?.content?.includes('C)') || block?.content?.includes('[] C')) {
        byPriority['C'] = (byPriority['C'] || 0) + 1;
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

    // Mock 模式下返回模拟数据
    if ((window as any).logseqIsMock) {
      return this.getMockPageStats();
    }

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

    return {
      total: pages.length,
      newPages,
      modifiedPages,
      byTag,
      byProperty,
    };
  }

  private getMockBlockStats(): BlockStats {
    return {
      total: 42,
      created: 15,
      modified: 30,
      avgContentLength: 120,
      tags: {
        'task': 8,
        'project': 5,
        'note': 3,
        'idea': 2,
      },
    };
  }

  private getMockTaskStats(): TaskStats {
    return {
      total: 12,
      completed: 7,
      inProgress: 3,
      todo: 2,
      overdue: 1,
      completionRate: 58,
      byPriority: {
        'A': 4,
        'B': 5,
        'C': 3,
      },
    };
  }

  private getMockPageStats(): PageStats {
    return {
      total: 5,
      newPages: 2,
      modifiedPages: 3,
      byTag: {},
      byProperty: {},
    };
  }
}
