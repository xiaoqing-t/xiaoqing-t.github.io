import { resume, type Lang, type Localized } from '../data/resume'

function Bullets({
  items,
  lang,
  className,
}: {
  items: Localized[]
  lang: Lang
  className?: string
}) {
  return (
    <ul className={`resume-list ${className ?? ''}`.trim()}>
      {items.map((item) => (
        <li key={item.zh} dangerouslySetInnerHTML={{ __html: item[lang] }} />
      ))}
    </ul>
  )
}

export default function ResumePage({ lang }: { lang: Lang }) {
  const t = (value: Localized) => value[lang]

  return (
    <>
      <nav className="nav no-print" id="nav">
        <div className="nav-inner">
          <a className="nav-brand" href="index.html">
            ZY <span className="nav-brand-en">/ {t(resume.nav.back)}</span>
          </a>
          <div className="resume-nav-actions">
            <a className="btn-print" href={lang === 'zh' ? 'resume-en.html' : 'resume.html'}>
              {t(resume.nav.switchLabel)}
            </a>
            <button className="btn-print" onClick={() => window.print()}>
              {t(resume.nav.print)}
            </button>
          </div>
        </div>
      </nav>

      <main className="resume container">
        <header className="resume-head">
          <div>
            <h1 className="resume-name">{resume.name}</h1>
            <p className="resume-role">{t(resume.role)}</p>
            <p className="resume-intro">{t(resume.intro)}</p>
          </div>
          <ul className="resume-contact">
            <li>{resume.contact.phone}</li>
            <li>{resume.contact.email}</li>
            <li>
              <a href={resume.contact.githubHref} target="_blank" rel="noopener">
                {resume.contact.githubLabel}
              </a>
            </li>
          </ul>
        </header>

        <section id="education" className="resume-section">
          <h2 className="resume-h2">{t(resume.headings.education)}</h2>
          <div className="resume-item">
            <div className="resume-item-head">
              <h3>{t(resume.education.school)}</h3>
              <span className="resume-date">{t(resume.education.date)}</span>
            </div>
            <Bullets items={resume.education.bullets} lang={lang} />
            <Bullets items={resume.education.honors} lang={lang} className="resume-honors" />
          </div>
        </section>

        <section id="projects" className="resume-section">
          <h2 className="resume-h2">{t(resume.headings.projects)}</h2>
          {resume.projects.map((project) => (
            <div className="resume-item" key={project.href}>
              <div className="resume-item-head">
                <h3>{t(project.title)}</h3>
                <a className="resume-link" href={project.href} target="_blank" rel="noopener">
                  GitHub ↗
                </a>
              </div>
              <Bullets items={project.bullets} lang={lang} />
            </div>
          ))}
        </section>

        <section id="experience" className="resume-section">
          <h2 className="resume-h2">{t(resume.headings.experience)}</h2>
          {resume.experience.map((item) => (
            <div className="resume-item" key={item.title.zh}>
              <div className="resume-item-head">
                <h3>{t(item.title)}</h3>
                <span className="resume-date">{t(item.date)}</span>
              </div>
              <Bullets items={item.bullets} lang={lang} />
            </div>
          ))}
        </section>

        <section id="skills" className="resume-section">
          <h2 className="resume-h2">{t(resume.headings.skills)}</h2>
          <div className="resume-item">
            <Bullets items={resume.skills} lang={lang} />
          </div>
        </section>
      </main>
    </>
  )
}
