import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        dashbaord: path.resolve(__dirname, 'dashboard/index.html'),
      }
    }
  }
});