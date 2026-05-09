const fs = require('fs')
const path = require('path')
const cssFiles = require('./css-files')

const sourceDir = 'src'
const distDir = 'dist'

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

const sourceMap = {
  'toolbar.css': 'src/components/Toolbar/toolbar.css',
  'settingsModal.css': 'src/components/SettingsModal/settingsModal.css',
  'modal.css': 'src/components/Modal/modal.css',
  'inlineComment.css': 'src/components/Comment/inlineComment.css',
  'customToolbarItems.css': 'src/components/SelectToolbar/customsToolbarItems.css',
  'taskProgress.css': 'src/components/TaskProgress/taskProgress.css',
  'customSelect.css': 'src/components/CustomSelect/customSelect.css',
}

cssFiles.forEach(file => {
  const sourcePath = sourceMap[file]
  if (!sourcePath) {
    console.warn(`Warning: No source mapping for ${file}`)
    return
  }
  const dest = path.join(distDir, file)
  try {
    fs.copyFileSync(sourcePath, dest)
    console.log(`Copied: ${sourcePath} -> ${dest}`)
  } catch (err) {
    console.error(`Error copying ${file}:`, err.message)
  }
})

console.log(`\nTotal: ${cssFiles.length} CSS files copied`)
