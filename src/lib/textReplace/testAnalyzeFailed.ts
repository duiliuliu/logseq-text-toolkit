/**
 * 失败测试分析
 */

const failedTests = [
  {
    name: '多层混合格式',
    input: '==**高亮加粗**==',
    expected: '[:span.purple "==**高亮加粗**=="]',
    actual: '[:span.purple [:mark "[:b "高亮加粗"]"]]',
    needFix: false,
    reason: '嵌套解析是合理行为，内层格式被正确识别并转换'
  },
  {
    name: '极端多种格式混合',
    input: '**粗体** 和 *斜体* 和 ~~删除~~ 和 ==高亮== 和 `代码`',
    expected: '[:span.red [:b "粗体"]] 和 [:span.red [:i "斜体"]] 和 ...',
    actual: '[:span.red [:b "粗体"] 和 [:i "斜体"] 和 ...]]',
    needFix: true,
    reason: '同一行中多个格式应该分别处理，而不是整体包裹'
  },
  {
    name: '边界空文本',
    input: '',
    expected: '',
    actual: '****',
    needFix: true,
    reason: '空文本应该直接返回空字符串，不应该添加格式'
  },
  {
    name: '边界仅空格',
    input: '   ',
    expected: '',
    actual: '[:span.blue "   "]',
    needFix: true,
    reason: '纯空格文本应该返回空，不应该添加颜色格式'
  },
  {
    name: '边界特殊符号',
    input: '文本含@符号',
    expected: '[:span.blue "文本含@符号"]',
    actual: '[:span.blue 文本含@符号]',
    needFix: false,
    reason: '@符号不需要引号包裹，只有空格、引号才需要'
  }
];

console.log('='.repeat(80));
console.log('失败测试分析报告');
console.log('='.repeat(80));
console.log();

let needFixCount = 0;
let noFixCount = 0;

failedTests.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`);
  console.log(`   输入: ${JSON.stringify(test.input)}`);
  console.log(`   期望: ${test.expected}`);
  console.log(`   实际: ${test.actual}`);
  console.log(`   需要修复: ${test.needFix ? '❌ 是' : '✅ 否'}`);
  console.log(`   原因: ${test.reason}`);
  console.log();
  
  if (test.needFix) {
    needFixCount++;
  } else {
    noFixCount++;
  }
});

console.log('='.repeat(80));
console.log('总结');
console.log('='.repeat(80));
console.log(`需要修复: ${needFixCount} 个`);
console.log(`不需要修复: ${noFixCount} 个`);
console.log();

if (needFixCount > 0) {
  console.log('需要修复的问题：');
  failedTests.filter(t => t.needFix).forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}`);
  });
}
