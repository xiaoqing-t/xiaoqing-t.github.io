// 全站“内容”的唯一来源。
//
// 组件负责怎么显示（布局、样式、交互），这个文件负责显示什么（文案、条目）。
// 所以改文案、加项目，都只动这一个文件，不用碰任何 .tsx 组件。
//
// 唯一例外是笔记：它们的书目结构在 public/notes.json，
// 因为笔记页（静态 HTML）的侧边栏也在运行时读同一份数据。加一篇笔记改那里。
//
// 示例：加一个项目 = 往下面的 projects 数组里再写一个 { ... }，保存即可。
// 详见同目录上层的《React重构说明.md》第 4 节“增删改查速查”。

// ReactNode = 任何能渲染的值：字符串、数字、JSX 片段、它们组成的数组。
// 只有需要局部加粗的文案才用得上它（见 aboutCards 第 2 条）。
import type { ReactNode } from 'react'

import notesData from '../../public/notes.json'

/** 一个链接：按钮、导航项、项目底部的外链都用它 */
export interface Link {
  label: string
  href: string
}

/** 导航项：比普通链接多一个 cta（是不是右上角那个描边按钮） */
export interface NavLink extends Link {
  cta?: boolean
}

/** 首屏按钮：比普通链接多一个 primary（是不是蓝色实心那颗） */
export interface Action extends Link {
  primary?: boolean
}

/** “关于我”区块的一张卡片 */
export interface AboutCard {
  title: string
  body: ReactNode
}

/** 作品卡的视觉预览类型：每种对应一段原创 SVG/CSS 画面（不是截图） */
export type PreviewKind = 'agent' | 'cpu' | 'eeg' | 'dl'

/** 一张作品卡 + 展开后的详情 */
export interface Project {
  /** 类别小标签，如 "AI AGENT"（等宽字体展示） */
  tag: string
  title: string
  /** 卡片右下角的真实技术指标（代替模板里的年份，不编造日期） */
  metric: string
  /** 决定用哪段预览画面 */
  preview: PreviewKind
  /** 一句话简介 */
  desc: string
  /** 展开详情：背景 */
  background: string
  /** 展开详情：我做了什么（职责） */
  responsibilities: string[]
  /** 展开详情：结果 */
  outcomes: string[]
  /** 底部外链按钮 */
  links: Link[]
}

/** 一篇学习笔记 */
export interface Note {
  title: string
  desc: string
  /** 右下角那行小字，如 "2026-10 · 推导" */
  meta: string
  /** 笔记页地址（静态页放在 public/ 里，所以直接写文件名） */
  href: string
}

/** 一本书：同一主题下按阅读顺序排好的若干篇笔记 */
export interface Book {
  id: string
  title: string
  /** 书下面那行小字，说明这本书在讲什么 */
  tagline: string
  notes: Note[]
}

/** 右侧“路径”时间线的一条 */
export interface TimelineEntry {
  period: string
  title: string
  role: string
  /** 当前进行中（实心圆点） */
  current?: boolean
}

/** 右侧“能力”标签；core 为真 = 实心深色 */
export interface Capability {
  label: string
  core?: boolean
}

/** 站点级信息 */
export const profile = {
  name: 'Zhao Yunzhe',
  shortName: 'ZY',
  email: 'zyz.sjtu@sjtu.edu.cn',
  github: 'https://github.com/xiaoqing-t',
  /** 导航里姓名后面那行小字 */
  tagline: 'CS × BCI · 上海交大',
}

/** 导航栏。href 以 # 开头 = 跳到本页某个区块；不带 # = 跳到另一个页面 */
export const navLinks: NavLink[] = [
  { label: '作品', href: '#work' },
  { label: '笔记', href: '#notes' },
  { label: '现在', href: 'now.html' },
  { label: '关于', href: '#about' },
  { label: '简历', href: 'resume.html', cta: true },
]

