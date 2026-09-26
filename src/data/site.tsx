// 全站「内容」的唯一来源。
//
// 组件负责「怎么显示」（布局、样式、交互），这个文件负责「显示什么」（文案、条目）。
// 所以改文案、加项目、加笔记 —— 都只动这一个文件，不用碰任何 .tsx 组件。
//
// 示例：加一个项目 = 往下面的 projects 数组里再写一个 { ... }，保存即可。
// 详见同目录上层的《React重构说明.md》第 4 节「增删改查速查」。

// ReactNode = 「任何能显示的东西」：字符串、数字、JSX 片段、它们组成的数组都算。
// 只有需要局部加粗的文案才用得上它（见 aboutCards 第 2 条）。
import type { ReactNode } from 'react'

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

/** 「关于我」里的一张卡片 */
export interface AboutCard {
  title: string
  body: ReactNode
}

/** 一张项目卡片 */
export interface Project {
  /** 左上角的小标签，如 "AI Agent" */
  tag: string
  title: string
  /** 一段话介绍 */
  desc: string
  /** 下方要点列表，一行一条 */
  points: string[]
  /** 底部外链按钮，可以 0 个、1 个、多个 */
  links: Link[]
}

/** 一篇学习笔记 */
export interface Note {
  /** 分类小字，如 "科研方法论" */
  category: string
  title: string
  desc: string
  /** 右下角那行小字，如 "方法论 · 全文" */
  meta: string
  /** 笔记页地址（静态页放在 public/ 里，所以直接写文件名） */
  href: string
}

/** 站点级信息：名字、邮箱、GitHub */
export const profile = {
  name: 'Zhao Yunzhe',
  shortName: 'ZY',
  email: 'zyz.sjtu@sjtu.edu.cn',
  github: 'https://github.com/xiaoqing-t',
}

/** 导航栏。href 以 # 开头 = 跳到本页某个区块；不带 # = 跳到另一个页面 */
export const navLinks: NavLink[] = [
  { label: '关于', href: '#about' },
  { label: '项目', href: '#projects' },
  { label: '笔记', href: '#notes' },
  { label: '简历', href: 'resume.html' },
  { label: '联系我', href: '#contact', cta: true },
]

/** 首屏大标题区 */
export const hero = {
  eyebrow: 'CS · BCI · Building things',
  /** 标题被拆成三段，中间那段上色（`.accent` 类） */
  titleLead: '你好,我是',
  titleAccent: 'Zhao Yunzhe',
  titleTail: '。',
  /** 里面用 \n 换行（CSS 那边开了 white-space: pre-line 才会真的换行） */
  sub: '计算机科学专业,在脑机接口(BCI)实验室做 EEG 数据处理。\n正在 LLM / agent 时代探索自己的道路\n喜欢做东西,也喜欢把想明白的东西讲清楚。',
  actions: [
    { label: '看看我的项目', href: '#projects', primary: true },
    { label: '了解更多', href: '#about' },
  ] as Action[],
  meta: ['📍 中国', '🎓 CS + BCI', '✍️ 学习笔记常写常新'],
}

/** 「关于我」三张卡 */
export const aboutCards: AboutCard[] = [
  {
    title: '我在做什么',
    body: '主修计算机科学,目前在 BCMI 实验室参与 EEG 数据的采集与预处理。正在系统学习深度学习基础(CS231n),目标是打通「算法理解 → 代码实现 → 领域应用」的完整链路。',
  },
  {
    title: '我关心的问题',
    // 这一条需要局部加粗，所以正文写成 JSX 片段而不是纯字符串
    body: (
      <>
        当 AI 能写大部分代码时,工程师真正的竞争力在哪里?我的答案是在于
        <strong>领域知识 + 亲手实现的能力</strong>。
      </>
    ),
  },
  {
    title: '我热爱的事',
    body: '创造与学习。无论是写代码、做设计,还是弄明白一个概念后把它讲给别人——这种「从无到有、从混沌到清晰」的过程最让我投入。',
  },
]

