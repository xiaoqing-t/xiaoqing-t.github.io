# React 重构说明（个人网站）

> 建立：2026-09-26 ｜ 对应分支 **`react-refactor`** ｜ 上一版是 git 标签 `v1-static`
> 这份文档＝**讲解** + **增删改查手册**。改东西之前先扫一眼第 4 节。
> 术语（JSX / 组件 / props / Hook / 状态 / 副作用…）的「人话定义」在 `术语表/00_术语表.md` 的「前端 / React」节，本文只讲**这个项目里怎么用**。

## 0. 一句话

**内容全在 `src/data/site.tsx`；「怎么显示」全在 `src/components/*.tsx`；样式全在 `src/styles/global.css`。**
想改任何东西，都是改这三个地方之一 —— 先判断你要改的是哪一类。

| 你想改的是 | 去哪 |
|---|---|
| 文字、项目、笔记条目 | `src/data/site.tsx` ← **90% 的情况** |
| 结构（多一块 / 少一块 / 换了排布） | `src/components/` + `src/App.tsx` |
| 颜色、间距、字号、圆角 | `src/styles/global.css` |

## 1. 组件树：主页是由哪些块拼起来的

```
App                                    src/App.tsx
├── Nav                                导航（唯一有状态的组件）
├── Hero                               首屏大标题（锚点 #top）
├── main
│   ├── About      → Section + Reveal  关于我     #about
│   ├── Projects   → Section + Reveal  项目       #projects
│   ├── Notes      → Section + Reveal  学习笔记   #notes
│   └── Contact    → Section           联系我     #contact
└── Footer                             页脚
```

两个「通用件」值得单独记：

| 组件 | 干什么 | 为什么要有它 |
|---|---|---|
| `Section` | 四个区块共用的外壳：`<section id> > container > 编号+标题 + children` | 不然四段外壳要抄 4 遍 |
| `Reveal` | 把包住的东西做成「滚进视野才淡入」 | v1 里这段写在 `script.js` 里，用 `querySelectorAll('.card')` 事后补类名；React 里那样做会跟渲染抢方向盘，所以变成一个组件 |

**v1 → v2 的映射**：v1 的 `index.html` 189 行 HTML + `script.js` 40 行 JS，拆成了 10 个 `.tsx` + 1 个数据文件；`script.js` 里的 4 件事分别变成了 —— 年份（`Footer` 直接算）、移动端菜单（`Nav` 的 `useState`）、滚动阴影（`Nav` 的 `useEffect`）、滚动渐入（`Reveal` 组件）。

## 2. 数据是怎么走到界面上的

```
src/data/site.tsx  ──import──▶  组件  ──return JSX──▶  React 渲染成 DOM
   （内容）                     （显示逻辑）              （浏览器里的界面）
```

| 数据（`site.tsx` 里的导出） | 谁在用 | 界面上对应什么 |
|---|---|---|
| `profile` | Nav / Contact | 左上角「ZY / Zhao Yunzhe」、邮箱 |
| `navLinks` | Nav | 导航栏 5 项（带 `cta: true` 的那个是描边按钮） |
| `hero` | Hero | 首屏标题、副标题、两颗按钮、下方三个小标签 |
| `aboutCards` | About | 「关于我」三张卡 |
| `projects` | Projects | 4 张项目卡 |
| `notes` | Notes | 4 条笔记 |
| `contact` | Contact | 联系区的两个按钮 |
| `siteOwner` | Footer | 页脚署名（年份自动算） |

## 3. 命令与环境

```bash
npm install      # 第一次，或依赖变了之后
npm run dev      # 开发服务器 → http://localhost:5173（改完自动刷新，不用手动刷新浏览器）
npm run build    # 先 tsc 类型检查，再打包到 dist/
npm run preview  # 本地预览 dist/（≈ 将来线上的样子）
```

| 项 | 值 |
|---|---|
| 技术栈 | Vite 8 + React 19 + TypeScript 7 |
| 入口 | `index.html`（壳）→ `src/main.tsx` → `src/App.tsx` |
| 类型检查 | `npm run build` 里的 `tsc --noEmit`；也可以单独 `npx tsc --noEmit` |
| 打包产物 | `dist/`（**不提交**，已在 `.gitignore`） |
| 开发端口 | 5173（Vite 默认） |

两个本机坑（都实测过）：

