/**
 * 解析 notes.json 里 meta 开头的日期（"2026-10" 或 "2026-10-12"）。
 * 没有日期时返回 null，由调用方决定退化成什么值。
 */
export function parseNoteDate(meta) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(meta ?? '')
  if (!m) return null
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1))
}
