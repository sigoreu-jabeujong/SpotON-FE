import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { MESSAGES } from '../../constants/messages'
import { parseSourceIds } from '../../constants/sources'
import { cn } from '../../utils/cn'
import { formatCount, formatDate, formatPeriod, formatSpace } from '../../utils/format'
import Badge from './Badge'
import MetaLine from './MetaLine'

type Props = {
  /** 출처 번호 — meta.source 배열 또는 지표 source 문자열 */
  source?: string | readonly string[] | null
  /** "데이터 기준일 YYYY.MM.DD (수집 YYYY.MM.DD)" — formatDataBaseline 결과 */
  baseline?: string | null
  /** 기준일 YYYY-MM-DD (meta.as_of) */
  asOf?: string | null
  /** 분석 기간 — 서버 값 그대로 */
  period?: string | null
  /** 공간 단위 (radius_500m / market / grid …) */
  space?: string | null
  /** 공간 단위 이름을 직접 줄 때 (space보다 우선) */
  spaceLabel?: string | null
  /** 분모(표본 수) */
  denominator?: number | null
  /** meta.is_demo — true면 "시연 데이터" 배지 (항상 보이는 줄에) */
  isDemo?: boolean | null
  /** 어느 값의 정보인지 앞에 붙이는 이름 (예: "점포 현황") */
  label?: string
  className?: string
}

/**
 * 출처 한 줄 — 기준일·기간·공간 단위·표본은 늘 보이고, 출처 이름과 데이터 기준일(수집일)은
 * "출처 자세히"를 펼쳐서 본다 (MetaLine과 같은 값, 빠지는 정보 없음).
 * 기준일(as_of)이 없으면 데이터 기준일을 늘 보이는 줄에 둔다.
 */
export default function SourceLine({
  source,
  baseline,
  asOf,
  period,
  space,
  spaceLabel,
  denominator,
  isDemo,
  label,
  className,
}: Props) {
  const date = formatDate(asOf)
  const parts: { key: string; label?: string; node: ReactNode }[] = []
  if (date) parts.push({ key: 'asOf', label: MESSAGES.meta.asOf, node: date })
  else if (baseline) {
    const m = /^(데이터 기준일) (.+)$/.exec(baseline)
    parts.push(
      m ? { key: 'baseline', label: m[1], node: m[2] } : { key: 'baseline', node: baseline },
    )
  }
  const periodText = formatPeriod(period)
  if (periodText) parts.push({ key: 'period', label: MESSAGES.meta.period, node: periodText })
  const spaceName = spaceLabel ?? formatSpace(space)
  if (spaceName) parts.push({ key: 'space', node: spaceName })
  const sample = formatCount(denominator, MESSAGES.units.store)
  if (sample) parts.push({ key: 'denominator', label: MESSAGES.meta.sample, node: sample })

  // 펼친 쪽: 출처 이름 + (늘 보이는 줄에 없으면) 데이터 기준일
  const hasSource = parseSourceIds(source).length > 0
  const detailBaseline = date ? baseline : null
  const hasDetail = hasSource || !!detailBaseline

  if (parts.length === 0 && !hasDetail && !isDemo) return null
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-stack-2 gap-y-stack-1 text-caption text-gray-600',
        className,
      )}
    >
      <p className="flex flex-wrap items-baseline gap-y-1">
        {label && <span className="mr-2 font-semibold text-gray-900">{label}</span>}
        {isDemo && (
          <Badge tone="orange" className="mr-2 self-center">
            {MESSAGES.meta.demo}
          </Badge>
        )}
        {parts.map((p, i) => (
          <span key={p.key}>
            {i > 0 && (
              <span aria-hidden="true" className="mx-2 text-gray-300">
                ·
              </span>
            )}
            {p.label && <span className="font-medium text-gray-900">{p.label}</span>}
            {p.label && ' '}
            <span className="tabular-nums">{p.node}</span>
          </span>
        ))}
      </p>
      {hasDetail && (
        <details className="group open:basis-full">
          <summary className="inline-flex cursor-pointer list-none items-center gap-0.5 rounded font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 [&::-webkit-details-marker]:hidden">
            {MESSAGES.meta.sourceMore}
            <ChevronDown
              className="size-4 motion-colors group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <MetaLine
            className="mt-stack-1 rounded-control bg-gray-100 px-stack-2 py-stack-1"
            source={source}
            sourceNames
            baseline={detailBaseline}
          />
        </details>
      )}
    </div>
  )
}
