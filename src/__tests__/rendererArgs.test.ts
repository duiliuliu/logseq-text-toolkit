/**
 * rendererArgs.ts 单元测试
 * 
 * 测试宏命令参数解析和更新的各种逻辑
 * 运行: npx tsx src/__tests__/rendererArgs.test.ts
 */

import {
  registerRendererArgModel,
  splitRendererArgs,
  parseRendererArgs,
  createRendererArgUpdater
} from '../lib/render/rendererArgs'

// ============================================================
// 测试框架（简单的断言函数）
// ============================================================

let testCount = 0
let passCount = 0
let failCount = 0

function assertEqual<T>(actual: T, expected: T, message: string): void {
  testCount++
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    passCount++
    console.log(`  ✅ ${message}`)
  } else {
    failCount++
    console.log(`  ❌ ${message}`)
    console.log(`     Expected: ${JSON.stringify(expected)}`)
    console.log(`     Actual:   ${JSON.stringify(actual)}`)
  }
}

function assertContains(actual: string, expected: string, message: string): void {
  testCount++
  if (actual.includes(expected)) {
    passCount++
    console.log(`  ✅ ${message}`)
  } else {
    failCount++
    console.log(`  ❌ ${message}`)
    console.log(`     Expected to contain: ${expected}`)
    console.log(`     Actual: ${actual}`)
  }
}

function assertTrue(condition: boolean, message: string): void {
  testCount++
  if (condition) {
    passCount++
    console.log(`  ✅ ${message}`)
  } else {
    failCount++
    console.log(`  ❌ ${message}`)
  }
}

