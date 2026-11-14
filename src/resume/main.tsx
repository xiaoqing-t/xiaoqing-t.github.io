import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Lang } from '../data/resume'
import ResumePage from './ResumePage'

const lang: Lang = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'zh'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResumePage lang={lang} />
  </StrictMode>,
)
