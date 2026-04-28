import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: 'src',
    plugins: [react(), logseqDevPlugin()],
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