/** 项目卡片。加项目就往这里追加一项。 */
export const projects: Project[] = [
  {
    tag: 'AI Agent',
    title: '从零实现的终端 Coding Agent',
    desc: '用 C 从零实现一个终端 coding agent(自研核心约 2.3k 行):ReAct 主循环 + LLM 客户端、按 dispatch table 实现的工具注册表、并行工具调度,以及两套可切换的上下文管理策略。核心模块均为自己编写。',
    points: [
      '上下文管理两套策略:摘要压缩(省 token 但丢细节) vs 卸载到外部文件(保留原文但多一次 I/O)',
      '七个工具 + 注册表统一接口与参数 schema;CUnit 单元测试 + 端到端评测',
    ],
    links: [
      { label: 'Coding Agent', href: 'https://github.com/xiaoqing-t/Project2-of-OS-2026-Fall' },
      { label: 'Shell / HTTP / 线程池', href: 'https://github.com/xiaoqing-t/Project1-of-OS-2026-fall' },
    ],
  },
  {
    tag: 'Computer Architecture',
    title: 'MIPS 单周期 CPU',
    desc: '用 Verilog 从零实现一个可运行的 MIPS 单周期处理器:ALU、控制单元、寄存器堆、数据通路与顶层集成,并在 FPGA 上综合、仿真、下载。核心模块均为自己编写(AI 辅助)。',
    points: ['ALU → 寄存器堆 → 数据通路 → 顶层集成', '610 行 RTL + 7 个 testbench,已综合出比特流'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/CPU-by-vivado' }],
  },
  {
    tag: 'BCI · EEG',
    title: '多模态生理信号预处理 Pipeline',
    desc: 'EEG/ECG/EOG 多模态信号的配置驱动预处理管线:先 QC 再预处理、可复现 QC、HDF5 输出、按通道数分 H5。沉淀为可复用的 skill。',
    points: ['先 QC 再预处理,保证数据质量', '配置驱动 · 可复现 · 多通道分 H5'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/EEG-preprocess-pipeline-skill' }],
  },
  {
    tag: 'Deep Learning',
    title: 'CS231n 深度学习',
    desc: '从零实现 CNN 的 forward / backward、损失函数与训练循环。不借助 AI 逐行手写,以提升编码基本功与对深度学习的直觉。',
    points: ['线性分类器 → 全连接网络 → CNN', '与 BCI 的信号表示学习相互印证'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/CS231n-assignments' }],
  },
]

/** 学习笔记列表。加一篇笔记就往这里追加一项（页面记得放 public/ 里）。 */
export const notes: Note[] = [
  {
    category: '科研方法论',
    title: '复现一篇论文的基本功',
    desc: '三层读论文、证据约束 Paper Card、实验纪律五条:如何把一篇论文真正变成自己的能力。',
    meta: '方法论 · 全文',
    href: 'note-reproduction-basics.html',
  },
  {
    category: '脑机接口',
    title: 'EEG 预处理的那些坑',
    desc: '先 QC 再预处理、单位转换、参考电极:数百小时批量处理踩过的坑与排查表。',
    meta: '经验 · 全文',
    href: 'note-eeg-pitfalls.html',
  },
  {
    category: '工程实践',
    title: 'Claude Code 1M 上下文配置实录',
    desc: '一次完整的排查:让自动压缩阈值从 200K 提到接近 1M,含根因分析与踩坑表。',
    meta: '2026-09-16 · 已验证',
    href: 'note-claude-code-1m.html',
  },
  {
    category: '工程实践',
    title: 'Agent Skill 框架架构五问',
    desc: '契约与稳定性、声明与驱动分离、契约即测试、脚手架与增量:五个架构问题的思考。',
    meta: '2026-09 · 五问全解',
    href: 'note-agent-skill-architecture.html',
  },
]

/** 联系区 */
export const contact = {
  lead: '欢迎交流技术、科研与一切有趣的想法。',
  links: [
    { label: 'GitHub', href: profile.github },
    { label: '查看简历', href: 'resume.html' },
  ],
}

/** 页脚署名（年份由 Footer 组件自己算，不用写在这里） */
export const siteOwner = 'Zhao Yunzhe'