1. **npm 的缓存和日志默认写在 `C:\Users\25716\AppData\Local\npm-cache`**，在 DSH 文件沙箱之外 → agent 跑 npm 会报「无法写日志目录」。把 `npm_config_cache` 指到项目内即可（`.npm-cache/` 已 gitignore）。
2. **`npm run build` 在 DSH 沙箱里跑不起来**（`spawn EPERM`）：Vite 在 Windows 上要用 `child_process.exec` 调 `net use` 认网络驱动器，而沙箱禁止程序开命名管道。**你自己在终端里跑没问题** —— 这是沙箱的限制，不是项目的问题。

## 4. 增删改查速查 ← 平时只用看这一节

> 改完保存就行：`npm run dev` 开着的话浏览器会自己刷新。

| 想做什么 | 改哪 | 具体怎么做 |
|---|---|---|
| **改一句文案** | `src/data/site.tsx` | 找到那个字符串直接改。找不到就全局搜那句话 |
| **改项目卡片** | `src/data/site.tsx` 的 `projects` | 每个项目是一个 `{ tag, title, desc, points, links }` 对象 |
| **加一个项目** | 同上 | 在 `projects: Project[] = [ … ]` 里**追加一项**（注意上一项末尾要有逗号） |
| **删一个项目** | 同上 | 整块 `{ … },` 删掉；**别留下孤立的逗号**，也别忘了上一项的逗号 |
| **调项目顺序** | 同上 | 整块 `{ … }` 上下挪；顺序＝数组顺序 |
| **改项目里的外链** | 同上 | `links: [{ label: '查看仓库', href: '...' }]`，可以放 0～n 个 |
| **加一篇笔记** | ① `public/` ② `src/data/site.tsx` | ① html 文件丢进 `public/`；② 往 `notes` 追加 `{ category, title, desc, meta, href }`，`href` 只写文件名（如 `note-xxx.html`） |
| **换笔记顺序 / 下架一篇** | `src/data/site.tsx` | 挪位置 / 删那一项。**html 文件删不删随意**：不在 `notes` 里的就不显示 |
| **加一个导航项** | `src/data/site.tsx` 的 `navLinks` | 加 `{ label, href }`。跳本页区块写 `#id`，跳别的页面写文件名 |
| **在页面上加一整块新区块** | ① 新建组件 ② `App.tsx` ③ 数据 ④ 导航 | 见下面「加一块新区块」 |
| **改配色 / 圆角 / 间距** | `src/styles/global.css` 顶部 `:root` | `--accent`（主色）、`--bg`、`--radius`、`--line` 等，**改一处全站生效** |
| **改导航 / 页脚样式** | `src/styles/global.css` | 按注释分节找 `.nav` / `.footer` |
| **改浏览器标签上的标题、SEO 描述** | `index.html` | 那是 Vite 的壳，`<title>` / `<meta name="description">` 在里面 |
| **换 favicon** | `index.html` | 现在是一个内联 SVG 的 ⚡，改那行 `rel="icon"` |
| **改简历 / 打印版** | `public/resume.html` / `public/resume-print.html` | 还是纯 HTML（没重构成 React）。改完直接在浏览器里打印 → 存 PDF |
| **页脚那行字** | `src/components/Footer.tsx` | 年份 `new Date().getFullYear()` 自动算 |

### 加一块新区块（四步）

以「加一个『创意』区块」为例：

1. **数据**：`src/data/site.tsx` 里加一个数组，例如 `export const creativeWorks = [ … ]`
2. **组件**：`src/components/Creative.tsx` 新建（**最省事的办法是复制 `About.tsx` 再改**）：
   ```tsx
   import Section from './Section'
   import { creativeWorks } from '../data/site'

   export default function Creative() {
     return (
       <Section id="creative" num="05" title="创意">
         {creativeWorks.map((w) => (
           <div key={w.title}>{w.title}</div>
         ))}
       </Section>
     )
   }
   ```
3. **挂上去**：`src/App.tsx` 里 import 并插到想放的位置（比如 `<Notes />` 后面）
4. **可选**：`navLinks` 里加 `{ label: '创意', href: '#creative' }`；注意 `Section` 的 `num` 编号要跟顺序对上

## 5. 方法讲解格（这次用到的每个写法）

### 5.1 组件：一个返回 JSX 的函数

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `export default function Nav() { return <nav/> }` | **定义一个组件** | 首字母**必须大写**（小写会被当成 HTML 标签）；`export default` 是为了别处 `import Nav from './Nav'` |
| `<Nav />` | **使用组件** | 像 HTML 标签一样写；自闭合要带 `/` |
| `return ( … )` | 返回这段界面长什么样 | 只能返回**一个**根节点；要并列好几个就套 `<></>` |

