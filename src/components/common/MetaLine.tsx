import type { ReactNode } from 'react'
import { parseSourceIds, SOURCES } from '../../constants/sources'
import { cn } from '../../utils/cn'
import { formatCount, formatDate, formatSpace } from '../../utils/format'

type Props = {
  /** 출처 번호 — meta.source 배열 또는 지표 source 문자열("R5,R6") */
  source?: string | readonly string[] | null
  /** 기준일 YYYY-MM-DD (meta.as_of) */
  asOf?: string | null
  /** 분석 기간 (예: "2025-11~2026-10", "2026-Q2") — 서버 값 그대로 */
  period?: string | null
  /** 공간 단위 (radius_500m / market / grid …) */
  space?: string | null
  /** 분모(표본 수) */
  denominator?: number | null
  className?: string
}

/**
 * 지표 아래 작은 메타 줄: 출처 · 기준일 · 공간 단위 · 표본
 * 예) 출처 R5·R6 · 기준일 2026.10.31 · 반경 500m · 표본 46곳
 */
export default function MetaLine({ source, asOf, period, space, denominator, className }: Props) {
  const ids = parseSourceIds(source)
  const parts: { key: string; node: ReactNode }[] = []

  if (ids.length > 0) {
    parts.push({
      key: 'source',
      node: (
        <>
          출처{' '}
          {ids.map((id, i) => (
            <span key={id}>
              {i > 0 && '·'}
              <abbr title={SOURCES[id]?.name ?? id} className="no-underline">
                {id}
              </abbr>
            </span>
          ))}
        </>
      ),
    })
  }
  const date = formatDate(asOf)
  if (date) parts.push({ key: 'asOf', node: `기준일 ${date}` })
  if (period) parts.push({ key: 'period', node: `기간 ${period}` })
  const spaceName = formatSpace(space)
  if (spaceName) parts.push({ key: 'space', node: spaceName })
  const sample = formatCount(denominator, '곳')
  if (sample) parts.push({ key: 'denominator', node: `표본 ${sample}` })

  if (parts.length === 0) return null
  return (
    <p className={cn('text-micro text-gray-600', className)}>
      {parts.map((p, i) => (
        <span key={p.key}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {p.node}
        </span>
      ))}
    </p>
  )
}
