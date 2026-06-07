// 全面测试所有12个场景
const testCases = [
  {
    name: "场景1：用户原始例子 - 两个完成状态，中间夹着其他",
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
    name: "场景2：三个完成状态，分散排列",
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
    name: "场景3：同状态且日期相同",
    items: [
      { label: "A", status: "pending", date: null },
      { label: "B", status: "completed", date: "2026-06-07" },
      { label: "C", status: "pending", date: null },
      { label: "D", status: "completed", date: "2026-06-07" },
      { label: "E", status: "pending", date: null },
    ]
  },
  {
    name: "场景4：多个混合状态",
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
    name: "场景5：有些完成状态没有日期",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "第一轮技术面试", status: "completed", date: "2026-06-06" },
      { label: "第二轮技术面试", status: "pending", date: null },
    ]
  },
  {
    name: "场景6：只有一个完成状态",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "pending", date: null },
    ]
  },
  {
    name: "场景7：所有元素都是pending状态",
    items: [
      { label: "A", status: "pending", date: null },
      { label: "B", status: "pending", date: null },
      { label: "C", status: "pending", date: null },
      { label: "D", status: "pending", date: null },
    ]
  },
  {
    name: "场景8：连续多个完成状态",
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
    name: "场景9：三个完成状态连续在一起",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "completed", date: "2026-06-05" },
      { label: "笔试环节", status: "completed", date: "2026-06-07" },
      { label: "第一轮技术面试", status: "completed", date: "2026-06-06" },
      { label: "HR面试", status: "pending", date: null },
    ]
  },
  {
    name: "场景10：空数组",
    items: []
  },
  {
    name: "场景11：单个元素",
    items: [
      { label: "简历投递", status: "pending", date: null }
    ]
  },
  {
    name: "场景12：日期完全逆序的完成状态",
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
    name: "场景13：用户第二个例子 - 前天和今天，日期顺序已经正确",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: "2026-06-05" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "completed", date: "2026-06-07" },
    ]
  },
];

// 排序实现
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
console.log("全面测试所有场景");
console.log("=".repeat(70));

testCases.forEach((testCase, index) => {
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${index + 1}. ${testCase.name}`);
  console.log("=".repeat(70));

  console.log("\n【原始顺序】");
  printItems("原始", testCase.items);

  console.log("\n【排序后】");
  const sorted = sortMilestoneItems(testCase.items);
  printItems("结果", sorted);

  console.log("\n【变化说明】");
  if (testCase.items.length === 0) {
    console.log("  空数组无变化");
  } else {
    let changes = false;
    for (let i = 0; i < Math.min(testCase.items.length, sorted.length); i++) {
      if (testCase.items[i].label !== sorted[i].label) {
        changes = true;
        console.log(`  位置 ${i}: ${testCase.items[i].label} → ${sorted[i].label}`);
      }
    }
    if (!changes) {
      console.log("  ✅ 顺序完全保持原样");
    }
  }
});

console.log(`\n${"=".repeat(70)}`);
console.log("✅ 所有测试完成！");
console.log("=".repeat(70));