> **为什么用它**：v1 里「导航栏」是一段 HTML 复制到 6 个页面里；组件化之后是**一处定义、多处使用**，改一次全站生效。代价是要理解「组件是函数、会被反复调用」—— 所以组件里不能写「只该发生一次」的东西。

### 5.2 props：组件之间传参

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `function Card({ title, body }: CardProps)` | 接收参数（**解构**写法） | props 是一个对象，是组件的唯一入参；**只读**，别在组件里改它 |
| `<Card title="x" body="y" />` | 传参 | 字符串可以直接写；数字 / 布尔 / 对象 / 数组要用花括号：`num={1}` `alt` `items={arr}` |
| `interface CardProps { … }` | 给参数定类型 | 有了它，写错字段名或漏传必填项，`tsc` 立刻报错 |

> **为什么用它**：`Section` 就是这样变成通用件的 —— 四个区块把 `id / num / title / lead / alt` 传进去，外壳只写一次。

### 5.3 children：往组件里塞内容

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `<Section …>{这里的东西}</Section>` | 夹在标签中间的内容会作为 `children` 传进去 | `children` 也是一个 props，只是位置特殊 |
| `children: ReactNode` | 它的类型 | `ReactNode` = 「任何能显示的东西」：字符串、JSX、数组、`null` |
| `{children}` | 把它渲染出来 | 通常放在标题下面 |

> **为什么用它**：这就是 `Section` 能包住任意内容的原因 —— 外壳负责「编号 + 标题 + 内边距」，包在里头的卡片归调用方决定。

### 5.4 列表渲染：把数组变成一串界面

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `{projects.map((p) => <div>…</div>)}` | 数组 → 一串 JSX | `map` 是**普通 JS 方法**，返回一个新数组；React 会把数组原样渲染 |
| `key={p.title}` | 每条的唯一身份证 | React 靠它认「谁是谁」（增删时才知道该复用还是重建）。用 **title / href** 这种稳定唯一的值，**别用下标** |
| `p.points.map((x) => <li key={x}>{x}</li>)` | 嵌套列表也一样 | 每一层的 `key` 只要在**同一层内**唯一就行 |

> **为什么用它**：加项目从「复制 20 多行 HTML 再手改」变成「往数组里加一个对象」。这是整个重构收益最大的一处。
> 用下标当 key 的坑：在列表**中间**插入一条时，React 会以为「最后一条被删了、新的插到中间」，导致输入框内容错位之类的怪现象。

### 5.5 条件渲染

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `{lead && <p>{lead}</p>}` | **有才渲染** | 见下面的坑 |
| `{action.primary ? 'btn-primary' : 'btn-ghost'}` | 二选一 | 三元运算符，用来切换类名很常见 |
| `{false}` / `{null}` / `{undefined}` | 什么都不渲染 | React 直接忽略，不报错、不占位 |

> **坑**：`&&` 左边如果可能是数字 `0`，`0 && <X/>` 的结果就是 `0`，React 会把 `0` **画到界面上**。判断数组非空要写 `items.length > 0 && …`，别写 `items.length && …`。

### 5.6 useState：让组件「记住」会变的东西

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `const [menuOpen, setMenuOpen] = useState(false)` | 声明一份组件的状态，初值 `false` | 返回两元组：**当前值** + **改它的函数**；`[x, setX]` 是惯例命名 |
| `setMenuOpen(!menuOpen)` | 改这份状态 | 调用后 React 会**重新执行整个组件函数**，用新值重算界面 |
| `menuOpen = true` | ❌ 不行 | 那只是改了普通变量，React 不知道，界面不会变 |

> **为什么用它**：v1 里「菜单开没开」存在 **DOM** 上（给 `<ul>` 加 `.open` 类，CSS 管显隐）；React 里状态归**组件**管。方向反了：v1 是「点按钮 → 改 DOM」，React 是「点按钮 → 改状态 → 重渲染 → DOM 自己变对」。**所以 React 里基本不手动操作 DOM**（`Reveal` 是唯一的例外，它只是加个类名）。

### 5.7 useEffect：渲染之外要做的事（+ 清理函数）

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `useEffect(() => { … }, [])` | 挂载后执行一次 | 空依赖数组 = **不依赖任何会变的值** → 只跑一次 |
| `return () => window.removeEventListener(…)` | **清理函数** | 组件卸载时自动执行；少了它，每次挂载都会多挂一个监听器 |
| `useEffect(() => { … })`（不写依赖） | 每次渲染后都跑 | 很少这么用 |
| `useEffect(() => { … }, [x])` | `x` 变了才跑 | 常见漏写依赖导致「用了旧值」 |

