import type { ReactNode } from 'react'
import { MESSAGES } from '../../constants/messages'
import { parseSourceIds, SOURCES } from '../../constants/sources'
import { cn } from '../../utils/cn'
import { formatCount, formatDate, formatSpace } from '../../utils/format'
import Badge from './Badge'

type Props = {
  /** 출처 번호 — meta.source 배열 또는 지표 source 문자열("R5,R6") */
  source?: string | readonly string[] | null
  /** true면 출처를 이름으로 보여준다 ("행정안전부 일반음식점 인허가(R5)"). 기본은 R번호만 */
  sourceNames?: boolean
  /** "데이터 기준일 YYYY.MM.DD (수집 YYYY.MM.DD)" — formatDataBaseline 결과 */
  baseline?: string | null
  /** 기준일 YYYY-MM-DD (meta.as_of) */
  asOf?: string | null
  /** 분석 기간 (예: "2025-11~2026-10", "2026-Q2") — 서버 값 그대로 */
  period?: string | null
  /** 공간 단위 (radius_500m / market / grid …) */
  space?: string | null
  /** 공간 단위 이름을 직접 줄 때 (space보다 우선, 예: "건물 단위") */
  spaceLabel?: string | null
  /** 분모(표본 수) */
  denominator?: number | null
  /** meta.is_demo — true면 "시연 데이터" 배지 */
  isDemo?: boolean | null
  className?: string
}

/**
 * 지표·목록 아래 작은 메타 줄: 출처 · 데이터 기준일 · 기준일 · 공간 단위 · 표본 (+ 시연 데이터)
 * 예) 출처 R5·R6 · 기준일 2026.10.31 · 반경 500m · 표본 46곳
 */
export default function MetaLine({
  source,
  sourceNames = false,
  baseline,
  asOf,
  period,
  space,
  spaceLabel,
  denominator,
  isDemo,
  className,
}: Props) {
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
              {sourceNames && SOURCES[id] ? (
                `${SOURCES[id].name}(${id})`
              ) : (
                <abbr title={SOURCES[id]?.name ?? id} className="no-underline">
                  {id}
                </abbr>
              )}
            </span>
          ))}
        </>
      ),
    })
  }
  if (baseline) parts.push({ key: 'baseline', node: baseline })
  const date = formatDate(asOf)
  if (date) parts.push({ key: 'asOf', node: `기준일 ${date}` })
  if (period) parts.push({ key: 'period', node: `기간 ${period}` })
  const spaceName = spaceLabel ?? formatSpace(space)
  if (spaceName) parts.push({ key: 'space', node: spaceName })
  const sample = formatCount(denominator, '곳')
  if (sample) parts.push({ key: 'denominator', node: `표본 ${sample}` })

  if (parts.length === 0 && !isDemo) return null
  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-x-0 gap-y-1 text-micro text-gray-600',
        className,
      )}
    >
      {isDemo && (
        <Badge tone="orange" className="mr-2">
          {MESSAGES.meta.demo}
        </Badge>
      )}
      {parts.map((p, i) => (
        <span key={p.key}>
          {i > 0 && (
            <span aria-hidden="true" className="mx-1">
              ·
            </span>
          )}
          {p.node}
        </span>
      ))}
    </p>
  )
}
