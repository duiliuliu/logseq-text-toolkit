// 测试最新实现
const testCases = [
  // 场景1：用户原始例子
  {
    name: "场景1：用户原始例子",
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
  // 场景6：只有一个完成状态
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
  // 场景13：用户的第二个例子 - 前天和今天
  {
    name: "场景13：用户第二个例子 - 前天和今天",
    items: [
      { label: "简历投递", status: "pending", date: null },
      { label: "测评环节", status: "pending", date: null },
      { label: "笔试环节", status: "completed", date: "2026-06-05" },
      { label: "第一轮技术面试", status: "pending", date: null },
      { label: "第二轮技术面试", status: "completed", date: "2026-06-07" },
    ]
  }
];

// 最终排序实现（和源代码一致）
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

function printItems(label, items) {
  items.forEach((item, idx) => {
    const dateStr = item.date ? ` (${item.date})` : '';
    console.log(`  ${idx}: ${item.label} [${item.status}]${dateStr}`);
  });
}

console.log("=".repeat(70));
console.log("测试最新实现");
console.log("=".repeat(70));

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${index + 1}. ${testCase.name}`);
  console.log('='.repeat(70));

  console.log("\n【原始】");
  printItems("原始", testCase.items);

  console.log("\n【结果】");
  const sorted = sortMilestoneItems(testCase.items);
  printItems("结果", sorted);
});
