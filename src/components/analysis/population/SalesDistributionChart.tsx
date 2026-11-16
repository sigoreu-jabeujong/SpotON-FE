import { useId, useRef, useState } from 'react'
import { MESSAGES } from '../../../constants/messages'
import type { LocationReference, SalesReferenceItem } from '../../../types/locationReference'

type Average = NonNullable<LocationReference['sales']['per_store_average']>
const money = (value: string | null | undefined) => value?.replace(/\/점포$/, '') ?? '자료 없음'
const number = (value: string | null | undefined) =>
  value && /^(0|[1-9]\d*)(\.\d+)?$/.test(value) ? Number(value) : NaN
const integer = (value: string | null | undefined) =>
  !!value && /^(0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value))
const compact = (value: number) =>
  new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    maximumFractionDigits: 1,
    useGrouping: true,
  }).format(value)

/**
 * The server estimates a store-weighted histogram of market means, not actual individual sales.
 * variant="screen"(결과 화면)은 쉬운 말로 표시하고 가중 분산·긴 설명을 뺀다 (설명은 카드의 ⓘ 팝오버).
 * 기본 "print"(진단서)는 기존 문구 그대로 — 검증·계산은 두 모양이 같다.
 */
export default function SalesDistributionChart({
  average,
  items,
  variant = 'print',
  title,
}: {
  average: Average
  items: SalesReferenceItem[]
  variant?: 'print' | 'screen'
  /** 화면 그래프 제목을 바꿀 때 (예: 큰 숫자와 계산 방식이 다른 참고 분포) */
  title?: string
}) {
  const screen = variant === 'screen'
  const C = MESSAGES.reference.chart
  const id = useId()
  const [selected, setSelected] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const d = average.store_weighted_distribution
  const eligible = items.filter(
    (i) =>
      i.average_contribution?.status === 'included' && i.source_quarter === average.primary_quarter,
  )
  const sourceCounts = eligible.map((i) => i.store_reference?.total_stores)
  const valid =
    d &&
    average.representative_method === 'store_weighted_median_v1' &&
    average.graph_basis === 'store_weighted_histogram_v1' &&
    d.method === 'store_weighted_median_v1' &&
    d.model === 'repeat_market_mean_for_each_reference_store' &&
    d.individual_store_sales_observed === false &&
    d.total_store_count === average.total_store_count &&
    d.reference_count === average.included_item_count &&
    d.reference_count === eligible.length &&
    integer(d.total_store_count) &&
    Number(d.total_store_count) > 0 &&
    sourceCounts.every(integer) &&
    sourceCounts.reduce((sum, n) => sum + BigInt(n!), 0n) === BigInt(d.total_store_count) &&
    [d.median, d.minimum, d.maximum].every(
      (v) =>
        v.unit === 'KRW_source_reported_per_store' &&
        Number.isFinite(number(v.value)) &&
        number(v.value) >= 0,
    ) &&
    number(d.minimum.value) <= number(d.median.value) &&
    number(d.median.value) <= number(d.maximum.value) &&
    d.bins.length > 0 &&
    d.bins.length <= 10 &&
    d.bins.every(
      (b, index) =>
        integer(b.store_count) &&
        [b.lower, b.upper].every(
          (v) => v.unit === 'KRW_source_reported_per_store' && Number.isFinite(number(v.value)),
        ) &&
        number(b.lower.value) >= number(d.minimum.value) &&
        number(b.upper.value) <= number(d.maximum.value) &&
        number(b.lower.value) <= number(b.upper.value) &&
        (index === 0
          ? b.lower.value === d.minimum.value
          : b.lower.value === d.bins[index - 1].upper.value) &&
        b.upper_inclusive === (index === d.bins.length - 1),
    ) &&
    d.bins[d.bins.length - 1].upper.value === d.maximum.value &&
    d.bins.reduce((sum, b) => sum + BigInt(b.store_count), 0n) === BigInt(d.total_store_count)
  if (!valid || !d)
    return <p className="mt-4 text-caption text-gray-600">분포를 표시할 자료가 없어요.</p>

  const minimum = number(d.minimum.value),
    maximum = number(d.maximum.value),
    median = number(d.median.value)
  const medianPosition = maximum === minimum ? 50 : ((median - minimum) / (maximum - minimum)) * 100
  const maxCount = Math.max(...d.bins.map((b) => Number(b.store_count)))
  const active = Math.min(selected, d.bins.length - 1)
  const current = d.bins[active]
  const variance = <p className="mt-1 break-all">상권 평균 간 가중 분산(원²): {d.variance.value}</p>
  return (
    <figure className="mt-4 min-w-0 border-t border-gray-300 pt-4" aria-labelledby={`${id}-title`}>
      <figcaption className="font-semibold" id={`${id}-title`}>
        {screen ? (title ?? C.title) : '점포 수 기준 매출 분포'}
      </figcaption>
      {screen ? (
        <p className="mt-1 text-caption text-gray-600">
          {C.basis(Number(d.total_store_count).toLocaleString('ko-KR'), d.reference_count)}
        </p>
      ) : (
        <>
          <p className="mt-1 text-caption text-gray-600">
            전체 {Number(d.total_store_count).toLocaleString('ko-KR')}개 점포 · {d.reference_count}
            개 상권·업종 자료
          </p>
          <p className="text-caption text-gray-600">상권 평균에 점포 수를 반영한 추정 분포예요.</p>
        </>
      )}
      <div
        className="mt-3 rounded-control border border-gray-300 bg-white p-3"
        style={{ printColorAdjust: 'exact' }}
      >
        <p className="mb-2 text-caption text-gray-600">
          {screen ? C.yLabel : '점포 수 가중치 (개)'}
        </p>
        <div className="flex gap-2">
          <div
            className="relative h-44 w-10 shrink-0 text-caption text-gray-600"
            aria-hidden="true"
          >
            <span className="absolute top-0 right-0 -translate-y-1/2">{compact(maxCount)}</span>
            <span className="absolute top-1/2 right-0 -translate-y-1/2">
              {compact(maxCount / 2)}
            </span>
            <span className="absolute right-0 bottom-0 translate-y-1/2">0</span>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="relative flex h-44 items-end border-b border-gray-300"
              role="group"
              aria-label={screen ? C.groupLabel : '점포 수 가중 추정 매출 히스토그램'}
            >
              {[0, 50].map((top) => (
                <div
                  key={top}
                  className="pointer-events-none absolute inset-x-0 border-t border-gray-300"
                  style={{ top: `${top}%` }}
                  aria-hidden="true"
                />
              ))}
              {d.bins.map((bin, index) => (
                <button
                  key={index}
                  type="button"
                  ref={(node) => {
                    buttons.current[index] = node
                  }}
                  tabIndex={index === active ? 0 : -1}
                  aria-pressed={index === active}
                  className="relative flex h-full min-w-0 flex-1 cursor-pointer items-end px-0.5 focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-blue-700"
                  aria-label={
                    screen
                      ? C.bin(
                          money(bin.lower.display),
                          money(bin.upper.display),
                          bin.upper_inclusive,
                          bin.store_count,
                        )
                      : `${money(bin.lower.display)} 이상 ${money(bin.upper.display)} ${bin.upper_inclusive ? '이하' : '미만'}, 점포 수 가중치 ${bin.store_count}개`
                  }
                  onClick={() => setSelected(index)}
                  onFocus={() => setSelected(index)}
                  onKeyDown={(e) => {
                    const next =
                      e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? d.bins.length - 1
                          : e.key === 'ArrowRight'
                            ? Math.min(index + 1, d.bins.length - 1)
                            : e.key === 'ArrowLeft'
                              ? Math.max(index - 1, 0)
                              : null
                    if (next !== null) {
                      e.preventDefault()
                      setSelected(next)
                      buttons.current[next]?.focus()
                    }
                  }}
                >
                  <span
                    className={`block w-full rounded-t-sm border border-blue-700 ${index === active ? 'bg-blue-700' : 'bg-blue-500'}`}
                    style={{
                      height: `${(Number(bin.store_count) / maxCount) * 100}%`,
                      borderWidth: bin.store_count === '0' ? 0 : 1,
                    }}
                    aria-hidden="true"
                  />
                </button>
              ))}
              <div
                className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-dashed border-gray-900"
                style={{ left: `${medianPosition}%` }}
                aria-hidden="true"
              />
            </div>
            <div
              className="mt-2 flex justify-between gap-2 text-caption text-gray-600"
              aria-hidden="true"
            >
              <span>{compact(minimum)}원</span>
              {maximum !== minimum && <span>{compact(maximum)}원</span>}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-caption font-semibold">
        {screen
          ? C.median(money(d.median.display))
          : `점포 수 가중 중앙값 ${money(d.median.display)}`}
      </p>
      <p className="mt-1 text-caption text-gray-600">
        {screen ? C.axes : '가로축: 점포당 추정 매출 · 세로축: 점포 수 가중치'}
      </p>
      <p
        className="mt-2 min-h-10 text-caption break-words print:hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {screen
          ? C.selected(
              money(current.lower.display),
              money(current.upper.display),
              Number(current.store_count).toLocaleString('ko-KR'),
            )
          : `선택 구간 ${money(current.lower.display)} ~ ${money(current.upper.display)} · 점포 수 가중치 ${Number(current.store_count).toLocaleString('ko-KR')}개`}
      </p>
      {/* 화면은 가중 분산·관측 분포 아님 설명을 빼고 카드 ⓘ 팝오버로 (진단서는 그대로) */}
      {!screen && (
        <>
          <p className="text-caption text-gray-600">개별 점포 실매출을 관측한 분포는 아니에요.</p>
          <details className="mt-2 text-caption text-gray-600 print:hidden">
            <summary>가중 분산 보기</summary>
            {variance}
          </details>
          <div className="mt-2 hidden text-caption text-gray-600 print:block">{variance}</div>
        </>
      )}
    </figure>
  )
}
