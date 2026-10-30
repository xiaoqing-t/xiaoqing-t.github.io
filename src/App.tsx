// 页面骨架：只负责「谁在谁里面」，不负责任何具体内容。
//
// 想知道「主页上有什么」，看这一个文件就够：
//   Nav（导航栏，吸顶）
//   Hero（大标题区）
//   main
//     ├── About     关于我      #about
//     ├── Projects  项目        #projects
//     ├── Notes     学习笔记    #notes
//     └── Contact   联系我      #contact
//   Footer（页脚）

import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Notes from './components/Notes'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    // <>...</> 是 Fragment：把多个兄弟节点打包成一个返回值，但**不生成多余的 DOM 节点**。
    // （一个组件只能返回一个根节点，Fragment 就是用来绕开这条限制的。）
    <>
      {/* 键盘用户按 Tab 时第一站：跳过导航直接到正文 */}
      <a className="skip-link" href="#main">跳到主要内容</a>
      <Nav />
      <Hero />
      <main id="main" tabIndex={-1}>
        <About />
        <Projects />
        <Notes />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
