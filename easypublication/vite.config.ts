import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/als': {
        target: 'https://alsusweb.lbl.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/als/, ''),
        secure: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['sql.js']
  },
  assetsInclude: ['**/*.wasm']
})