> **为什么必须写清理**：`Nav` 往 `window` 上挂了 `scroll` 监听，这是「组件之外的东西」—— 组件走了，监听器不会自己走，它还会指着已经销毁的组件改状态。
> **怎么验证你写对了**：`main.tsx` 里套了 `<StrictMode>`，开发期它**故意**把副作用挂载两遍（挂 → 清 → 再挂）。如果清理函数写漏了，你会看到行为变成双份 —— 这就是 StrictMode 存在的意义。生产构建里只有一遍。

### 5.8 useRef：拿到真实 DOM 节点的「盒子」

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `const ref = useRef<HTMLDivElement>(null)` | 声明一个引用盒子 | 泛型写节点类型；初值给 `null` |
| `<div ref={ref}>` | 绑到某个元素上 | 组件挂载后，`ref.current` 就是那个真实 DOM 节点 |
| 改 `ref.current` | 不会触发重新渲染 | 这正是 `Reveal` 要的：它只需给元素加个类名，不需要重渲染 |

> **为什么不用 useState 存这个节点**：存 DOM 节点本身不改变「界面该长什么样」，用 state 会白白触发一次重渲染（还可能死循环）。

### 5.9 Fragment、className、style

| 写法 | 作用 | 参数 / 细节 |
|---|---|---|
| `<>{a}{b}</>` | 把多个兄弟节点打包成一个返回值，**不生成多余 DOM** | 完整写法 `<React.Fragment>`，`<>` 是简写 |
| `className="nav card"` | 写 CSS 类 | **必须叫 `className`**，不能用 `class`（`class` 是 JS 保留字） |
| `style={{ maxWidth: '46em' }}` | 内联样式 | 收的是**对象**不是字符串 → 所以是两层花括号；属性名驼峰（`maxWidth` 不是 `max-width`） |
| `{...(cond ? { target: '_blank' } : {})}` | 按条件加属性 | 展开空对象 = 什么都不加（`Contact.tsx` 用它区分站内/站外链接） |

## 6. 坑与约定

| 现象 / 约定 | 说明 |
|---|---|
| 组件名首字母大写 | 小写会被当成 HTML 标签，静默失效 |
| 类型导入要写 `import type { X } from '…'` | tsconfig 开了 `verbatimModuleSyntax`。写成普通 `import` 会报 **TS1484**（它在打包时才能省掉这行，所以要你明说「这是类型」） |
| 开发期组件会渲染两遍 | `StrictMode` 故意的，见 5.7 |
| `public/` 和 `src/` 的区别 | **`public/`** ＝ 原样拷进 `dist/`，URL 就是文件名（简历页、笔记页、PDF 在这）→ 不会被处理、也不能被 `import`；**`src/`** ＝ 会被 Vite 处理、文件名带 hash（`index-CA8VisTt.js`）→ 改了自动刷新靠它 |
| 搜文案别搜 `index.html` | 那里面没有正文；正文在 `src/data/site.tsx` |
| 怎么读报错 | `src/components/Nav.tsx(42,7): error TS2322: …` = 文件 + 第 42 行第 7 列 + 错误码。`npm run build` **先跑 tsc**，类型不过就不会打包 |
| 新建文件后要 import | 忘了 import 组件 → `TS2304: Cannot find name` |
| 别提交 `dist/` | 构建产物，已在 `.gitignore`；提交的是源码 |
| `git` 报 `LF will be replaced by CRLF` | Windows 上的正常行为（`core.autocrlf`），不用管；它只影响换行符，不影响内容 |

## 7. 下一步（可选，按价值排序）

1. **把线上切到 React 版**（现在没切，线上还是 v1）
   - 前置：本地 `main` 快进到 `react-refactor`
   - 两条路：**① GitHub Actions**（推荐；源库只存源码。需要你去 repo `Settings → Pages → Source` 改成 "GitHub Actions"）**② 构建产物提交到 `docs/`**（零设置，但 `dist` 进 git 历史）
   - ⚠️ 用户站的 Pages 源现在是 **`main` 分支根目录**，切之前先确认新产物路径对得上
