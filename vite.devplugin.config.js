import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, existsSync, readFileSync, copyFileSync } from 'fs'

function fixHtmlPathsPlugin() {
  return {
    name: 'fix-html-paths',
    closeBundle() {
      const htmlPath = resolve(__dirname, 'dist/index.html')
      try {
        let html = readFileSync(htmlPath, 'utf-8')
        html = html.replace(/src="\//g, 'src="./')
        html = html.replace(/href="\//g, 'href="./')
        writeFileSync(htmlPath, html)
        console.log('[fix-html-paths] Fixed all absolute paths in index.html to relative paths')
      } catch (e) {
        console.warn('[fix-html-paths] Could not fix index.html:', e.message)
      }
    },
  }
}

export default defineConfig({
  root: 'src',
  plugins: [
    react(),
    fixHtmlPathsPlugin(),
    {
      name: 'vite-plugin-packagejson-export',
      apply: 'build',
      writeBundle() {

        // 复制 package.json 到 dist 目录
        const srcPackageJson = resolve(__dirname, 'package.json')
        const destPackageJson = resolve(__dirname, 'dist', 'package.json')
        if (existsSync(srcPackageJson)) {
          copyFileSync(srcPackageJson, destPackageJson)
          console.log('[vite-plugin-css-export] Copied package.json to dist/')
        } else {
          console.warn('[vite-plugin-css-export] package.json not found')
        }
      }
    }

  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: 'inline',
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        generatedCode: {
          preset: 'es2015',
          constBindings: false,
          arrowFunctions: false,
        },
      },
    },
  },
  esbuild: {
    keepNames: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
  },
  server: {
    port: 3000,
  },
})
