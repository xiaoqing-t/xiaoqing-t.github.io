// 「关于我」区块：三张卡片，内容来自 aboutCards 数组。
// 想加/删一张卡，改 site.tsx 里的 aboutCards 就行，这个文件不用动。

import Section from './Section'
import Reveal from './Reveal'
import { aboutCards } from '../data/site'

export default function About() {
  return (
    <Section id="about" num="01" title="关于我">
      <Reveal className="about-grid">
        {aboutCards.map((card) => (
          // key 用标题：三张卡的标题各不相同，天然适合当身份证
          <div className="about-card card" key={card.title}>
            <h3>{card.title}</h3>
            {/* body 的类型是 ReactNode：一般写字符串，需要局部加粗时也可以写 JSX */}
            <p>{card.body}</p>
          </div>
        ))}
      </Reveal>
    </Section>
  )
}
