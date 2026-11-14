# 个人网站

**React + TypeScript 重构版**（2026-09-26）。独立 git 仓库（有 GitHub 远程，不在笔记仓库根库里管）。

> 这是 `大三上/个人网站/` 的入口笔记，活跃线看板的 entry 指向这里。
> ✅ **线上已是 React 版**（2026-10-30 核实）：推送 `main` 后由 GitHub Actions 构建并发布到 GitHub Pages。

## 结构

| 路径 | 用途 |
|---|---|
| `index.html` | Vite 的「壳」：只剩一个 `<div id="root">`，页面内容全在 `src/` |
| `src/main.tsx` | 入口：把 `<App />` 渲染进 `#root` |
| `src/App.tsx` | 页面骨架（谁在谁里面），想知道主页有什么看它 |
| `src/components/*.tsx` | 9 个组件：Nav / Hero / Section / Reveal / About / Projects / Notes / Contact / Footer |
| `src/data/site.tsx` | 站点文案、项目、「关于我」三张卡 ← 改文字只改它 |
| `resume.html` / `resume-en.html` | 中文 / 英文简历的 Vite 入口；React 渲染，URL 和静态 meta 都保留 |
| `src/resume/` | 简历页组件与入口 |
| `src/data/resume.ts` | 简历内容，每条同时写 `zh` / `en` |
| `public/notes.json` | **笔记书目**（5 本书 / 21 篇，按阅读顺序）← 加笔记改它，首页和笔记页侧栏都读这一份 |
| `src/styles/global.css` | 全站样式（设计变量在顶部 `:root`） |
| `public/` | 原样保留的静态页：旧打印简历 + 21 篇笔记 + v1 主页冻结副本 + `robots.txt` / `sitemap.xml` / `404.html` / `notes.css`（笔记页配色覆盖）+ `book-shell.css/js`（笔记页侧栏）—— **URL 一个都没变** |
| `public/now.html` | **现在**页：活跃线卡片 + 最近更新；数据由 `sync:now` 直接内嵌，本地双击也能看 |
| `public/now.json` | `/now` 的数据快照，由 `npm run sync:now` 从笔记仓库的白名单线卡生成 |
| `public/case-*.html` | 两个旗舰项目的独立案例页（Coding Agent / EEG 管线），从首页作品弹窗进入 |
| `public/cases.css` | 案例页共享样式，沿用笔记页的墨纸配色 |
| `public/en/` | 英文一页：定位、代表工作、研究与 CV 摘要；导航里的 `EN` 进来 |
| `public/uses.html` | **在用什么**：机器、Obsidian 工作流、网站栈、视频流程、字体配色；联系区的「在用什么」进来 |
| `public/demo/` | **自动机模拟器**：正则 → NFA → DFA 单步运行；`pda.html` 是 PDA / DPDA 模式，栈与分支可视化；入口在 DFA/NFA、正则、PDA、DPDA 四篇笔记 |
| `public/og-image.png` | 首页分享卡（1200×630，英文） |
| `public/og/` | 21 篇笔记各自的分享卡，由 `npm run sync:og` 从 `notes.json` 生成 |
| **`React重构说明.md`** | **讲解 + 增删改查手册** ← 想改东西先看它 |

## 命令

```bash
npm install      # 第一次（或换了依赖）
npm run dev      # 开发服务器 → http://localhost:5173 （改完自动刷新）
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 本地预览打包结果
npm run sync:now # 从笔记仓库的活跃线白名单生成 public/now.json（每周六复盘后）
npm run sync:og # 从 notes.json 重新生成首页与笔记分享卡（需要 Pillow）
npm run test:automata # 自动机核心的单元测试（node --test）
npm run test:pda # PDA / DPDA 模拟核心的单元测试
```

## 部署

推 `main` 即触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：`npm ci` → `npm run build` → 上传 `dist/` 到 GitHub Pages。构建放在 Linux runner 上跑，因为本地 Windows 的 `vite build` 偶发 `0xC0000409`（产物仍完整）。

## 两个用途（没变）

