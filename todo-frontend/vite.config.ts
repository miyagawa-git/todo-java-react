import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // フロントからの /api → Spring Boot(8081) に転送
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        // Spring Boot 側で /api プレフィックスを付けてない場合は↓有効化
        rewrite: (path) => path.replace(/^\/api/, ''),
      },

    },
  },
})
