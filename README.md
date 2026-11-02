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
| `src/components/*.tsx` | 10 个组件：Nav / Hero / Section / Reveal / About / Projects / Updates / Notes / Contact / Footer |
| `src/data/site.tsx` | 站点文案、项目、「关于我」三张卡 ← 改文字只改它 |
| `public/bci-updates.json` | **BCI 更新清单** ← 每周往里加几条，首页自动倒序、按月分组 |
| `public/notes.json` | **笔记书目**（4 本书 / 7 篇，按阅读顺序）← 加笔记改它，首页和笔记页侧栏都读这一份 |
| `src/styles/global.css` | 全站样式（设计变量在顶部 `:root`） |
| `public/` | 原样保留的静态页：简历 2 页 + 7 篇笔记 + v1 主页冻结副本 + `robots.txt` / `sitemap.xml` / `404.html` / `notes.css`（笔记页配色覆盖）+ `book-shell.css/js`（笔记页侧栏）—— **URL 一个都没变** |
| **`React重构说明.md`** | **讲解 + 增删改查手册** ← 想改东西先看它 |

## 命令

```bash
npm install      # 第一次（或换了依赖）
npm run dev      # 开发服务器 → http://localhost:5173 （改完自动刷新）
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 本地预览打包结果
```

## 部署

推 `main` 即触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：`npm ci` → `npm run build` → 上传 `dist/` 到 GitHub Pages。构建放在 Linux runner 上跑，因为本地 Windows 的 `vite build` 偶发 `0xC0000409`（产物仍完整）。

## 两个用途（没变）

1. **简历**（求职向）— `public/resume.html`（网页版）+ `public/resume-print.html`（打印导出 PDF）
2. **学习笔记发布出口** — `public/note-*.html` 7 篇（公式多的页面用 `public/katex/` 里自托管的 KaTeX 0.19.1 渲染，不依赖 CDN）

## BCI 更新怎么维护（2026-11）

`public/bci-updates.json` 是唯一数据源，改它不用碰组件：

| 想做的事 | 改哪 |
|---|---|
| 加一条 | 往 `items` 里追加一个对象：`date`（`YYYY-MM-DD`）、`tag`、`title` 必填；`source`、`url`、`note` 可省（省了 `url` 就不出链接） |
| 下架一条 / 调顺序 | 删掉那个对象；顺序无所谓，首页统一按日期倒序、按月分组 |
| 这周不想更新 | `items` 留空数组，区块显示「这个星期还没更新」 |

`tag` 建议限定在「论文 / 产业 / 会议 / 开源 / 实验室」几类；`note` 写的是你自己的判断（为什么值得看），不是摘要。顶部的「最近整理」读的是 `updated` 字段，整理完记得改。`_说明` 只给人看，代码不读它。

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
