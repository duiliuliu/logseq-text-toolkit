import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'
import { writeFileSync, existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

const CSS_FILES_CONFIG = 'scripts/css-files.js'
const COMPONENTS_DIR = 'src/components'

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
 * Scan components directory for CSS files and generate config
 */
function scanComponentsForCSS() {
  const projectRoot = resolve(__dirname)
  const componentsPath = resolve(projectRoot, COMPONENTS_DIR)

  console.log('[vite-plugin-css-export] Scanning components for CSS files...')

  if (!existsSync(componentsPath)) {
    console.warn('[vite-plugin-css-export] Components directory not found:', componentsPath)
    return []
  }

  const cssFiles = findCSSFiles(componentsPath)
  console.log(`[vite-plugin-css-export] Found ${cssFiles.length} CSS files:`)
  cssFiles.forEach(f => console.log(`  - ${f}`))

  return cssFiles
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
          console.log('[vite-plugin-css-export] Bundle written, scanning for CSS files...')
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
