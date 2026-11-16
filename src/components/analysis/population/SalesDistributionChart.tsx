import { useId, useRef, useState } from 'react'
import type { SalesDistribution, SalesReferenceItem } from '../../../types/locationReference'

const money = (display: string | null | undefined) => display?.replace(/\/점포$/, '') ?? '자료 없음'
const coordinate = (value: string | null | undefined) =>
  value !== null && value !== undefined && /^(0|[1-9]\d*)(\.\d+)?$/.test(value)
    ? Number(value)
    : NaN
const tick = (value: number) =>
  new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    useGrouping: true,
    maximumFractionDigits: 1,
  }).format(value)

/** Numbers are used only for chart coordinates; all statistics and exact labels remain server-owned. */
export default function SalesDistributionChart({
  distribution,
  items,
  quarter,
}: {
  distribution: SalesDistribution
  items: SalesReferenceItem[]
  quarter: string | null
}) {
  const id = useId()
  const [selected, setSelected] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const points = items
    .filter((i) => i.average_contribution?.status === 'included' && i.source_quarter === quarter)
    .map((item) => ({ item, value: coordinate(item.per_store_metric?.value) }))
    .sort(
      (a, b) =>
        a.value - b.value ||
        `${a.item.market_code}-${a.item.industry_code}`.localeCompare(
          `${b.item.market_code}-${b.item.industry_code}`,
        ),
    )
  const median = coordinate(distribution.median.value)
  const q1 = coordinate(distribution.q1.value)
  const q3 = coordinate(distribution.q3.value)
  const valid =
    points.length > 0 &&
    points.length === distribution.sample_count &&
    q1 <= median &&
    median <= q3 &&
    [
      ...points.map((p) => p.item.per_store_metric),
      distribution.median,
      distribution.q1,
      distribution.q3,
    ].every((v) => v?.unit === 'KRW_source_reported_per_store') &&
    distribution.variance.unit === 'KRW_source_reported_per_store_squared' &&
    [median, q1, q3, ...points.map((p) => p.value)].every((v) => Number.isFinite(v) && v >= 0)

  if (!valid) return <p className="text-caption text-gray-600">분포를 표시할 자료가 없어요.</p>

  const max = Math.max(q3, median, ...points.map((p) => p.value))
  const position = (value: number) => (max === 0 ? 50 : (value / max) * 100)
  const active = Math.min(selected, points.length - 1)
  const current = points[active].item
  const hasSpread = distribution.sample_count >= 4 && !distribution.limited_reference_count
  const spreadDetails = (
    <>
      <p className="mt-1 break-all">분산(원²): {distribution.variance.value}</p>
      <p>
        제1사분위 {money(distribution.q1.display)} · 제3사분위 {money(distribution.q3.display)}
      </p>
    </>
  )

  return (
    <figure className="mt-4 min-w-0 border-t border-gray-300 pt-4" aria-labelledby={`${id}-title`}>
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold" id={`${id}-title`}>
          매출 분산 그래프
        </span>
        <span className="text-caption text-gray-600">대상 {distribution.sample_count}개 항목</span>
      </figcaption>
      <p className="mt-1 text-caption text-gray-600" id={`${id}-help`}>
        상권·업종별 점포당 매출 · 중앙값 기준
      </p>
      <div
        className="mt-4 rounded-control border border-gray-300 bg-white px-4 py-3"
        style={{ printColorAdjust: 'exact' }}
      >
        <div
          className="relative mx-2 h-32"
          role="group"
          aria-label="상권·업종별 추정 매출 분포"
          aria-describedby={`${id}-help`}
        >
          <div className="absolute inset-x-0 top-1/2 border-t border-gray-300" />
          {hasSpread && (
            <div
              className="absolute top-4 bottom-4 rounded border border-blue-500 bg-blue-100"
              style={{ left: `${position(q1)}%`, width: `${position(q3) - position(q1)}%` }}
              aria-hidden="true"
            />
          )}
          <div
            className="absolute inset-y-0 border-l-2 border-dashed border-blue-700"
            style={{ left: `${position(median)}%` }}
            aria-hidden="true"
          />
          {points.map(({ item, value }, index) => (
            <button
              key={`${item.market_code}-${item.industry_code}-${item.source_quarter}`}
              ref={(node) => {
                buttons.current[index] = node
              }}
              type="button"
              className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${index === active ? 'z-10' : ''}`}
              style={{ left: `${position(value)}%`, top: `${26 + (index % 7) * 8}%` }}
              tabIndex={index === active ? 0 : -1}
              aria-pressed={index === active}
              aria-label={`${item.market_name} · ${item.industry_name}: ${money(item.per_store_metric?.display)}`}
              title={`${item.market_name} · ${item.industry_name}: ${money(item.per_store_metric?.display)}`}
              onFocus={() => setSelected(index)}
              onMouseEnter={() => setSelected(index)}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => {
                const next =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? points.length - 1
                      : event.key === 'ArrowRight'
                        ? Math.min(index + 1, points.length - 1)
                        : event.key === 'ArrowLeft'
                          ? Math.max(index - 1, 0)
                          : null
                if (next !== null) {
                  event.preventDefault()
                  setSelected(next)
                  buttons.current[next]?.focus()
                }
              }}
            >
              <span
                aria-hidden="true"
                className={`h-3 w-3 rounded-full border-2 border-blue-700 ${index === active ? 'bg-blue-700' : 'bg-white'}`}
              />
            </button>
          ))}
        </div>
        <div className="relative mx-2 mt-2 h-5 text-caption text-gray-600" aria-hidden="true">
          {max === 0 ? (
            <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
              모든 항목 0원
            </span>
          ) : (
            <>
              <span className="absolute left-0">0원</span>
              <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                {tick(max / 2)}원
              </span>
              <span className="absolute right-0">{tick(max)}원</span>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-caption text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-700" />
          상권·업종
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-blue-700" />
          중앙값 {money(distribution.median.display)}
        </span>
        {hasSpread && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm border border-blue-500 bg-blue-100" />
            중간 50% 범위
          </span>
        )}
      </div>
      <p
        className="mt-2 min-h-10 text-caption break-words print:hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {current.market_name} · {current.industry_name}{' '}
        <b>{money(current.per_store_metric?.display)}</b>
      </p>
      <p className="text-caption text-gray-600 print:hidden">
        점을 선택하면 금액을 볼 수 있어요. 방향키로도 이동할 수 있어요.
      </p>
      {hasSpread && (
        <>
          <details className="mt-2 text-caption text-gray-600 print:hidden">
            <summary className="cursor-pointer">분산 값과 사분위 범위</summary>
            {spreadDetails}
          </details>
          <div className="mt-2 hidden text-caption text-gray-600 print:block">{spreadDetails}</div>
        </>
      )}
    </figure>
  )
}