1. **简历**（求职向）— `resume.html`（中文）+ `resume-en.html`（英文），两页都由 React 渲染；旧打印页 `public/resume-print.html` 仍保留但未接入
2. **学习笔记发布出口** — `public/note-*.html` 21 篇（公式多的页面用 `public/katex/` 里自托管的 KaTeX 0.19.1 渲染，不依赖 CDN）

## 简历怎么维护（2026-11）

简历已经收进 React：两个入口 `resume.html` / `resume-en.html` 都只挂一个 `<div id="root">`，内容、结构和中英文都来自 `src/data/resume.ts`。`src/resume/ResumePage.tsx` 按段落渲染，`src/resume/main.tsx` 根据 `<html lang>` 选择中文或英文。

| 想做的事 | 改哪 |
|---|---|
| 改一条中文或英文内容 | `src/data/resume.ts` 里对应的 `{ zh, en }` |
| 加/删一段经历、一条 bullet | 同上；结构只写一次，中文和英文在同一对象里，TypeScript 会要求两边都填 |
| 改版面、配色 | `public/resume.css`（两页共用；打印样式也在里面） |
| 改页面标题、SEO / OG | `resume.html` / `resume-en.html` 的 `<head>` |

和之前「只改中文、脚本生成英文」不同：现在中英文在同一个数据文件里，改中文时同一条的 `en` 也要一起补。好处是不需要生成脚本、构建时不会出现半中半英的页面；代价是英文不再是自动派生的。

## 分享卡（OG 图）

首页和每篇笔记各有一张 1200×630 的分享卡：`public/og-image.png` 和 `public/og/note-*.png`。改标题、加笔记之后跑 `npm run sync:og`，脚本从 `public/notes.json` 重新生成全部卡片（需要本机有 Pillow）。构建不跑这个脚本，CI 用的是仓库里已提交的图；新增笔记漏图时 `note-meta.mjs` 会警告并退回首页卡，不会让页面报错。

## 笔记怎么组织（2026-11）

笔记按「书」分组：`public/notes.json` 是唯一数据源，首页的笔记区和笔记页的左侧目录都读它。
首页有搜索框和按书筛选；笔记页宽屏左侧是本书目录 + 本页小节（滚动高亮），窄屏折成正文开头的可展开目录，正文末尾有上下篇。

| 想做的事 | 改哪 |
|---|---|
| 加一篇笔记 | ① html 丢进 `public/`；② 往 `notes.json` 里对应书的 `notes` 追加一项（`title` / `desc` / `meta` / `href`） |
| 加一本书 | 在 `notes.json` 的 `books` 里加 `{ id, title, tagline, notes: [] }`，位置＝首页显示顺序 |
| 调章节顺序 / 下架 | 挪动或删掉 `notes` 里的那一项；顺序＝阅读顺序，首页章节号和侧栏都跟着变 |

笔记页接入侧栏只要两行（新页面照抄）：

```html
<link rel="stylesheet" href="book-shell.css" />   <!-- <head> 里，跟在 notes.css 后面 -->
<script defer src="book-shell.js"></script>        <!-- </body> 前 -->
```

`book-shell.js` 按文件名去 `notes.json` 里认领当前篇章：认不到、或页面没有 `<main class="article">`（两篇交互图笔记就是这样）就自动跳过，不会破坏原页面。

## v1 纯静态版去哪了

| 东西 | 在哪 |
|---|---|
| 重构前的最后一版 | git 标签 **`v1-static`**（`git show v1-static:index.html`） |
| 现在这条线 | `main`（React 版，已上线） |
| 线上 | https://xiaoqing-t.github.io/ ，由 `main` 推送触发 GitHub Actions 发布 |
| 本地对照用的 v1 主页 | `public/v1-index.html`（冻结副本） |

## 注意

- 改完在**这个目录内**单独提交（它是独立 git 仓库，根库 `.gitignore` 已忽略它）
- **`dist/` 不要提交**（构建产物，已进 `.gitignore`）
- 本机 npm 的缓存 / 日志默认写在 `C:\Users\25716\AppData\Local\npm-cache`（DSH 文件沙箱之外）：agent 跑 npm 时要先把 `npm_config_cache` 指到项目内，否则 npm 报「无法写日志目录」

## 相关

- 线卡：[[个人网站]]
- 讲解与增删改查手册：[[React重构说明]]