function section(name: string): void {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  ${name}`)
  console.log('='.repeat(60))
}

// ============================================================
// 测试用例
// ============================================================

// 注册测试用的模型
registerRendererArgModel(':heatmap', { positional: ['view'] })
registerRendererArgModel(':热力图', { positional: ['view'] })
registerRendererArgModel(':blockview', { positional: ['view'] })

// 创建更新器实例
const { updateRendererArgs: updateHeatmapArgs } = createRendererArgUpdater([':heatmap', ':热力图'])
const { updateRendererArgs: updateBlockViewArgs } = createRendererArgUpdater([':blockview'])

// ============================================================
// 1. splitRendererArgs 测试
// ============================================================

section('1. splitRendererArgs 测试')

console.log('\n1.1 基本情况测试')
let result = splitRendererArgs(undefined)
assertEqual(result, null, 'undefined 参数返回 null')

result = splitRendererArgs([])
assertEqual(result, null, '空数组返回 null')

result = splitRendererArgs([''])
assertEqual(result, { type: '', tokens: [] }, '单个空字符串')

console.log('\n1.2 单参数测试')
result = splitRendererArgs([':heatmap'])
assertEqual(result, { type: ':heatmap', tokens: [] }, '只有类型')

result = splitRendererArgs([':heatmap', 'year'])
assertEqual(result, { type: ':heatmap', tokens: ['year'] }, '类型 + 位置参数')

result = splitRendererArgs([':heatmap', 'year,', 'month'])
assertEqual(result, { type: ':heatmap', tokens: ['year', 'month'] }, '逗号分隔')

console.log('\n1.3 命名参数测试')
result = splitRendererArgs([':heatmap', 'displayMode=full'])
assertEqual(result, { type: ':heatmap', tokens: ['displayMode=full'] }, '命名参数')

result = splitRendererArgs([':heatmap', 'year,', 'displayMode=full'])
assertEqual(result, { type: ':heatmap', tokens: ['year', 'displayMode=full'] }, '位置 + 命名参数')

result = splitRendererArgs([':heatmap', 'displayMode=full,', 'containerWidth=600px'])
assertEqual(result, { type: ':heatmap', tokens: ['displayMode=full', 'containerWidth=600px'] }, '多个命名参数')

console.log('\n1.4 中文宏命令测试')
result = splitRendererArgs([':热力图'])
assertEqual(result, { type: ':热力图', tokens: [] }, '中文类型')

result = splitRendererArgs([':热力图', 'month,', 'displayMode=basic'])
assertEqual(result, { type: ':热力图', tokens: ['month', 'displayMode=basic'] }, '中文 + 参数')

// ============================================================
// 2. parseRendererArgs 测试
// ============================================================

section('2. parseRendererArgs 测试')

console.log('\n2.1 基本解析测试')
let parsed = parseRendererArgs(':heatmap', [])
assertEqual(parsed, {}, '空 tokens')

parsed = parseRendererArgs(':heatmap', ['year'])
assertEqual(parsed, { view: 'year' }, '位置参数映射到 view')

parsed = parseRendererArgs(':heatmap', ['displayMode=full'])
assertEqual(parsed, { displayMode: 'full' }, '命名参数')

parsed = parseRendererArgs(':heatmap', ['month', 'displayMode=basic'])
assertTrue(
  parsed['view'] === 'month' && parsed['displayMode'] === 'basic',
  '位置 + 命名参数'
)

console.log('\n2.2 优先级测试（命名参数优先）')
parsed = parseRendererArgs(':heatmap', ['year', 'view=month'])
assertEqual(parsed, { view: 'month' }, '命名参数 view 覆盖位置参数')

console.log('\n2.3 中文宏命令测试')
parsed = parseRendererArgs(':热力图', ['year'])
assertEqual(parsed, { view: 'year' }, '中文类型 + 位置参数')

parsed = parseRendererArgs(':热力图', ['week', 'displayMode=minimal'])
assertTrue(
  parsed['view'] === 'week' && parsed['displayMode'] === 'minimal',
  '中文类型 + 混合参数'
)

// ============================================================
// 3. updateRendererArgs 测试 - 添加参数
// ============================================================

section('3. updateRendererArgs 测试 - 添加参数')

console.log('\n3.1 基础添加测试')
let content = '{{renderer :heatmap}}'
let updated = updateHeatmapArgs(content, { containerWidth: '600px' })
assertEqual(updated, '{{renderer :heatmap, containerWidth=600px}}', '空宏添加单个参数')

content = '{{renderer :heatmap}}'
updated = updateHeatmapArgs(content, { view: 'year', displayMode: 'full' })
assertEqual(updated, '{{renderer :heatmap, year, displayMode=full}}', '空宏添加多个参数')

console.log('\n3.2 带现有参数的添加测试')
content = '{{renderer :heatmap, view=month}}'
updated = updateHeatmapArgs(content, { containerWidth: '800px' })
assertEqual(updated, '{{renderer :heatmap, containerWidth=800px, view=month}}', '添加参数到现有宏')

content = '{{renderer :heatmap, displayMode=full}}'
updated = updateHeatmapArgs(content, { containerWidth: '700px' })
assertEqual(updated, '{{renderer :heatmap, containerWidth=700px, displayMode=full}}', '添加参数到有命名参数的宏')

console.log('\n3.3 位置参数处理测试')
content = '{{renderer :heatmap year}}'
updated = updateHeatmapArgs(content, { containerWidth: '500px' })
assertEqual(updated, '{{renderer :heatmap, year, containerWidth=500px}}', '位置参数保留')

// ============================================================
// 4. updateRendererArgs 测试 - 更新参数
// ============================================================

section('4. updateRendererArgs 测试 - 更新参数')

console.log('\n4.1 更新命名参数')
content = '{{renderer :heatmap, containerWidth=400px}}'
updated = updateHeatmapArgs(content, { containerWidth: '800px' })
assertEqual(updated, '{{renderer :heatmap, containerWidth=800px}}', '更新现有参数')

content = '{{renderer :heatmap, displayMode=full, view=month}}'
updated = updateHeatmapArgs(content, { displayMode: 'minimal' })
assertEqual(updated, '{{renderer :heatmap, displayMode=minimal, view=month}}', '更新多个参数中的一个')

console.log('\n4.2 更新位置参数')
content = '{{renderer :heatmap year}}'
updated = updateHeatmapArgs(content, { view: 'month' })
assertEqual(updated, '{{renderer :heatmap, month}}', '通过命名参数更新位置参数')

content = '{{renderer :heatmap year, displayMode=full}}'
updated = updateHeatmapArgs(content, { view: 'week' })
assertEqual(updated, '{{renderer :heatmap, displayMode=full, week}}', '保留其他参数更新位置参数')

// ============================================================
// 5. updateRendererArgs 测试 - 删除参数
// ============================================================

section('5. updateRendererArgs 测试 - 删除参数')

console.log('\n5.1 删除命名参数')
content = '{{renderer :heatmap, containerWidth=600px}}'
updated = updateHeatmapArgs(content, { containerWidth: null })
assertEqual(updated, '{{renderer :heatmap}}', '删除单个参数')

content = '{{renderer :heatmap, displayMode=full, containerWidth=600px}}'
updated = updateHeatmapArgs(content, { displayMode: null })
assertEqual(updated, '{{renderer :heatmap, containerWidth=600px}}', '删除多个参数中的一个')

console.log('\n5.2 删除位置参数')
content = '{{renderer :heatmap year}}'
updated = updateHeatmapArgs(content, { view: null })
assertEqual(updated, '{{renderer :heatmap}}', '删除位置参数')

content = '{{renderer :heatmap year, displayMode=full}}'
updated = updateHeatmapArgs(content, { view: null })
assertEqual(updated, '{{renderer :heatmap, displayMode=full}}', '保留其他参数删除位置参数')

// ============================================================
// 6. 边界情况测试
// ============================================================

section('6. 边界情况测试')

console.log('\n6.1 多处宏命令')
content = '前面 {{renderer :heatmap}} 中间 {{renderer :heatmap year}} 后面'
updated = updateHeatmapArgs(content, { containerWidth: '600px' })
assertContains(updated, '{{renderer :heatmap, containerWidth=600px}}', '第一个宏被更新')
assertContains(updated, '{{renderer :heatmap, year, containerWidth=600px}}', '第二个宏被更新')
assertTrue(updated.includes('前面') && updated.includes('中间') && updated.includes('后面'), '其他内容保持不变')

console.log('\n6.2 非匹配前缀不修改')
content = '{{renderer :other}}'
updated = updateHeatmapArgs(content, { containerWidth: '600px' })
assertEqual(updated, '{{renderer :other}}', '非热力图宏不被修改')

console.log('\n6.3 嵌套情况（预期不完美处理嵌套大括号）')
content = '{{renderer :heatmap, displayMode={{inner}}}}'
updated = updateHeatmapArgs(content, { containerWidth: '600px' })
console.log(`  输入: ${content}`)
console.log(`  输出: ${updated}`)

console.log('\n6.4 中文前缀')
content = '{{renderer :热力图}}'
updated = updateHeatmapArgs(content, { containerWidth: '600px' })
assertEqual(updated, '{{renderer :热力图, containerWidth=600px}}', '中文前缀宏添加参数')

content = '{{renderer :热力图, view=year}}'
updated = updateHeatmapArgs(content, { view: 'month' })
assertEqual(updated, '{{renderer :热力图, month}}', '中文前缀宏更新参数')

// ============================================================
// 7. blockview 特定测试
// ============================================================

section('7. BlockView 宏命令测试')

console.log('\n7.1 BlockView 基础测试')
content = '{{renderer :blockview}}'
updated = updateBlockViewArgs(content, { view: 'table' })
assertEqual(updated, '{{renderer :blockview, table}}', 'BlockView 空宏添加视图')

content = '{{renderer :blockview list}}'
updated = updateBlockViewArgs(content, { view: 'gallery' })
assertEqual(updated, '{{renderer :blockview, gallery}}', 'BlockView 更新视图')

console.log('\n7.2 混合格式测试')
content = '{{renderer :blockview table, view=gallery}}'
updated = updateBlockViewArgs(content, { view: 'board' })
assertEqual(updated, '{{renderer :blockview, board}}', '命名参数 view 覆盖位置参数 table')

// ============================================================
// 8. 特殊字符测试
// ============================================================

section('8. 特殊字符测试')

console.log('\n8.1 带空格的参数值')
content = '{{renderer :heatmap, displayMode=full screen}}'
updated = updateHeatmapArgs(content, { containerWidth: '600px' })
console.log(`  输入: ${content}`)
console.log(`  输出: ${updated}`)

console.log('\n8.2 带引号的参数')
content = '{{renderer :heatmap, tag="work items"}}'
updated = updateHeatmapArgs(content, { containerWidth: '600px' })
console.log(`  输入: ${content}`)
console.log(`  输出: ${updated}`)

// ============================================================
// 测试总结
// ============================================================

section('测试总结')
console.log(`\n总计: ${testCount} 个测试`)
console.log(`通过: ${passCount} 个 ✅`)
console.log(`失败: ${failCount} 个 ❌`)

if (failCount > 0) {
  console.log('\n❌ 有测试失败，请检查！')
  process.exit(1)
} else {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
}
