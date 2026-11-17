import type { ReactNode } from 'react'
import { MESSAGES } from '../../constants/messages'
import { parseSourceIds, SOURCES } from '../../constants/sources'
import { cn } from '../../utils/cn'
import { formatCount, formatDate, formatPeriod, formatSpace } from '../../utils/format'
import Badge from './Badge'

type Props = {
  /** 출처 번호 — meta.source 배열 또는 지표 source 문자열("R5,R6") */
  source?: string | readonly string[] | null
  /** true면 출처를 이름으로 보여준다 ("행정안전부 일반음식점 인허가(R5)"). 기본은 R번호만 */
  sourceNames?: boolean
  /** "데이터 기준일 YYYY. MM. DD. (수집 YYYY. MM. DD.)" — formatDataBaseline 결과 */
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
  /** 여러 메타 줄이 붙어 있을 때 어느 값의 정보인지 앞에 붙이는 이름 (예: "동종업체 수") */
  label?: string
  className?: string
}

/**
 * 지표·목록 아래 작은 메타 줄: 출처 · 데이터 기준일 · 기준일 · 공간 단위 · 표본 (+ 시연 데이터)
 * 예) 출처 R5·R6 · 기준일 2026. 10. 31. · 반경 500m · 표본 46개
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
  label,
  className,
}: Props) {
  const ids = parseSourceIds(source)
  // 항목마다 앞에 작은 이름표(출처·데이터 기준일·기준일·기간·표본) + 값. 내용은 예전과 한 글자도 다르지 않다
  const parts: { key: string; label?: string; node: ReactNode }[] = []

  if (ids.length > 0) {
    parts.push({
      key: 'source',
      label: MESSAGES.meta.source,
      node: ids.map((id, i) => (
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
      )),
    })
  }
  if (baseline) {
    // "데이터 기준일 2026. 11. 08. (수집 …)" → 이름표 "데이터 기준일" + 값
    const m = /^(데이터 기준일) (.+)$/.exec(baseline)
    parts.push(
      m ? { key: 'baseline', label: m[1], node: m[2] } : { key: 'baseline', node: baseline },
    )
  }
  const date = formatDate(asOf)
  if (date) parts.push({ key: 'asOf', label: MESSAGES.meta.asOf, node: date })
  const periodText = formatPeriod(period)
  if (periodText) parts.push({ key: 'period', label: MESSAGES.meta.period, node: periodText })
  const spaceName = spaceLabel ?? formatSpace(space)
  if (spaceName) parts.push({ key: 'space', node: spaceName })
  const sample = formatCount(denominator, MESSAGES.units.store)
  if (sample) parts.push({ key: 'denominator', label: MESSAGES.meta.sample, node: sample })

  if (parts.length === 0 && !isDemo) return null
  const lead = !!label || isDemo
  return (
    <p className={cn('max-w-[44em] text-micro leading-relaxed text-gray-600', className)}>
      {/*
        항목 사이는 가운뎃점 대신 얇은 세로선. 각 항목은 왼쪽 여백(21px) 안에 세로선을 두고, 묶음 전체를 21px 왼쪽으로
        당겨 잘라 낸다 — 줄이 바뀌어 줄 맨 앞에 온 항목의 세로선은 잘린 칸에 들어가 보이지 않고 항목 사이에만 보인다.
        (예전 mx-2.5 + 1px 선과 같은 간격이라 한 줄일 때 모양은 같다)
      */}
      <span className="block overflow-hidden">
        <span className="-ml-[21px] flex flex-wrap items-baseline gap-y-1">
          {lead && (
            // 이름표·시연 배지 — 바로 뒤 항목과는 예전처럼 8px 간격, 세로선 없음 (-13px = 8px - 21px)
            <span className="-mr-[13px] flex items-baseline gap-2 pl-[21px]">
              {label && <span className="font-semibold text-gray-900">{label}</span>}
              {isDemo && (
                <Badge tone="orange" className="self-center">
                  {MESSAGES.meta.demo}
                </Badge>
              )}
            </span>
          )}
          {parts.map((p, i) => (
            <span key={p.key} className="relative pl-[21px]">
              {!(lead && i === 0) && (
                <span
                  aria-hidden="true"
                  className="absolute top-[0.35em] left-2.5 h-[0.9em] w-px bg-gray-300"
                />
              )}
              {/* 복사할 때 항목이 공백으로 떨어지게 */}{' '}
              {/* 이름표와 값 사이에 실제 공백을 둬 읽기·복사 때 붙지 않게 */}
              {p.label && <span className="font-medium text-gray-900">{p.label}</span>}
              {p.label && ' '}
              <span className="tabular-nums">{p.node}</span>
            </span>
          ))}
        </span>
      </span>
    </p>
  )
}
