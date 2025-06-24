import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        dashboard: path.resolve(__dirname, 'dashboard/index.html'),
        test: path.resolve(__dirname, 'test/index.html'),
      }
    }
  }
});