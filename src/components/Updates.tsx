// 「BCI 更新」区块：一个持续更新的短清单 —— 每周挑几条值得看的，每条带一句自己的判断。
//
// 数据在 public/bci-updates.json，加一条只改那个文件，这个组件不用动。
// 倒序和按月分组都在这里算，所以 JSON 里顺序写乱了也没关系。

import Section from './Section'
import Reveal from './Reveal'
import { bciUpdates, bciUpdated } from '../data/site'
import type { BciUpdate } from '../data/site'

/** 把 "2026-11" 写成「2026 年 11 月」，用作分组标题 */
function monthLabel(key: string) {
  const [year, month] = key.split('-')
  return `${year} 年 ${Number(month)} 月`
}

/** 排好序的条目按月份装成一组一组 */
function groupByMonth(items: BciUpdate[]) {
  const groups: { key: string; items: BciUpdate[] }[] = []

  for (const item of items) {
    const key = item.date.slice(0, 7) // "2026-11"
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.items.push(item)
    else groups.push({ key, items: [item] })
  }

  return groups
}

export default function Updates() {
  // JSON 是手写的，顺序不可靠：这里统一按日期倒序排一遍
  const sorted = [...bciUpdates].sort((a, b) => b.date.localeCompare(a.date))
  const groups = groupByMonth(sorted)

  return (
    <Section
      id="updates"
      num="03"
      title="BCI 更新"
      lead="每周挑几条脑机接口方向值得看的东西——论文、产业动向、会议——每条后面跟一句我自己的判断：它为什么重要。"
    >
      <p className="updates-status" role="status">
        最近整理 {bciUpdated} · 共 {sorted.length} 条
      </p>

      {groups.length === 0 ? (
        <div className="updates-empty card">
          <p>这个星期还没更新。</p>
        </div>
      ) : (
        <Reveal className="updates">
          {groups.map((group) => (
            <div className="update-month" key={group.key}>
              <h3 className="update-month-label">{monthLabel(group.key)}</h3>

              <ul className="update-list">
                {group.items.map((item) => (
                  // 日期 + 标题当 key：同一天同一标题重复的概率可以忽略
                  <li className="update-item" key={item.date + item.title}>
                    {/* 只显示「月-日」，年份已经在分组标题里了 */}
                    <time className="update-date" dateTime={item.date}>
                      {item.date.slice(5)}
                    </time>

                    <div className="update-body">
                      <div className="update-head">
                        <span className="update-tag">{item.tag}</span>
                        {item.url ? (
                          <a className="update-title" href={item.url} target="_blank" rel="noopener">
                            {item.title} ↗
                          </a>
                        ) : (
                          <span className="update-title">{item.title}</span>
                        )}
                      </div>

                      {item.note && <p className="update-note">{item.note}</p>}
                      {item.source && <span className="update-source">{item.source}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      )}
    </Section>
  )
}
