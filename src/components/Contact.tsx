// 「联系我」区块：邮箱是纯文本（刻意不做 mailto，避免被爬虫收集），
// 外加两个按钮：GitHub（站外，新开标签）和简历（站内静态页）。

import Section from './Section'
import { contact, profile } from '../data/site'

/** 判断是不是站外链接：以 http 开头的才新开标签页 */
const isExternal = (href: string) => href.startsWith('http')

export default function Contact() {
  return (
    <Section id="contact" num="04" title="联系我">
      <p className="contact-lead">{contact.lead}</p>

      <div className="contact-links">
        <span className="contact-email">{profile.email}</span>

        {contact.links.map((link) => (
          <a
            key={link.href}
            className="btn btn-ghost"
            href={link.href}
            // 站外链接才带 target/rel。{...(条件 ? {...} : {})} 是「按条件加属性」的常见写法，
            // 展开一个空对象就等于什么属性都没加。
            {...(isExternal(link.href) ? { target: '_blank', rel: 'noopener' } : {})}
          >
            {link.label}
          </a>
        ))}
      </div>
    </Section>
  )
}
