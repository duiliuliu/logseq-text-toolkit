import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

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
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: 'inline',
    rollupOptions: {
      preserveEntrySignatures: 'auto',
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        preserveModules: true,
        preserveModulesRoot: resolve(__dirname, 'src'),
        format: 'es',
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
