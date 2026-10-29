// 全站“内容”的唯一来源。
//
// 组件负责怎么显示（布局、样式、交互），这个文件负责显示什么（文案、条目）。
// 所以改文案、加项目、加笔记，都只动这一个文件，不用碰任何 .tsx 组件。
//
// 示例：加一个项目 = 往下面的 projects 数组里再写一个 { ... }，保存即可。
// 详见同目录上层的《React重构说明.md》第 4 节“增删改查速查”。

// ReactNode = 任何能渲染的值：字符串、数字、JSX 片段、它们组成的数组。
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

/** “关于我”区块的一张卡片 */
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
  /** 标题下面那几行，一行一个字符串（换行由组件渲染，不靠 CSS） */
  subLines: [
    '计算机科学专业，在 BCMI 实验室做 EEG 数据处理。',
    '现在一边补深度学习，一边用 AI 写点自己想用的工具。',
    '喜欢把东西做出来，也喜欢把做明白的事讲清楚。',
  ],
  actions: [
    { label: '看看我的项目', href: '#projects', primary: true },
    { label: '了解更多', href: '#about' },
  ] as Action[],
  meta: ['📍 中国', '🎓 CS + BCI', '✍️ 笔记常写'],
}

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
        AI 能写掉大部分样板代码之后，工程师还剩下什么。我目前的答案是：
        <strong>知道要做什么，并且能亲手把它做出来</strong>。
      </>
    ),
  },
  {
    title: '我热爱的事',
    body: '把没有的东西做出来，把没想明白的事想明白。',
  },
]

/** 项目卡片。加项目就往这里追加一项。 */
export const projects: Project[] = [
  {
    tag: 'AI Agent',
    title: '从零实现的终端 Coding Agent',
    desc: '用 C 写的终端 coding agent，核心约 2.3k 行：ReAct 主循环、工具注册表、并行工具调度，以及两套可切换的上下文管理策略。',
    points: [
      '上下文管理两套策略：摘要压缩（省 token 但丢细节）vs 卸载到外部文件（保留原文但多一次 I/O）',
      '七个工具 + 注册表统一接口与参数 schema；CUnit 单元测试 + 端到端评测',
    ],
    links: [
      { label: 'Coding Agent', href: 'https://github.com/xiaoqing-t/Project2-of-OS-2026-Fall' },
      { label: 'Shell / HTTP / 线程池', href: 'https://github.com/xiaoqing-t/Project1-of-OS-2026-fall' },
    ],
  },
  {
    tag: 'Computer Architecture',
    title: 'MIPS 单周期 CPU',
    desc: '用 Verilog 写一个能跑的 MIPS 单周期 CPU：ALU、控制单元、寄存器堆、数据通路到顶层集成，综合后下载到 FPGA 上跑通。',
    points: ['ALU → 寄存器堆 → 数据通路 → 顶层集成', '610 行 RTL + 7 个 testbench，已综合出比特流'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/CPU-by-vivado' }],
  },
  {
    tag: 'BCI · EEG',
    title: '多模态生理信号预处理 Pipeline',
    desc: 'EEG / ECG / EOG 的批量预处理管线：先 QC 再预处理，配置文件驱动，结果写 HDF5。已经打包成一个可复用的 skill。',
    points: ['先 QC 再预处理，保证数据质量', '配置驱动 · 可复现 · 多通道分 H5'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/EEG-preprocess-pipeline-skill' }],
  },
  {
    tag: 'Deep Learning',
    title: 'CS231n 深度学习',
    desc: '手写 CNN 的 forward / backward、损失函数和训练循环，不调框架。',
    points: ['线性分类器 → 全连接网络 → CNN', '和 BCI 里的信号表示学习互相印证'],
    links: [{ label: '查看仓库', href: 'https://github.com/xiaoqing-t/CS231n-assignments' }],
  },
]

/** 学习笔记列表。加一篇笔记就往这里追加一项（页面记得放 public/ 里）。 */
export const notes: Note[] = [
  {
    category: '科研方法论',
    title: '复现一篇论文的基本功',
    desc: '读论文分三层、一张只写证据的 Paper Card，加上五条实验纪律。这套流程我一直在用。',
    meta: '方法论 · 全文',
    href: 'note-reproduction-basics.html',
  },
  {
    category: '脑机接口',
    title: 'EEG 预处理的那些坑',
    desc: '单位、参考电极、坏道、滤波边界——几百小时批处理里踩过的坑，整理成一张排查表。',
    meta: '经验 · 全文',
    href: 'note-eeg-pitfalls.html',
  },
  {
    category: '工程实践',
    title: 'Claude Code 1M 上下文配置实录',
    desc: '把自动压缩的阈值从 200K 推到接近 1M，记一次完整的排查：现象、怀疑、验证、结论。',
    meta: '2026-09-16 · 已验证',
    href: 'note-claude-code-1m.html',
  },
  {
    category: '工程实践',
    title: 'Agent Skill 框架架构五问',
    desc: '契约怎么设计才稳、声明和驱动为什么要分开、契约能不能当测试用——五个问题和我现在的答案。',
    meta: '2026-09 · 五问全解',
    href: 'note-agent-skill-architecture.html',
  },
  {
    category: '系统虚拟化',
    title: '启动流程对比图：QEMU 带固件 vs StratoVirt 无固件',
    desc: '两条泳道按同一阶段对齐，StratoVirt 上空出来的那一格，就是它省下的 3.3 秒。带分步讲解，可缩放。',
    meta: '2026-10 · 交互图',
    href: 'note-stratovirt-boot-flow.html',
  },
  {
    category: '系统虚拟化',
    title: 'Epoll 事件流图：一次客户机 I/O 怎么走完一圈',
    desc: '客户机敲门、内核回调、VMM 醒来、再通知客户机。四个角色，九条消息，一条一条走。',
    meta: '2026-10 · 交互图',
    href: 'note-epoll-event-flow.html',
  },
]

/** 联系区 */
export const contact = {
  lead: '想聊技术、科研或者别的什么，都可以找我。',
  links: [
    { label: 'GitHub', href: profile.github },
    { label: '查看简历', href: 'resume.html' },
  ],
}

