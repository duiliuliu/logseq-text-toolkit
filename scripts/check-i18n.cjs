#!/usr/bin/env node
/**
 * P1.3 - i18n 翻译完整性校验脚本
 * =====================================================================
 * Usage:
 *   node scripts/check-i18n.cjs              # 检查所有语言
 *   node scripts/check-i18n.cjs --strict     # 有任何缺失就以非零退出
 *   node scripts/check-i18n.cjs en ja        # 只检查 en / ja
 *
 * Check items:
 *   ✓ missingKeys:    当前语言文件缺少 zh-CN 有的键
 *   ✓ extraKeys:      当前语言文件有但 zh-CN 没有的键
 *   ✓ missingDefaults:某个语言文件中值为 null 或空字符串
 * =====================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---- 路径配置 ----
const I18N_DIR = path.join(__dirname, '../src/translations');
const BASE_LANG = 'zh-CN';

// ---- 工具：递归遍历 JSON 对象，收集点分路径 + 叶子值 ----
function flatten(obj, prefix = '') {
  const out = {};
  if (obj == null || typeof obj !== 'object') return out;
  for (const [key, val] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(out, flatten(val, full));
    } else {
      out[full] = val;
    }
  }
  return out;
}

// ---- 扫描语言文件 ----
function discoverLanguages() {
  return fs
    .readdirSync(I18N_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''))
    .filter(lang => lang !== 'index');
}

// ---- 主逻辑 ----
function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const langsFilter = args.filter(a => !a.startsWith('--'));

  const available = discoverLanguages();
  if (!available.includes(BASE_LANG)) {
    console.error(`❌ 基准语言 ${BASE_LANG}.json 不存在`);
    process.exit(1);
  }

  const baseRaw = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${BASE_LANG}.json`), 'utf-8'));
  const baseFlat = flatten(baseRaw);
  const baseKeys = Object.keys(baseFlat).sort();

  console.log('========================================');
  console.log('  P1.3 - i18n 翻译完整性检查');
  console.log(`  基准语言: ${BASE_LANG}（键数 = ${baseKeys.length}）`);
  console.log('========================================\n');

  let totalMissing = 0;
  let totalExtra = 0;
  const checkLangs = langsFilter.length > 0
    ? available.filter(l => langsFilter.includes(l))
    : available.filter(l => l !== BASE_LANG);

  for (const lang of checkLangs) {
    const raw = JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${lang}.json`), 'utf-8'));
    const flat = flatten(raw);
    const keys = Object.keys(flat).sort();

    // 找出缺失（base 有、当前文件没有）
    const missing = baseKeys.filter(k => !(k in flat) || flat[k] == null || flat[k] === '');
    // 找出多余（当前文件有、base 没有）
    const extra = keys.filter(k => !(k in baseFlat));

    totalMissing += missing.length;
    totalExtra += extra.length;

    console.log(`[${lang}]`);
    console.log(`  键数: ${keys.length} / ${baseKeys.length} (base)`);

    if (missing.length) {
      console.log(`  ❌ 缺失 / 空值键 (${missing.length}):`);
      for (const k of missing.slice(0, 50)) {
        console.log(`     - ${k}`);
      }
      if (missing.length > 50) console.log(`     ... (还有 ${missing.length - 50} 个)`);
    } else {
      console.log('  ✅ 无缺失键');
    }

    if (extra.length) {
      console.log(`  ⚠️  多余键 (${extra.length}):`);
      for (const k of extra) console.log(`     + ${k}`);
    } else {
      console.log('  ✅ 无多余键');
    }

    console.log();
  }

  // ---- 摘要 ----
  console.log('----------------------------------------');
  console.log(`总计: 缺失键 ${totalMissing}, 多余键 ${totalExtra}`);
  console.log('----------------------------------------');

  if (strict && (totalMissing > 0 || totalExtra > 0)) {
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  console.error('❌ 脚本执行失败:', err.message);
  process.exit(1);
}