/** 首屏大标题区 */
export const hero = {
  eyebrow: 'CS · BCI · BUILDING THINGS',
  /** 标题拆成三段，中间那段用衬线斜体 + 棕色（.accent） */
  titleLead: '欢迎来到 ',
  titleAccent: 'Zyz 的主页',
  titleTail: '。',
  subLines: [
    '计算机科学专业，在 BCMI 实验室做 EEG 数据处理。',
    '一边补深度学习，一边用 AI 写自己想用的工具。',
    '做东西、想问题，是我最投入的两件事。',
  ],
  actions: [
    { label: '看看作品', href: '#work', primary: true },
    { label: '了解更多', href: '#about' },
  ] as Action[],
}

/** 首屏右栏：关注 / 现在 / 荣誉（全部真实，不编造背书） */
export const focus = {
  focus: '脑机接口（EEG 信号处理）× 深度学习；在 LLM/agent 时代重建编码基本功。',
  currently: 'BCMI 实验室做 EEG 数据预处理 · 在修 CS231n / 机器学习。',
  honors: ['致远荣誉奖学金 ×2', '永强班 · 致远荣誉计划'],
}

/** 右侧“路径”时间线（来自简历，日期真实；最近的在最上面） */
export const timeline: TimelineEntry[] = [
  { period: '2026.03 — 至今', title: 'BCMI 实验室', role: 'EEG 多模态数据预处理管线', current: true },
  { period: '2026 秋', title: '操作系统课程设计', role: 'Shell / HTTP / 线程池 → Coding Agent' },
  { period: '2026 · 在修', title: 'CS231n 深度学习', role: '手写 CNN 的 forward / backward' },
  { period: '2024 — 2028 预计', title: '上海交通大学', role: '计算机科学 · 永强班 · 致远荣誉计划' },
]

/** 右侧“能力”标签（来自简历技能清单） */
export const capabilities: Capability[] = [
  { label: 'Python', core: true },
  { label: 'C / C++', core: true },
  { label: 'EEG 预处理', core: true },
  { label: '深度学习', core: true },
  { label: 'PyTorch' },
  { label: 'NumPy · MNE' },
  { label: 'Verilog · Vivado' },
  { label: 'React · TS' },
  { label: 'Git · Linux' },
]

/** “关于我”区块的三张卡 */
export const aboutCards: AboutCard[] = [
  {
    title: '我在做什么',
    body: '计算机专业，在 BCMI 实验室做 EEG 数据的采集和预处理。同时在学 CS231n，作业的 numpy 实现都是自己手写，不调框架。',
  },
  {
    title: '我关心的问题',
    // 这一条需要局部加粗，所以正文写成 JSX 片段而不是纯字符串
    body: (
      <>
        AI 能写掉大部分样板代码之后，工程师还剩下什么。我现在的答案落在
        <strong>设计</strong>上：把项目结构定清楚，让代码保持干净。
      </>
    ),
  },
  {
    title: '我热爱的事',
    body: '做东西能知道为什么，想问题愿意花时间，想清楚一件事很开心。',
  },
]