2. **简历页也组件化 + 上路由**（`react-router`）：练「多页面应用」；注意 GitHub Pages 直接刷新子路径会 404，要配 404.html 兜底或改用 hash 路由
3. **笔记 Markdown 管线**：笔记从 `.md` 生成页面，不用再手写 HTML（4 篇已发，正好当样本）
4. **练表单 + 受控组件**：加一个「创意/作品」区块或留言板（v1 删掉的那块设计还在 `public/legacy-v1.css` 里）

## 8. 拿到团队官网仓库后，对照着看这几件事

这条线本来就是为 FDE X 官网（React 项目）做准备的，这份重构是「同一类问题的缩小版」。拿到他们的仓库后按这张表过一遍：

| 看什么 | 为什么 | 我这边的对照物 |
|---|---|---|
| 包管理器 + lockfile（npm / pnpm / yarn） | 决定你怎么装依赖、命令怎么写 | 我用 npm |
| 构建工具（Vite / Next / CRA） | Next 有服务端渲染，心智模型跟这套不一样 | 我用 Vite 纯客户端 |
| 目录结构（`src/pages` vs 文件路由、组件放哪） | 决定新文件该放哪 | 我的 `src/components` + `src/data` |
| 路由方案 | 「老板发问题 → 出拆解」是多页面还是单页 | 我暂时只有单页 |
| 状态管理（useState / Context / zustand / redux） | 拆解结果这种跨组件数据怎么传 | 我只用了 `useState`，两个人用 |
| 样式方案（纯 CSS / CSS Modules / Tailwind） | 我最不熟 Tailwind，看到要专门补 | 我用纯 CSS |
| TS 配置（`strict`？路径别名 `@/`？） | 决定写代码时的严格程度 | 我开了 `strict` |
| 部署方式（静态托管 / Vercel / 需要后端） | 若网站要接 LLM，**API key 放哪是安全问题**（绝不能进前端包） | 我没接后端 |

### 回填：逐个对照的结果（2026-09-29，真拿到仓库之后）

| 看什么 | fde-x-web 的答案 | 结论 |
|---|---|---|
| 包管理器 | **npm**（README 写 npm；仓库里那份 `pnpm-lock.yaml` 是残留 —— 实测 `npm install` 不动 `package-lock.json`） | 一致 ✅ |
| 构建工具 | Vite 5 + `vite-plugin-singlefile` | 同类；**「单文件」这点值得抄**（见 §10） |
| 目录结构 | 按**业务面**分：`pages/ components/ form/ demand/ admin/ api/ hooks/ ui/` | 它是被「一个 SPA 三副面孔」逼出来的；我只有单页，现有分法够用 |
| 路由方案 | 手写 **hash 路由**（82 行、零依赖），8 条路径 + 兜底回首页 | 我现在不需要；将来把笔记收进 SPA 时可参考 |
| 状态管理 | 纯 `useState` + props 下传，**没有状态库** | 一致 ✅ —— 它那么大都没上 redux/zustand |
| 样式方案 | 纯 CSS 分文件 + **作用域类名**隔离（`.fdex-form-scope` / `.fdex-admin`） | 同类；我段落多了可以学这招 |
| TS 配置 | **它是纯 JS，一个 TS 都没用** | ⚠️ **我比它严格**（我开了 `strict`） |
| 部署方式 | 静态 `dist/` **手动上传，仓库没有 CI** | ⚠️ 它的痛处；我用 GitHub Pages + Actions 能绕开 |

**两个反直觉的发现**：

1. **它不是处处更"先进"** —— 没有 TS、没有 CI，每次上线靠人手传文件（2026-09-29 那天官网就因为"合并了但没人部署"而没上线）。
2. **真正值得搬的只有「单文件构建」这一件**（§10）。其余机制（请求层两半共用、一处组件两处渲染、`revision`/`businessVersion` 双版本号、后台令牌闸门）都是被它那个「有后端 + 一份记录两个入口」的场景逼出来的，我这里没有对应问题，硬抄就是过度工程。

## 9. 验证记录（2026-09-26 真跑过）

