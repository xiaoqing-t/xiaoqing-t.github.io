/// <reference types="vite/client" />
// 这行是给 TypeScript 看的「环境声明」：Vite 自带一套类型定义，
// 里面声明了「import 一个 .css 文件是合法的」以及 import.meta.env 之类的东西。
// 没有它，tsc 会对着 `import './styles/global.css'` 报错 —— 因为 TS 只认 .ts/.tsx，
// 而 CSS 是 Vite 在打包时才处理的。
//
// 文件名和位置都是 Vite 模板的约定，不用改。
