import { defineConfig } from 'vite'
import logseqPlugin from 'vite-plugin-logseq'

export default defineConfig({
  plugins: [logseqPlugin()],
  server: {
    port: 3000,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    emptyOutDir: true,
    sourcemap: true
  },
  optimizeDeps: {
    include: ['preact']
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
})
