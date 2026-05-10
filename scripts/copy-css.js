const fs = require('fs')
const path = require('path')
const cssFiles = require('./css-files')

const sourceDir = 'src'
const distDir = 'dist'

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const sourceMap = {
  'Comment/inlineComment.css': 'src/components/Comment/inlineComment.css',
  'CustomSelect/customSelect.css': 'src/components/CustomSelect/customSelect.css',
  'Heatmap/heatmap.css': 'src/components/Heatmap/heatmap.css',
  'Modal/modal.css': 'src/components/Modal/modal.css',
  'SelectToolbar/customsToolbarItems.css': 'src/components/SelectToolbar/customsToolbarItems.css',
  'SettingsModal/settingsModal.css': 'src/components/SettingsModal/settingsModal.css',
  'TaskProgress/taskProgress.css': 'src/components/TaskProgress/taskProgress.css',
  'Toolbar/toolbar.css': 'src/components/Toolbar/toolbar.css',
}

let copied = 0
let skipped = 0

cssFiles.forEach(file => {
  const sourcePath = sourceMap[file]
  if (!sourcePath) {
    console.warn(`Warning: No source mapping for ${file}`)
    skipped++
    return
  }

  const destDir = path.join(distDir, path.dirname(file))
  if (destDir !== distDir) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const dest = path.join(distDir, file)
  try {
    fs.copyFileSync(sourcePath, dest)
    console.log(`Copied: ${sourcePath} -> ${dest}`)
    copied++
  } catch (err) {
    console.error(`Error copying ${file}:`, err.message)
  }
})

console.log(`\nTotal: ${copied} CSS files copied, ${skipped} skipped`)
