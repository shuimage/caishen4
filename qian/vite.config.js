import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    host: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:18889',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
