import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 简历页单独构建，输出到同一个 dist/，但不清理已有文件。
// 主站仍是单入口构建，最后由 inline-build 收成单文件；如果三个入口放在同一次构建里，
// Rollup 会为共用 React 拆出共享 chunk，主页就没法保持自包含。
export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        resume: 'resume.html',
        resumeEn: 'resume-en.html',
      },
    },
  },
})