/** 作品卡。加项目就往这里追加一项。 */
export const projects: Project[] = [
  {
    tag: 'AI AGENT',
    title: '终端 Coding Agent',
    metric: 'C · 2.3k 行',
    preview: 'agent',
    desc: '用 C 从零写的终端 coding agent：ReAct 主循环、工具注册表、并行工具调度，以及两套可切换的上下文管理策略。',
    background:
      '操作系统课程设计的延伸——想弄清“AI 写掉样板代码之后，工程师还剩什么”，于是用 C 从零搭一个能自己选工具、跑命令的终端 agent。',
    responsibilities: [
      'ReAct 主循环 + LLM 客户端（HTTP / JSON 协议解析），驱动逐轮的工具选择与执行',
      'dispatch-table 式工具注册表：统一 bash / read / write / edit / skill 的接口、参数 schema、只读标记与输出上限',
      '两套可切换上下文策略：摘要压缩（省 token 丢细节）vs 卸载到外部文件（留原文多一次 I/O）',
      'CUnit 单元测试 + 端到端评测，覆盖卸载 / 摘要 / 执行器三个模块',
    ],
    outcomes: [
      '自研核心约 2.3k 行，支持单轮返回多个工具调用并并发调度',
      '执行底座来自课设的 shell / HTTP 客户端 / 线程池，用 ThreadSanitizer 验证并发正确性',
    ],
    links: [
      { label: 'Coding Agent', href: 'https://github.com/xiaoqing-t/Project2-of-OS-2026-Fall' },
      { label: 'Shell / HTTP / 线程池', href: 'https://github.com/xiaoqing-t/Project1-of-OS-2026-fall' },
    ],
  },
  {
    tag: 'ARCHITECTURE',
    title: 'MIPS 单周期 CPU',
    metric: '610 行 RTL',
    preview: 'cpu',
    desc: '用 Verilog 写一个能跑的 MIPS 单周期 CPU：ALU、控制单元、寄存器堆、数据通路到顶层集成，综合后下载到 FPGA 跑通。',
    background: '计算机系统结构课，想把“一条指令怎么在硬件里跑完”从头搭一遍，而不是停在框图上。',
    responsibilities: [
      '用 Verilog 实现 ALU、控制单元、寄存器堆、数据通路',
      '顶层集成各模块，连成完整的单周期数据通路',
      '写 7 个 testbench，覆盖各模块与整机',
    ],
    outcomes: ['610 行 RTL，完成仿真并综合出比特流，下载到 FPGA 上跑通'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/CPU-by-vivado' }],
  },
  {
    tag: 'BCI · EEG',
    title: '多模态信号预处理 Pipeline',
    metric: '380+ 小时',
    preview: 'eeg',
    desc: 'EEG / ECG / EOG 的批量预处理管线：先 QC 再预处理，配置文件驱动，结果写 HDF5。已经打包成一个可复用的 skill。',
    background: 'BCMI 实验室里重复的预处理步骤太多，把它们沉淀成可复用、可复现的工具，避免无效预处理浪费算力。',
    responsibilities: [
      '配置驱动管线：先 QC（可复现随机段 QC 图 + 跨被试汇总报告）再预处理',
      '滤波 / 陷波 / 降采样 / z-score → 分通道写 HDF5',
      '沉淀单位换算、参考电极取舍、多通道数分文件合并等工程方案',
    ],
    outcomes: [
      '已应用 10+ 公开数据集、累计 380+ 小时多模态数据（ds004118 / ds005087 / ds005114 等）',
      '打包成可复用 skill 并开源',
    ],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/EEG-preprocess-pipeline-skill' }],
  },
  {
    tag: 'DEEP LEARNING',
    title: 'CS231n 深度学习',
    metric: '手写 CNN',
    preview: 'dl',
    desc: '手写 CNN 的 forward / backward、损失函数和训练循环，不调框架。',
    background: '补深度学习基本功，坚持不调框架、全部用 numpy 手写，把每个梯度都推清楚。',
    responsibilities: [
      '线性分类器 → 全连接网络 → 卷积神经网络，逐级手写',
      'forward / backward、损失函数与训练循环全部自己实现',
    ],
    outcomes: ['完成 CS231n 全套作业；和 BCI 里的信号表示学习互相印证'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/CS231n-assignments' }],
  },
]

/** 学习笔记：按书分组。增删改都在 public/notes.json 里做。 */
export const books: Book[] = notesData.books

/** 联系区 */
export const contact = {
  lead: '想聊技术、科研，或者别的什么，都可以找我。',
  /** 状态徽章（求职意向：深度学习 / AI 工程实习生） */
  status: '开放实习 · 2026',
  links: [
    { label: 'GitHub', href: profile.github },
    { label: '查看简历', href: 'resume.html' },
  ],
}

