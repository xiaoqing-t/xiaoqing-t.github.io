# 个人网站

纯静态 HTML/CSS/JS 的对外主页。**独立 git 仓库**（有 GitHub 远程，不在笔记仓库根库里管）。

> 这是 `大三上/个人网站/` 的入口笔记，活跃线看板的 entry 指向这里。

## 文件结构

| 文件 | 用途 |
|---|---|
| `index.html` + `style.css` | 主页 |
| `resume.html` + `resume.css` | 简历（网页版） |
| `resume-print.html` | 简历**打印版**，专供导出 PDF |
| `note-*.html` | 学习笔记发布页 |
| `harness-creator-skill/` | 子目录：harness-creator skill 的资料 |

## 两个用途

1. **简历**（求职向）— 2026-09-20 推翻重做为正式黑白 A4 一页版
2. **学习笔记发布出口** — 已发 4 篇：

| 笔记 | 来源 |
|---|---|
| `note-claude-code-1m.html` | Claude Code 1M 上下文配置 |
| `note-agent-skill-architecture.html` | agent skill 架构 |
| `note-reproduction-basics.html` | 论文复现基础 |
| `note-eeg-pitfalls.html` | EEG 处理踩坑 |

## 怎么本地预览

纯静态，直接双击 `index.html` 即可；或起个静态服务器：

```bash
python -m http.server 8000
```

## 注意

- **改完记得在这个目录内单独提交**（它是独立 git 仓库，根库 `.gitignore` 已忽略它）
- 简历导出 PDF：打开 `resume-print.html` → 浏览器打印 → 存为 PDF

## 相关

- 线卡：[[个人网站]]
