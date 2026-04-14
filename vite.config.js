import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import logseqDevPlugin from 'vite-plugin-logseq'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react(), logseqDevPlugin()],
    build: {
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
    // 测试模式配置
    ...(mode === 'test' && {
      root: '.',
      build: {
        outDir: 'dist-test',
      },
    }),
  }
})