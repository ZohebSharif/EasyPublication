import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), svgr()],
  base: command === 'serve' ? '/' : '/EasyPublication/',
  server: {
    proxy: {
      '/api': {
        target: command === 'serve' ? 'http://localhost:3001' : 'https://easypublication-server.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}))
