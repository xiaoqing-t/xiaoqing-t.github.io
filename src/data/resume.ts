import { identity, jobSearch, metrics } from './facts'

export type Lang = 'zh' | 'en'

export interface Localized {
  zh: string
  en: string
}

export interface ResumeProject {
  title: Localized
  href: string
  bullets: Localized[]
}

export interface ResumeExperience {
  title: Localized
  date: Localized
  bullets: Localized[]
}

export interface ResumeContent {
  name: string
  role: Localized
  intro: Localized
  contact: {
    phone: string
    email: string
    githubLabel: string
    githubHref: string
  }
  nav: {
    back: Localized
    switchLabel: Localized
    print: Localized
  }
  headings: {
    education: Localized
    projects: Localized
    experience: Localized
    skills: Localized
  }
  education: {
    school: Localized
    date: Localized
    bullets: Localized[]
    honors: Localized[]
  }
  projects: ResumeProject[]
  experience: ResumeExperience[]
  skills: Localized[]
}

const l = (zh: string, en: string): Localized => ({ zh, en })

export const resume: ResumeContent = {
  name: identity.name,
  role: l(
    `计算机科学与技术 · 本科三年级 · 上海交通大学`,
    `Computer Science and Technology · Third-year undergraduate · Shanghai Jiao Tong University`,
  ),
  intro: l(
    `求职意向:${jobSearch.field}方向实习生`,
    `Seeking an internship in deep learning / AI engineering`,
  ),
  contact: {
    phone: '180-8004-9755',
    email: identity.email,
    githubLabel: 'github.com/xiaoqing-t',
    githubHref: identity.github,
  },
  nav: {
    back: l(`返回主页`, `Back to home`),
    switchLabel: l(`English`, `中文`),
    print: l(`打印 / 导出 PDF`, `Print / Save as PDF`),
  },
  headings: {
    education: l(`教育背景`, `Education`),
    projects: l(`项目经历`, `Projects`),
    experience: l(`实践经历`, `Experience`),
    skills: l(`专业技能`, `Skills`),
  },
  education: {
    school: l(
      `上海交通大学 · 计算机科学与技术(永强班 · 致远荣誉计划)`,
      `Shanghai Jiao Tong University · Computer Science and Technology (Yongqiang Class · Zhiyuan Honors Program)`,
    ),
    date: l(`2024.09 – 2028.06(预计)`, `Sep 2024 – Jun 2028 (expected)`),
    bullets: [
      l(
        `GPA <b>3.90 / 4.30</b>(均分 90.3),专业排名 <b>17 / 110</b>;核心专业课均在 90+。`,
        `GPA <b>3.90 / 4.30</b> (average 90.3), major rank <b>17 / 110</b>; all core courses scored 90+.`,
      ),
      l(
        `计算机科学中的数学基础 <span class="course-grade">100</span> · 计算机系统结构(A类) <span class="course-grade">98</span> · 计算机系统结构实验 <span class="course-grade">97</span> · 计算机组成 <span class="course-grade">96</span> · 现代操作系统(强化) <span class="course-grade">95</span> · 操作系统课程设计(强化) <span class="course-grade">94</span> · 算法与复杂性(强化) <span class="course-grade">91</span>`,
        `Mathematical Foundations of Computer Science <span class="course-grade">100</span> · Computer Architecture (Class A) <span class="course-grade">98</span> · Computer Architecture Lab <span class="course-grade">97</span> · Computer Organization <span class="course-grade">96</span> · Modern Operating Systems (Honors) <span class="course-grade">95</span> · Operating Systems Design (Honors) <span class="course-grade">94</span> · Algorithms and Complexity (Honors) <span class="course-grade">91</span>`,
      ),
    ],
    honors: [
      l(
        `致远荣誉奖学金(5000 元/年,<b>2024–2025、2025–2026 连续两年获评</b>)`,
        `Zhiyuan Honors Scholarship (RMB 5,000/year, <b>awarded in both 2024–2025 and 2025–2026</b>)`,
      ),
      l(
        `上海交通大学 C 等奖学金(2024–2025 学年)`,
        `Shanghai Jiao Tong University Class C Scholarship (2024–2025)`,
      ),
    ],
  },
  projects: [
    {
      title: l(
        `EEG/ECG/EOG 多模态生理信号预处理 Pipeline`,
        `Multimodal EEG/ECG/EOG Physiological Signal Preprocessing Pipeline`,
      ),
      href: 'https://github.com/xiaoqing-t/EEG-preprocess-pipeline-skill',
      bullets: [
        l(
          `设计并实现配置驱动的预处理管线:<b>先 QC 再预处理</b>(可复现随机段 QC 图 + 跨被试汇总报告)→ 滤波/陷波/降采样/z-score → HDF5,避免无效预处理浪费算力。`,
          `Designed and implemented a configuration-driven preprocessing pipeline: <b>QC before preprocessing</b> (reproducible random-segment QC plots + cross-subject summary reports) → filtering / notch / downsampling / z-scoring → HDF5, avoiding wasted compute on invalid preprocessing.`,
        ),
        l(
          `已应用于 <b>${metrics.eeg.datasets} 公开数据集、累计 ${metrics.eeg.hours} 小时</b>多模态数据(ds004118 / ds005087 / ds005114 等),沉淀单位换算、参考电极取舍、多通道数分文件合并等工程方案并<b>开源</b>。`,
          `Applied to <b>${metrics.eeg.datasets} public datasets and ${metrics.eeg.hours} hours</b> of multimodal data (ds004118 / ds005087 / ds005114, etc.); packaged engineering solutions for unit conversion, reference-electrode selection, and merging multi-channel split files, and <b>released them as open source</b>.`,
        ),
      ],
    },
    {
      title: l(
        `从零实现的终端 Coding Agent(${metrics.codingAgent.lang},自研核心约 ${metrics.codingAgent.lines} 行)`,
        `Terminal Coding Agent Built from Scratch (${metrics.codingAgent.lang}, ~${metrics.codingAgent.lines} lines of core code)`,
      ),
      href: 'https://github.com/xiaoqing-t/Project2-of-OS-2026-Fall',
      bullets: [
        l(
          `实现 ReAct 主循环与多轮对话:<b>LLM 客户端</b>(HTTP + JSON 协议解析)驱动逐轮的工具选择与执行,支持单轮返回多个工具调用并并发调度。`,
          `Implemented the ReAct main loop and multi-turn dialogue: an <b>LLM client</b> (HTTP + JSON protocol parsing) drives per-turn tool selection and execution, supporting multiple tool calls per turn with concurrent scheduling.`,
        ),
        l(
          `<b>工具层</b>:按 dispatch table 思路实现工具注册表,统一 bash / read / write / edit / skill 等工具的接口(名称、描述、参数 schema、执行函数),附只读标记与输出长度上限。`,
          `<b>Tool layer</b>: built a tool registry following the dispatch-table pattern, with a unified interface (name, description, parameter schema, executor) for bash / read / write / edit / skill, plus read-only flags and output-length limits.`,
        ),
        l(
          `<b>上下文管理</b>:实现两套可切换策略——<b>摘要压缩</b>(旧轮次压成文本,省 token 但丢细节)与<b>卸载</b>(写外部文件按需读回,保留原始信息但多一次 I/O),均保留最近 N 轮。`,
          `<b>Context management</b>: implemented two switchable strategies—<b>summary compaction</b> (compress old turns into text; saves tokens but loses detail) and <b>offloading</b> (write to external files and read back on demand; preserves raw information at the cost of extra I/O)—both retaining the most recent N turns.`,
        ),
        l(
          `配 CUnit 单元测试与端到端评测脚本,覆盖卸载 / 摘要 / 执行器三个模块。`,
          `Added CUnit unit tests and end-to-end evaluation scripts covering the offload, summary, and executor modules.`,
        ),
      ],
    },
    {
      title: l(
        `操作系统课程设计:Shell / HTTP 客户端 / 线程池`,
        `Operating Systems Course Project: Shell / HTTP Client / Thread Pool`,
      ),
      href: 'https://github.com/xiaoqing-t/Project1-of-OS-2026-fall',
      bullets: [
        l(
          `实现 shell、HTTP 客户端与线程池三个底层机制,用 ThreadSanitizer 检查并发正确性;这三者后来成为上述 agent 的执行底座。`,
          `Implemented three low-level mechanisms—a shell, an HTTP client, and a thread pool—and used ThreadSanitizer to check concurrency correctness; these later became the execution substrate for the coding agent above.`,
        ),
      ],
    },
    {
      title: l(`MIPS 单周期 CPU(Verilog / Vivado)`, `Single-Cycle MIPS CPU (Verilog / Vivado)`),
      href: 'https://github.com/xiaoqing-t/CPU-by-vivado',
      bullets: [
        l(
          `用 Verilog 从零实现可运行的单周期处理器:ALU、控制单元、寄存器堆、数据通路与顶层集成(<b>${metrics.mips.rtlLines} 行 RTL</b>);7 个 testbench 覆盖各模块与整机,完成仿真并综合出比特流。`,
          `Built a working single-cycle processor from scratch in Verilog—ALU, control unit, register file, datapath, and top-level integration (<b>${metrics.mips.rtlLines} lines of RTL</b>); wrote 7 testbenches covering individual modules and the full chip, completed simulation, and synthesized a bitstream.`,
        ),
      ],
    },
  ],
  experience: [
    {
      title: l(`BCI 实验室 · EEG 数据处理`, `BCI Lab · EEG Data Processing`),
      date: l(`2026.03 – 至今`, `Mar 2026 – Present`),
      bullets: [
        l(
          `负责搭建实验室多模态 EEG 数据预处理管线,把重复工程步骤沉淀为可复用工具;遵循"工具执行、自己审查与决策"的流程,保证数据质量与结果可复现。`,
          `Responsible for building the lab's multimodal EEG preprocessing pipeline and turning repetitive engineering steps into reusable tools; follow a "tools execute, I review and decide" workflow to ensure data quality and reproducibility.`,
        ),
      ],
    },
  ],
  skills: [
    l(
      `<b>编程语言:</b>Python、C/C++;熟练使用 Git、命令行与 Linux 基础。`,
      `<b>Programming:</b> Python, C/C++; comfortable with Git, the command line, and Linux fundamentals.`,
    ),
    l(
      `<b>深度学习:</b>不借助框架从零实现过 CNN 的 forward/backward、损失函数与训练循环(CS231n 全套作业,见 <a href="https://github.com/xiaoqing-t/CS231n-assignments" target="_blank" rel="noopener">GitHub</a>);PyTorch 使用经验。`,
      `<b>Deep Learning:</b> implemented CNN forward/backward passes, loss functions, and training loops from scratch without frameworks (full CS231n assignments; see <a href="https://github.com/xiaoqing-t/CS231n-assignments" target="_blank" rel="noopener">GitHub</a>); hands-on PyTorch experience.`,
    ),
    l(
      `<b>信号处理:</b>熟练使用 MNE/NumPy/h5py 处理 EEG/ECG/EOG,掌握"先 QC 再预处理"的数据质量流程与 HDF5 数据工程。`,
      `<b>Signal Processing:</b> proficient with MNE/NumPy/h5py for EEG/ECG/EOG; experienced with QC-first preprocessing and HDF5 data engineering.`,
    ),
    l(
      `<b>硬件描述:</b>Verilog 数字系统设计,Vivado 仿真与综合流程。`,
      `<b>Hardware Description:</b> Verilog digital design; Vivado simulation and synthesis flow.`,
    ),
  ],
}
