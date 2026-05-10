import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const CSS_FILES_CONFIG = 'scripts/css-files.js'

function generateCSSFilesConfig(fileNames) {
  const content = `/**
 * CSS 外部文件列表
 * 自动生成，请勿手动修改
 */

module.exports = ${JSON.stringify(fileNames, null, 2)}
`
  const configPath = resolve(__dirname, CSS_FILES_CONFIG)
  writeFileSync(configPath, content)
  console.log(`[vite-plugin-css-export] Generated CSS files config: ${fileNames.join(', ')}`)
}

function extractCSSFilesAndWrite() {
  const projectRoot = resolve(__dirname)
  const initializerPath = resolve(projectRoot, 'src/initializer.ts')

  if (!existsSync(initializerPath)) {
    console.warn('[vite-plugin-css-export] initializer.ts not found')
    return []
  }

  const content = readFileSync(initializerPath, 'utf-8')
  const cssFileNames = []

  const regex = /import\s+(\w+CSSRaw)\s+from\s+['"]([^'"]+\.css\?raw)['"]/g
  const importMap = {}
  let match

  while ((match = regex.exec(content)) !== null) {
    const varName = match[1]
    const cssFilePath = match[2]
    importMap[varName] = cssFilePath
  }

  const registerRegex = /registerCSS\(\s*['"]([^'"]+)['"]\s*,\s*\{[^}]*\}/g
  let registerMatch

  while ((registerMatch = registerRegex.exec(content)) !== null) {
    const registeredName = registerMatch[1]
    const cssFileName = `${registeredName}.css`
    const targetVarName = registeredName + 'CSSRaw'

    if (importMap[targetVarName]) {
      const cssPath = resolve(projectRoot, 'src', importMap[targetVarName].replace(/\?raw$/, ''))

      if (existsSync(cssPath)) {
        const cssContent = readFileSync(cssPath, 'utf-8')
        const distPath = resolve(projectRoot, 'dist', cssFileName)
        writeFileSync(distPath, cssContent, 'utf-8')
        cssFileNames.push(cssFileName)
        console.log(`[vite-plugin-css-export] Written CSS file: ${cssFileName}`)
      } else {
        console.warn(`[vite-plugin-css-export] CSS file not found: ${cssPath}`)
      }
    } else {
      console.warn(`[vite-plugin-css-export] No import found for CSS: ${targetVarName}`)
    }
  }

  return cssFileNames
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
          console.log('[vite-plugin-css-export] Bundle written, processing CSS files...')

          const cssFileNames = extractCSSFilesAndWrite()

          if (cssFileNames.length > 0) {
            generateCSSFilesConfig(cssFileNames)
            console.log(`[vite-plugin-css-export] Processed ${cssFileNames.length} CSS files`)
          } else {
            console.log('[vite-plugin-css-export] No CSS files to process')
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
