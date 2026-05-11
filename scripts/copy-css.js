const fs = require('fs')
const path = require('path')
const cssFiles = require('./css-files')

// 配置
const sourceDir = 'src'
const distDir = 'dist'

// 创建 dist 目录
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

/* =============================================
   🔥 核心优化：自动递归扫描 src 下所有 CSS 文件
   自动生成 文件名 -> 完整路径 的映射
   再也不用手动维护 sourceMap！
============================================= */
function scanCSSFiles(dir, fileMap = {}) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // 递归扫描子目录
      scanCSSFiles(fullPath, fileMap)
    } else if (file.endsWith('.css')) {
      // 只映射 CSS 文件
      fileMap[file] = fullPath
    }
  })

  return fileMap
}

// 自动生成 sourceMap（全自动！）
const sourceMap = scanCSSFiles(sourceDir)

/* =============================================
   复制逻辑（不变）
============================================= */
let successCount = 0

cssFiles.forEach(file => {
  const sourcePath = sourceMap[file]
  if (!sourcePath) {
    console.warn(`⚠️  Warning: No source mapping for ${file}`)
    return
  }

  const dest = path.join(distDir, file)
  try {
    fs.copyFileSync(sourcePath, dest)
    console.log(`✅ Copied: ${sourcePath} -> ${dest}`)
    successCount++
  } catch (err) {
    console.error(`❌ Error copying ${file}:`, err.message)
  }
})

console.log(`\n🎉 完成！成功复制 ${successCount} 个 CSS 文件`)