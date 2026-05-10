import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'
import { writeFileSync, existsSync, readdirSync, statSync, readFileSync } from 'fs'
import { resolve, join } from 'path'

const CSS_FILES_CONFIG = 'scripts/css-files.js'
const COMPONENTS_DIR = 'src/components'
const INITIALIZER_PATH = 'src/initializer.ts'

/**
 * Recursively find all CSS files in a directory
 */
function findCSSFiles(dir, baseDir = dir) {
  const files = []
  try {
    const items = readdirSync(dir)
    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        files.push(...findCSSFiles(fullPath, baseDir))
      } else if (item.endsWith('.css')) {
        const relativePath = fullPath.replace(baseDir + '/', '')
        files.push(relativePath)
      }
    }
  } catch (error) {
    console.warn(`[vite-plugin-css-export] Cannot read directory ${dir}:`, error.message)
  }
  return files
}

/**
 * Extract registered CSS external paths from initializer.ts
 * Returns a map of css file name -> full registered path
 */
function getRegisteredCSSPaths() {
  const projectRoot = resolve(__dirname)
  const initializerFile = resolve(projectRoot, INITIALIZER_PATH)

  if (!existsSync(initializerFile)) {
    console.warn('[vite-plugin-css-export] initializer.ts not found')
    return {}
  }

  const content = readFileSync(initializerFile, 'utf-8')

  const registeredPaths = {}

  const regex = /registerCSS\s*\(\s*['"]([^'"]+)['"]\s*,\s*\{[^}]*externalPath:\s*['"]([^'"]+)['"]/gs
  let match

  while ((match = regex.exec(content)) !== null) {
    const [, cssName, externalPath] = match
    registeredPaths[externalPath] = cssName
  }

  console.log(`[vite-plugin-css-export] Found ${Object.keys(registeredPaths).length} registered CSS paths`)
  return registeredPaths
}

/**
 * Scan components directory for CSS files and generate config
 * Only includes CSS files that are registered in initializer.ts
 */
function scanComponentsForCSS() {
  const projectRoot = resolve(__dirname)
  const componentsPath = resolve(projectRoot, COMPONENTS_DIR)

  console.log('[vite-plugin-css-export] Scanning components for CSS files...')

  if (!existsSync(componentsPath)) {
    console.warn('[vite-plugin-css-export] Components directory not found:', componentsPath)
    return []
  }

  const registeredPaths = getRegisteredCSSPaths()
  const allCSSFiles = findCSSFiles(componentsPath)

  const registeredCSSFiles = allCSSFiles.filter(cssFile => {
    const isRegistered = cssFile in registeredPaths
    if (!isRegistered) {
      console.log(`[vite-plugin-css-export] Skipping unregistered CSS: ${cssFile}`)
    }
    return isRegistered
  })

  console.log(`[vite-plugin-css-export] Found ${registeredCSSFiles.length} registered CSS files:`)
  registeredCSSFiles.forEach(f => console.log(`  + ${f}`))

  return registeredCSSFiles
}

function generateCSSFilesConfig(paths) {
  const content = `/**
 * CSS 外部文件列表
 * 自动生成，请勿手动修改
 */

module.exports = ${JSON.stringify(paths, null, 2)}
`
  const configPath = resolve(__dirname, CSS_FILES_CONFIG)
  writeFileSync(configPath, content)
  console.log(`[vite-plugin-css-export] Generated ${paths.length} CSS files: ${paths.join(', ')}`)
}

export default defineConfig(({ mode }) => {
  return {
    root: 'src',
    plugins: [
      react(),
      logseqDevPlugin(),
      {
        name: 'vite-plugin-css-export',
        apply: 'build',
        writeBundle() {
          console.log('[vite-plugin-css-export] Bundle written, scanning for registered CSS files...')
          const cssFiles = scanComponentsForCSS()
          if (cssFiles.length > 0) {
            generateCSSFilesConfig(cssFiles)
          }
        }
      }
    ],
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: 'terser',
      cssCodeSplit: true,
    },
    server: {
      port: 3000,
    },
  }
})
