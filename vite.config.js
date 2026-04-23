import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'

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
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    server: {
      port: 3000,
    },
  }
})