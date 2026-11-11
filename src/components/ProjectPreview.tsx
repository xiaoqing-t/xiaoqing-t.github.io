// 作品卡的视觉预览：每个项目一段原创 SVG 画面（不是截图，纯装饰）。
// 四种画面各自呼应项目本体：终端 agent / CPU 数据通路 / 脑电波形 / 卷积网络。
// 全部用确定性数学画波形，不用 Math.random，重渲染时画面稳定。

import type { PreviewKind } from '../data/site'

const MONO = 'ui-monospace, SFMono-Regular, Consolas, monospace'

/** 生成一条脑电/生理信号折线的 points 字符串 */
function trace(baseY: number, kind: 'eeg' | 'ecg' | 'eog'): string {
  const pts: string[] = []
  for (let x = 72; x <= 384; x += 3) {
    let y = baseY
    if (kind === 'eeg') {
      y += 9 * Math.sin(x * 0.42) + 5 * Math.sin(x * 0.93 + 1) + 3 * Math.sin(x * 1.9 + 2)
    } else if (kind === 'ecg') {
      const p = (x - 72) % 66
      if (p > 28 && p < 32) y -= 30
      else if (p >= 32 && p < 36) y += 16
      else if (p > 20 && p < 24) y -= 6
      else y += 1.5 * Math.sin(x * 0.5)
    } else {
      y += 13 * Math.sin(x * 0.11) + 4 * Math.sin(x * 0.33 + 1)
    }
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

function Agent() {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="终端 coding agent 示意" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill="#1c1b17" />
      <rect width="400" height="30" fill="#26241d" />
      <circle cx="20" cy="15" r="4" fill="#d9a441" />
      <circle cx="36" cy="15" r="4" fill="#8fbf7f" />
      <circle cx="52" cy="15" r="4" fill="#6f675a" />
      <text x="150" y="19" fill="#8a8172" fontFamily={MONO} fontSize="11">agent — react loop</text>
      <g fontFamily={MONO} fontSize="13">
        <text x="22" y="66" fill="#d9a441">› agent run</text>
        <text x="22" y="94" fill="#8a8172">think → pick a tool</text>
        <text x="22" y="122" fill="#8fbf7f">tool: bash   ls src/</text>
        <text x="22" y="150" fill="#cfc6b4">  main.c  loop.c  tools.c</text>
        <text x="22" y="178" fill="#8fbf7f">tool: edit   loop.c</text>
        <text x="22" y="206" fill="#d9a441">✓ 2.3k LOC · 7 tools</text>
      </g>
      <rect className="pv-cursor" x="22" y="224" width="9" height="15" fill="#d9a441" />
    </svg>
  )
}

function Cpu() {
  const wire = '#6b5535'
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="MIPS 单周期数据通路示意" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cpuBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d3c19d" />
          <stop offset="1" stopColor="#bda87d" />
        </linearGradient>
        <marker id="cpuArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={wire} />
        </marker>
      </defs>
      <rect width="400" height="300" fill="url(#cpuBg)" />
      <g fill="none" stroke={wire} strokeWidth="1.6" markerEnd="url(#cpuArrow)">
        <path d="M70,150 H104" />
        <path d="M150,150 H186" />
        <path d="M232,150 H268" />
        <path d="M300,150 H330" />
        <path d="M210,128 V96 H352 V150" />
        <path d="M352,150 H366" />
      </g>
      <g fill="#f2e7cf" stroke={wire} strokeWidth="1.6">
        <rect x="36" y="132" width="34" height="36" rx="3" />
        <rect x="104" y="120" width="46" height="60" rx="3" />
        <rect x="268" y="120" width="32" height="60" rx="3" />
      </g>
      <polygon points="186,120 214,132 214,168 186,180 186,160 196,150 186,140" fill="#f2e7cf" stroke={wire} strokeWidth="1.6" />
      <g fontFamily={MONO} fontSize="10" fill="#4a3a20" textAnchor="middle">
        <text x="53" y="154">PC</text>
        <text x="127" y="154">REG</text>
        <text x="203" y="153">ALU</text>
        <text x="284" y="154">MEM</text>
      </g>
      <g fontFamily={MONO} fontSize="10" fill="#6b5535">
        <text x="36" y="40">single-cycle</text>
        <text x="36" y="262">610 RTL · 7 tb</text>
      </g>
      <g stroke={wire} strokeWidth="1.4" opacity="0.5">
        <path d="M300,40 h60 M300,40 v10 M312,40 v8 M324,40 v10 M336,40 v8 M348,40 v10 M360,40 v8" fill="none" />
      </g>
    </svg>
  )
}

