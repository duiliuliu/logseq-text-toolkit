// ============================================================
// 测试文件名: test-milestone-sorting.js
// 描述: 全面测试里程碑排序逻辑
// ============================================================

// 测试用例
const testCases = [
  {
    id: 1,
    name: "用户原始例子 - 两个完成状态，中间夹着其他元素",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "completed", date: "2026-06-06" },
      { label: "第三轮技术面试", status: "pending", date: null },
      { label: "HR面试", status: "pending", date: null },
      { label: "OFFER发放", status: "pending", date: null },
    ]
  },
  {
    id: 2,
    name: "三个完成状态，分散排列",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "completed", date: "2026-06-05" },
      { label: "笔试环节", status: "pending", date: null },
      { label: "第一轮技术面试", status: "completed", date: "2026-06-06" },
      { label: "第二轮技术面试", status: "pending", date: null },
      { label: "第三轮技术面试", status: "completed", date: "2026-06-07" },
      { label: "HR面试", status: "pending", date: null },
    ]
  },
  {
    id: 3,
    name: "同状态且日期相同",
    items: [
      { label: "A", status: "pending", date: null },
      { label: "B", status: "completed", date: "2026-06-07" },
      { label: "C", status: "pending", date: null },
      { label: "D", status: "completed", date: "2026-06-07" },
      { label: "E", status: "pending", date: null },
    ]
  },
  {
    id: 4,
    name: "多个混合状态",
    items: [
      { label: "1", status: "skipped", date: null },
      { label: "2", status: "completed", date: "2026-06-08" },
      { label: "3", status: "in_progress", date: null },
      { label: "4", status: "completed", date: "2026-06-06" },
      { label: "5", status: "pending", date: null },
      { label: "6", status: "completed", date: "2026-06-07" },
      { label: "7", status: "failed", date: null },
    ]
  },
  {
    id: 5,
    name: "有些完成状态没有日期",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "第一轮技术面试", status: "completed", date: "2026-06-06" },
      { label: "第二轮技术面试", status: "pending", date: null },
    ]
  },
  {
    id: 6,
    name: "只有一个完成状态",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "pending", date: null },
    ]
  },
  {
    id: 7,
    name: "所有元素都是pending状态（无日期）",
    items: [
      { label: "A", status: "pending", date: null },
      { label: "B", status: "pending", date: null },
      { label: "C", status: "pending", date: null },
      { label: "D", status: "pending", date: null },
    ]
  },
  {
    id: 8,
    name: "连续多个完成状态",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "completed", date: "2026-06-08" },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "completed", date: "2026-06-09" },
      { label: "HR面试", status: "pending", date: null },
    ]
  },
  {
    id: 9,
    name: "三个完成状态连续在一起",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "completed", date: "2026-06-05" },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "completed", date: "2026-06-06" },
      { label: "HR面试", status: "pending", date: null },
    ]
  },
  {
    id: 10,
    name: "空数组",
    items: []
  },
  {
    id: 11,
    name: "单个元素",
    items: [
      { label: "简历投递", status: "pending", date: null }
    ]
  },
  {
    id: 12,
    name: "日期完全逆序的完成状态",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "completed", date: "2026-06-09" },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "completed", date: "2026-06-05" },
      { label: "第二轮技术面试", status: "pending", date: null },
      { label: "HR面试", status: "pending", date: null },
    ]
  },
  {
    id: 13,
    name: "用户第二个例子 - 日期顺序已经正确，保持原样",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: "2026-06-05" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "completed", date: "2026-06-07" },
    ]
  },
];

// 排序逻辑实现（和源代码一致）
function sortMilestoneItems(items) {
  let result = [...items];

  const allStates = new Set();
  items.forEach(item => allStates.add(item.status));

  for (const currentState of allStates) {
    const stateEntries = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === currentState) {
        stateEntries.push({ item: items[i], index: i });
      }
    }

    if (stateEntries.length <= 1) continue;

    const hasDates = stateEntries.some(e => !!e.item.date);
    if (!hasDates) continue;

    let originalDatesAreCorrect = true;
    for (let i = 1; i < stateEntries.length; i++) {
      const prevItem = stateEntries[i - 1].item;
      const currItem = stateEntries[i].item;

      if (prevItem.date && currItem.date) {
        if (prevItem.date > currItem.date) {
          originalDatesAreCorrect = false;
          break;
        }
      } else if (currItem.date && !prevItem.date) {
        originalDatesAreCorrect = false;
        break;
      }
    }

    if (originalDatesAreCorrect) continue;

    const sortedStateItems = [...stateEntries].sort((a, b) => {
      if (a.item.date && b.item.date) {
        return a.item.date.localeCompare(b.item.date);
      }
      if (a.item.date) return -1;
      if (b.item.date) return 1;
      return a.index - b.index;
    }).map(e => e.item);

    const stateIndices = stateEntries.map(e => e.index);
    const minIndex = Math.min(...stateIndices);
    const maxIndex = Math.max(...stateIndices);

    const otherItemsInRange = [];
    for (let i = minIndex; i <= maxIndex; i++) {
      if (items[i].status !== currentState) {
        otherItemsInRange.push(items[i]);
      }
    }

    const newRangeItems = [...otherItemsInRange, ...sortedStateItems];

    result = [
      ...items.slice(0, minIndex),
      ...newRangeItems,
      ...items.slice(maxIndex + 1)
    ];
  }

  return result;
}

// 打印函数
function printItems(label, items) {
  console.log(`\n--- ${label} ---`);
  if (items.length === 0) {
    console.log("  (空数组)");
    return;
  }
  items.forEach((item, idx) => {
    const dateStr = item.date ? ` (${item.date})` : '';
    console.log(`  ${idx}: ${item.label} [${item.status}]${dateStr}`);
  });
}

// 运行所有测试
console.log("=".repeat(70));
console.log("里程碑排序逻辑 - 全面测试");
console.log("=".repeat(70));
console.log(`测试用例总数: ${testCases.length}`);
console.log(`测试日期: 2026-06-07`);
console.log("=".repeat(70));

testCases.forEach((testCase, index) => {
  console.log(`\n\n${"=".repeat(70)}`);
  console.log(`测试用例 ${testCase.id}: ${testCase.name}`);
  console.log("=".repeat(70));

  printItems("原始顺序", testCase.items);

  const sorted = sortMilestoneItems(testCase.items);
  printItems("排序后", sorted);

  console.log("\n【变更分析】");
  if (testCase.items.length === 0) {
    console.log("  ✅ 空数组，无变化");
  } else {
    let changes = false;
    for (let i = 0; i < Math.min(testCase.items.length, sorted.length); i++) {
      if (testCase.items[i].label !== sorted[i].label) {
        changes = true;
        console.log(`  位置 ${i}: ${testCase.items[i].label} → ${sorted[i].label}`);
      }
    }
    if (!changes) {
      console.log("  ✅ 顺序完全保持原样，无需调整");
    }
  }
});

console.log(`\n\n${"=".repeat(70)}`);
console.log("✅ 所有测试用例完成！");
console.log("=".repeat(70));