| 验证 | 命令 | 结果 |
|---|---|---|
| 类型检查 | `tsc --noEmit` | 退出码 0（先报过 TS2882「不认 .css 导入」，补 `src/vite-env.d.ts` 后过） |
| 生产构建 | `npm run build` | `✓ 26 modules transformed`；`dist/index.html` 0.92 kB + `index-*.css` 6.90 kB + `index-*.js` 229.02 kB（gzip 73 kB） |
| 开发服务器 | `vite --port 5177` | `/`、`/resume.html`、`/note-eeg-pitfalls.html`、`/legacy-v1.css`、`/v1-index.html`、`/src/main.tsx` **全部 200** |
| 打包预览 | `vite preview --port 5178` | 同上四个 URL 全部 200 |
| 内容没搬丢（源码层） | python 比对 `public/v1-index.html` 的可见文本 vs `src/` 源码 | 56 条文本片段，49 条逐字命中；7 条未命中全部是有意改动（`↗` 由组件拼、页脚改文案） |
| **真的渲染出来了** | `tsc` 编译成 CommonJS → `react-dom/server` 渲染 `<App />` | 产出 **5389 字节** HTML，nav / hero / 四个 section / footer 结构完整，`<strong>` 加粗、多行副标题、`target="_blank"` 都正确 |
| **内容 1:1 对得上** | python 比对 `public/v1-index.html` 与渲染结果的可见文本 | **v1 56 条 / React 渲染 56 条**；唯一差异是页脚那句有意改的文案（见上表首行） |

> 为什么用 `react-dom/server` 而不是开浏览器看：headless Edge 在 DSH 文件沙箱里起不来（`Access is denied`，crashpad 被拦），而 `react-dom/server` 跑的是**同一套组件代码**，能在纯 Node 里证明「组件渲染出的 DOM 是对的」。
> 它唯一不覆盖的是 `useEffect`（服务端渲染不执行副作用）—— 所以滚动阴影、移动端菜单、渐入动画这三处**还得你自己在浏览器里点一下**确认。

## 10. 单文件构建（2026-09-29）

**目标**：让 `dist/` 里只剩一个 `index.html` —— 部署不用再管 `assets/` 的路径，产物还能直接双击打开。

### 过程（有曲折，值得记）

| 试过什么 | 结果 |
|---|---|
| 装 `vite-plugin-singlefile@2.3.3`（团队官网同款） | ❌ 在 Vite 8 下**静默不生效**：构建跑完，产物里 JS/CSS 仍是独立文件 |
| 查它为什么不生效 | 它的 `peerDependencies` 写着支持 `vite ^8`，但 Vite 8 换成了 **rolldown**（Rust 内核），插件的钩子没被调用 |
| 换 Vite 7（rollup 内核）验证 | ⚠️ `npm` 直接拦下：`@vitejs/plugin-react@6` 硬性要求 `vite ^8`。为这个往回退一整代不划算 |
| **改成自己写内联脚本** | ✅ **成功** —— `scripts/inline-build.mjs`，约 80 行 |

### 最终方案

```
npm run build
├─ tsc --noEmit                      类型检查
├─ vite build                        产出 index.html + assets/
└─ node scripts/inline-build.mjs     把 JS/CSS 内联进 index.html，并删掉已内联的 assets 文件
```

### 实测结果

| 项 | 值 |
|---|---|
| 内联前 | `index.html` 0.9 KB + `assets/index-*.js` 223.7 KB + `assets/index-*.css` 6.7 KB |
| 内联后 | **`index.html` 231.2 KB**（正好等于三者之和），`assets/` 空了 |
| `public/` 的东西 | 简历 PDF、四篇笔记 HTML、`legacy-v1.css`、`v1-index.html`、`script.js` —— **一个没少** |
| **双击能打开** | ✅ 用 headless Edge 以 `file://` 协议打开 `dist/index.html`，页面与样式**完整渲染**，不依赖任何服务器 |

### 代价（要知道）

单文件 = 请求数 1，但**没有缓存粒度**：以后改一个字，浏览器要重下整个 230 KB。个人主页流量小、改动不频繁，划算；但**大的作品图不要内联** —— 放进 `public/` 让它作为独立文件存在。

### ⚠️ 一个本机现象（不是项目问题）

在 DSH 的运行环境里，`vite build` 会以 **`0xC0000409`** 崩溃（Vite 8 的 rolldown 是 Rust native 内核），**但产物是完整写出的** —— 所以后面那步 `node scripts/inline-build.mjs` 照样跑通。

判定依据：① **完全原版的配置**（不带任何本次改动）也一样崩；② 复制到纯 ASCII 路径也一样崩 ⇒ **与中文路径、与本次改动都无关**。

**如果你在自己的终端跑 `npm run build` 是正常退出 0，就不用理会这条。**

## 相关

- 线卡：[[个人网站]]
- 入口笔记：[[大三上/个人网站/README|个人网站]]
- 术语人话定义：`术语表/00_术语表.md` → 「前端 / React」节
