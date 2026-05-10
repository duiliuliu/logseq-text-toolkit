const fs = require('fs')
const path = require('path')

const distDir = 'dist'

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true })
}

function scanCSSFiles() {
  const sourceDir = 'src'
  const sourceMap = {}
  
  function walkDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return
    
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.join(basePath, entry.name)
      
      if (entry.isDirectory()) {
        walkDir(fullPath, relativePath)
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        const cssName = entry.name
        const sourceRelative = relativePath
        sourceMap[cssName] = sourceRelative
      }
    }
  }
  
  walkDir(sourceDir)
  return sourceMap
}

const sourceMap = scanCSSFiles()
const cssFiles = Object.keys(sourceMap)

console.log('Found CSS files:', cssFiles)

cssFiles.forEach(file => {
  const sourcePath = path.join(process.cwd(), sourceMap[file])
  const dest = path.join(distDir, file)
  try {
    fs.copyFileSync(sourcePath, dest)
    console.log(`Copied: ${sourceMap[file]} -> ${dest}`)
  } catch (err) {
    console.error(`Error copying ${file}:`, err.message)
  }
})

console.log(`\nTotal: ${cssFiles.length} CSS files copied`)
