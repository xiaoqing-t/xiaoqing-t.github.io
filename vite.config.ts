import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 的配置文件。它只做两件事：装上 React 插件、声明打包的基础路径。
export default defineConfig({
  // 插件：让 Vite 认识 .tsx 里的 JSX，并开启 React 的调试能力
  // （热更新、组件名显示、开发期额外的检查）
  plugins: [react()],

  // 打包后 HTML 里引用资源的路径前缀。
  // '/' = 从域名根目录开始找（本项目将来部署在 https://xiaoqing-t.github.io/ 根上，所以用 '/'）。
  // 如果哪天换成「项目站」（如 https://xxx.github.io/my-site/），要改成 '/my-site/'。
  base: '/',
})