function Eeg() {
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="多模态生理信号波形示意" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="eegBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#21302b" />
          <stop offset="1" stopColor="#15201d" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#eegBg)" />
      <g stroke="#33453e" strokeWidth="1">
        <path d="M72,40 V260 M144,40 V260 M216,40 V260 M288,40 V260 M360,40 V260" />
      </g>
      <g fontFamily={MONO} fontSize="11" fill="#7f9a8e">
        <text x="20" y="94">EEG</text>
        <text x="20" y="164">ECG</text>
        <text x="20" y="234">EOG</text>
      </g>
      <polyline points={trace(90, 'eeg')} fill="none" stroke="#7fd0b0" strokeWidth="1.8" strokeLinejoin="round" />
      <polyline points={trace(160, 'ecg')} fill="none" stroke="#cfe8d8" strokeWidth="1.8" strokeLinejoin="round" />
      <polyline points={trace(230, 'eog')} fill="none" stroke="#9ec9b8" strokeWidth="1.8" strokeLinejoin="round" />
      <rect className="pv-scan" x="72" y="38" width="2" height="224" fill="#7fd0b0" opacity="0.5" />
    </svg>
  )
}

function Dl() {
  const line = '#a9895d'
  const node = '#7a5a34'
  const layers = [
    { x: 250, ys: [90, 130, 170, 210] },
    { x: 320, ys: [110, 150, 190] },
    { x: 372, ys: [130, 170] },
  ]
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label="卷积神经网络示意" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="dlBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9d6bb" />
          <stop offset="1" stopColor="#d8bf9d" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#dlBg)" />
      {/* 输入特征图 4x4 */}
      <g fill="#f3e8d2" stroke={line} strokeWidth="1.2">
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={i} x={36 + (i % 4) * 22} y={92 + Math.floor(i / 4) * 22} width="20" height="20" rx="2" />
        ))}
      </g>
      {/* 卷积核 3x3（高亮） */}
      <g fill="#c9a877" stroke={node} strokeWidth="1.2">
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={150 + (i % 3) * 20} y={104 + Math.floor(i / 3) * 20} width="18" height="18" rx="2" />
        ))}
      </g>
      <g stroke={line} strokeWidth="1.3" fill="none" opacity="0.85">
        <path d="M126,150 H148" markerEnd="url(#dlArrow)" />
        <path d="M212,150 H240" markerEnd="url(#dlArrow)" />
      </g>
      <defs>
        <marker id="dlArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={line} />
        </marker>
      </defs>
      {/* 全连接层之间的连线 */}
      <g stroke={line} strokeWidth="0.8" opacity="0.5">
        {layers.slice(0, -1).map((layer, li) =>
          layer.ys.flatMap((y1) =>
            layers[li + 1].ys.map((y2) => (
              <line key={`${li}-${y1}-${y2}`} x1={layer.x} y1={y1} x2={layers[li + 1].x} y2={y2} />
            )),
          ),
        )}
      </g>
      {/* 节点 */}
      <g fill={node}>
        {layers.flatMap((layer, li) =>
          layer.ys.map((y) => <circle key={`${li}-${y}`} cx={layer.x} cy={y} r="7" />),
        )}
      </g>
      <g fontFamily={MONO} fontSize="10" fill="#6f5433">
        <text x="36" y="262">conv → relu → fc</text>
        <text x="36" y="40">numpy · no framework</text>
      </g>
    </svg>
  )
}

export default function ProjectPreview({ kind }: { kind: PreviewKind }) {
  if (kind === 'agent') return <Agent />
  if (kind === 'cpu') return <Cpu />
  if (kind === 'eeg') return <Eeg />
  return <Dl />
}