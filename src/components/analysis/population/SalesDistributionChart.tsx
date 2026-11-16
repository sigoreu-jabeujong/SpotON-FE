import { useId, useRef, useState } from 'react'
import type { LocationReference, SalesReferenceItem } from '../../../types/locationReference'

type Average = NonNullable<LocationReference['sales']['per_store_average']>
const money = (value: string | null | undefined) => value?.replace(/\/점포$/, '') ?? '자료 없음'
const number = (value: string | null | undefined) =>
  value && /^(0|[1-9]\d*)(\.\d+)?$/.test(value) ? Number(value) : NaN
const key = (item: { market_code: string; industry_code: string; source_quarter: string | null }) =>
  `${item.market_code}-${item.industry_code}-${item.source_quarter}`

/** Common-denominator contributions, supplied by BE; Number is only used for bar geometry. */
export default function SalesDistributionChart({
  average,
  items,
}: {
  average: Average
  items: SalesReferenceItem[]
}) {
  const id = useId()
  const [selected, setSelected] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const eligible = items.filter(
    (i) =>
      i.average_contribution?.status === 'included' && i.source_quarter === average.primary_quarter,
  )
  const source = new Map(eligible.map((i) => [key(i), i]))
  const bars = (average.contributions ?? []).map((c) => ({
    ...c,
    item: source.get(key(c)),
    value: number(c.metric.value),
  }))
  const mean = number(average.metric?.value)
  const valid =
    average.graph_basis === 'each_sales_over_group_total_stores_v1' &&
    average.representative_method === 'pooled_sales_over_total_stores_v1' &&
    average.primary_quarter !== null &&
    /^[1-9][0-9]*$/.test(average.total_store_count ?? '') &&
    bars.length > 0 &&
    bars.length === eligible.length &&
    bars.length === average.included_item_count &&
    new Set(bars.map(key)).size === bars.length &&
    source.size === eligible.length &&
    average.metric?.unit === 'KRW_source_reported_per_store' &&
    Number.isFinite(mean) &&
    mean >= 0 &&
    bars.every(
      (c) =>
        c.item &&
        c.metric.unit === 'KRW_source_reported_per_store' &&
        c.metric.denominator === average.total_store_count &&
        c.metric.numerator === c.item.metric?.value &&
        Number.isFinite(c.value) &&
        c.value >= 0 &&
        c.value <= mean,
    )

  if (!valid)
    return <p className="mt-4 text-caption text-gray-600">그래프를 표시할 자료가 없어요.</p>
  const active = Math.min(selected, bars.length - 1)
  const current = bars[active]

  return (
    <figure className="mt-4 min-w-0 border-t border-gray-300 pt-4" aria-labelledby={`${id}-title`}>
      <figcaption className="font-semibold" id={`${id}-title`}>
        평균 추정 매출 그래프
      </figcaption>
      <p className="mt-1 text-caption text-gray-600">
        각 상권 매출 ÷ 전체 {average.total_store_count}개 점포
      </p>
      <p className="text-caption text-gray-600">막대는 전체 평균에 반영되는 금액이에요.</p>
      <div
        className="mt-3 max-h-80 overflow-y-auto rounded-control border border-gray-300 bg-white p-3 print:max-h-none print:overflow-visible"
        style={{ printColorAdjust: 'exact' }}
        role="group"
        aria-label="전체 점포 수로 나눈 상권별 매출"
      >
        {bars.map((bar, index) => (
          <button
            key={key(bar)}
            ref={(node) => {
              buttons.current[index] = node
            }}
            type="button"
            className={`block w-full cursor-pointer rounded-control p-2 text-left focus-visible:outline-2 focus-visible:outline-blue-700 ${active === index ? 'bg-blue-100' : ''}`}
            tabIndex={active === index ? 0 : -1}
            aria-pressed={active === index}
            aria-label={`${bar.item!.market_name} · ${bar.item!.industry_name}: ${money(bar.metric.display)}, 전체 ${average.total_store_count}개 점포 기준`}
            onClick={() => setSelected(index)}
            onFocus={() => setSelected(index)}
            onKeyDown={(event) => {
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? bars.length - 1
                    : event.key === 'ArrowDown'
                      ? Math.min(index + 1, bars.length - 1)
                      : event.key === 'ArrowUp'
                        ? Math.max(index - 1, 0)
                        : null
              if (next !== null) {
                event.preventDefault()
                setSelected(next)
                buttons.current[next]?.focus()
              }
            }}
          >
            <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-caption">
              <span className="min-w-0 break-words">
                {bar.item!.market_name} · {bar.item!.industry_name}
              </span>
              <b className="break-all">{money(bar.metric.display)}</b>
            </span>
            <span className="mt-2 block h-2 rounded-full bg-gray-100" aria-hidden="true">
              <span
                className="block h-2 rounded-full bg-blue-500"
                style={{ width: `${mean === 0 ? 0 : (bar.value / mean) * 100}%` }}
              />
            </span>
          </button>
        ))}
      </div>
      <p
        className="mt-2 text-caption break-words print:hidden"
        aria-live="polite"
        aria-atomic="true"
      >
        {current.item!.market_name}: {current.item!.metric?.display} ÷ {average.total_store_count}개
        = <b>{money(current.metric.display)}</b>
      </p>
      <p className="mt-2 text-caption font-semibold">전체 평균 {money(average.metric?.display)}</p>
    </figure>
  )
}
