// 入口文件：整个 React 应用从这里开始跑。
// 它只做三件事：引入全站样式、找到 index.html 里的挂载点、把 <App /> 渲染进去。

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

// document.getElementById('root') 理论上可能返回 null，
// 末尾的 `!` 是「非空断言」：告诉 TS「我确定它存在，别再让我判空」。
// 真正运行时的报错会由 createRoot 抛出（找不到挂载点是明确的错误，不该静默）。
const rootEl = document.getElementById('root')!

createRoot(rootEl).render(
  // StrictMode 只在开发期起作用：它会把组件渲染两遍、副作用挂载两遍，
  // 专门用来暴露「清理函数写漏了」这类问题。生产构建里不生效。
  <StrictMode>
    <App />
  </StrictMode>,
)
