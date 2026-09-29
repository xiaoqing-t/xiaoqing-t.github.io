import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 的配置文件。它只做两件事：装上 React 插件、声明打包的基础路径。
//
// 注意：把产物收成「单文件」这件事**不在这里做** —— 由构建后的
// scripts/inline-build.mjs 把 JS/CSS 内联进 index.html 完成。
// （那个文件的头注释里写了为什么不用 vite-plugin-singlefile：它在 Vite 8 下静默不生效。）
export default defineConfig({
  // 插件：让 Vite 认识 .tsx 里的 JSX，并开启 React 的调试能力
  // （热更新、组件名显示、开发期额外的检查）
  plugins: [react()],

  // 打包后 HTML 里引用资源的路径前缀。
  // '/' = 从域名根目录开始找（本项目将来部署在 https://xiaoqing-t.github.io/ 根上，所以用 '/'）。
  // 如果哪天换成「项目站」（如 https://xxx.github.io/my-site/），要改成 '/my-site/'。
  // 单文件化之后 JS/CSS 已内联，这里只对仍需外部引用的资源（如 public/ 里的图片）有意义。
  base: '/',

  // 刻意**不设** build.assetsInlineLimit（Vite 默认 4 KB 以下的资源才内联）。
  // 内联脚本负责的是 JS/CSS；将来若放较大的作品图，让它们留在 public/ 或输出成
  // 独立的 assets/ 文件更好 —— 否则整张图会 base64 进 HTML，改一个字就要重下整包。
})
