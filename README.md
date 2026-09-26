# 个人网站

**React + TypeScript 重构版**（2026-09-26）。独立 git 仓库（有 GitHub 远程，不在笔记仓库根库里管）。

> 这是 `大三上/个人网站/` 的入口笔记，活跃线看板的 entry 指向这里。
> ⚠️ **线上还是 v1 纯静态版**（`main` 分支没动过）；React 版在本地分支 **`react-refactor`**。

## 结构

| 路径 | 用途 |
|---|---|
| `index.html` | Vite 的「壳」：只剩一个 `<div id="root">`，页面内容全在 `src/` |
| `src/main.tsx` | 入口：把 `<App />` 渲染进 `#root` |
| `src/App.tsx` | 页面骨架（谁在谁里面），想知道主页有什么看它 |
| `src/components/*.tsx` | 10 个组件：Nav / Hero / Section / Reveal / About / Projects / Notes / Contact / Footer |
| `src/data/site.tsx` | **全站内容都在这里**（文案、项目、笔记）← 平时只改这个文件 |
| `src/styles/global.css` | 全站样式（设计变量在顶部 `:root`） |
| `public/` | 原样保留的静态老页面：简历 2 页 + 4 篇笔记 + v1 主页冻结副本 —— **URL 一个都没变** |
| **`React重构说明.md`** | **讲解 + 增删改查手册** ← 想改东西先看它 |

## 命令

```bash
npm install      # 第一次（或换了依赖）
npm run dev      # 开发服务器 → http://localhost:5173 （改完自动刷新）
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 本地预览打包结果
```

## 两个用途（没变）

1. **简历**（求职向）— `public/resume.html`（网页版）+ `public/resume-print.html`（打印导出 PDF）
2. **学习笔记发布出口** — `public/note-*.html` 4 篇

## v1 纯静态版去哪了

| 东西 | 在哪 |
|---|---|
| 重构前的最后一版 | git 标签 **`v1-static`**（`git show v1-static:index.html`） |
| 现在这条线 | 本地分支 **`react-refactor`** |
| 线上 | `main` 分支**没动过**，https://xiaoqing-t.github.io/ 还是 v1 |
| 本地对照用的 v1 主页 | `public/v1-index.html`（冻结副本） |

## 注意

- 改完在**这个目录内**单独提交（它是独立 git 仓库，根库 `.gitignore` 已忽略它）
- **`dist/` 不要提交**（构建产物，已进 `.gitignore`）
- 本机 npm 的缓存 / 日志默认写在 `C:\Users\25716\AppData\Local\npm-cache`（DSH 文件沙箱之外）：agent 跑 npm 时要先把 `npm_config_cache` 指到项目内，否则 npm 报「无法写日志目录」

## 相关

- 线卡：[[个人网站]]
- 讲解与增删改查手册：[[React重构说明]]
