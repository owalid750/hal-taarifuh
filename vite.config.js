import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // يضمن عمل الروابط سواء على GitHub Pages أو Vercel أو أي استضافة بدون مشاكل مسارات
  build: {
    outDir: 'dist',
  }
});
