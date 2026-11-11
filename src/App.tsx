// 页面骨架：只负责「谁在谁里面」，不负责任何具体内容。
//
// 想知道「主页上有什么」，看这一个文件就够：
//   Nav（导航栏，吸顶 + 当前区块高亮）
//   Hero（大标题区：左标题 + 右简介/现状/荣誉）
//   main
//     ├── Work    精选作品 #work（左两列作品卡 + 右路径/能力/联系栏，卡片点开详情弹窗）
//     ├── Notes   学习笔记 #notes
//     └── About   关于我   #about
//   Footer（页脚）

import { useEffect } from 'react'

import Nav from './components/Nav'
import Hero from './components/Hero'
import Work from './components/Work'
import Notes from './components/Notes'
import About from './components/About'
import Footer from './components/Footer'

// 从笔记页点导航「笔记」进来时，浏览器解析 HTML 阶段还没有 #notes（React 稍后才挂载），
// 原生锚点跳转落空会停在顶部；挂载后按 hash 补一次定位。
function useHashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [])
}

export default function App() {
  useHashScroll()

  return (
    <>
      {/* 键盘用户按 Tab 时第一站：跳过导航直接到正文 */}
      <a className="skip-link" href="#main">跳到主要内容</a>
      <Nav />
      <Hero />
      <main id="main" tabIndex={-1}>
        <Work />
        <Notes />
        <About />
      </main>
      <Footer />
    </>
  )
}
