// 只测试场景6
const items = [
  { label: "简历投递", status: "pending", date: null },
  { label: "测评环节", status: "pending", date: null },
  { label: "笔试环节", status: "completed", date: "2026-06-07" },
  { label: "第一轮技术面试", status: "pending", date: null },
  { label: "第二轮技术面试", status: "pending", date: null },
];

// 我们的实现
function sortMilestoneItems(items) {
  let result = [...items];
  console.log(" 初始 result:", result.map(i => i.label));

  const allStates = new Set();
  items.forEach(item => allStates.add(item.status));
  console.log(" allStates:", allStates);

  for (const currentState of allStates) {
    console.log("\n 处理状态:", currentState);
    const stateEntries = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === currentState) {
        stateEntries.push({ item: items[i], index: i });
      }
    }
    console.log("   stateEntries:", stateEntries.map(e => ({ item: e.item.label, index: e.index })));

    if (stateEntries.length <= 1) {
      console.log("   只有一个元素，跳过！");
      continue;
    }
    console.log("   有多个元素，继续处理...");
  }

  return result;
}

console.log("原始顺序:");
items.forEach((item, i) => console.log(`  ${i}: ${item.label} [${item.status}]`));

console.log("\n开始排序...");
const result = sortMilestoneItems(items);

console.log("\n结果:");
result.forEach((item, i) => console.log(`  ${i}: ${item.label} [${item.status}]`));
