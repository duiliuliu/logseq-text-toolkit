import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const CSS_FILES_CONFIG = 'scripts/css-files.js'

function extractExternalPaths() {
  const projectRoot = resolve(__dirname)
  const cssRegistryPath = resolve(projectRoot, 'src/initializer.ts')
  
  console.log('[vite-plugin-css-export] Project root:', projectRoot)
  console.log('[vite-plugin-css-export] CSS registry path:', cssRegistryPath)
  
  if (!existsSync(cssRegistryPath)) {
    console.warn('[vite-plugin-css-export] cssRegistry/index.ts not found')
    return null
  }
  
  const content = readFileSync(cssRegistryPath, 'utf-8')
  const regex = /externalPath:\s*['"]([^'"]+)['"]/g
  const paths = []
  let match
  
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1])
  }
  
  return paths.length > 0 ? paths : null
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
          console.log('[vite-plugin-css-export] Bundle written, extracting CSS files...')
          const paths = extractExternalPaths()
          if (paths) {
            generateCSSFilesConfig(paths)
          }
        }
      }
    ],
    assetsInclude: ['**/*.css'],
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      target: 'esnext',
      minify: 'terser',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
    },
    server: {
      port: 3000,
    },
  }
})
