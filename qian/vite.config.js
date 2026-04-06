import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
    host: true,
    open: false,
    proxy: {
      '/': {
        target: 'http://localhost:18889',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
