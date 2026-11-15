import { History } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import type { DataRange } from '../../types/meta'
import { cn } from '../../utils/cn'
import { isMonthInRange, parseYearMonth, shiftMonth, toYearMonth } from '../../utils/date'
import { formatDate } from '../../utils/format'

const T = MESSAGES.filter

type Props = {
  /** 고른 기준 시점 YYYY-MM. null = 현재 */
  value: string | null
  onChange: (asOf: string | null) => void
  /** /meta/data-range 결과. 없으면(로딩·오류) 시점 선택 비활성 */
  range: DataRange | null
  status: 'loading' | 'error' | 'ready'
}

/**
 * 기준 시점 선택 — 현재 / 연도 + 월 / 빠른 선택(1·3·5년 전).
 * min_month ~ max_month 밖의 연·월·빠른 선택은 비활성. "조회"를 눌러야 반영된다.
 */
export default function AsOfPicker({ value, onChange, range, status }: Props) {
  // 최소 월이 null이면(유효 표본 없음) 과거 월·빠른 선택을 막고 "현재"만 둔다
  const noPast = status === 'ready' && !!range && !range.min_month
  const disabled = status !== 'ready' || !range || noPast
  const selected = parseYearMonth(value)
  const min = parseYearMonth(range?.min_month)
  const max = parseYearMonth(range?.max_month)

  const years: number[] = []
  if (min && max) for (let y = max.year; y >= min.year; y--) years.push(y)
  const inRange = (ym: string) => !!range && isMonthInRange(ym, range.min_month, range.max_month)

  /** 연도를 바꾸면 같은 월을 유지하되, 범위 밖이면 그 해의 가장 가까운 월로 맞춘다 */
  const changeYear = (year: number) => {
    if (!range || !min || !max) return
    let month = selected?.month ?? max.month
    if (year === min.year && month < min.month) month = min.month
    if (year === max.year && month > max.month) month = max.month
    onChange(toYearMonth(year, month))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
          className={cn(
            'inline-flex h-10 items-center rounded-full border px-4 text-caption font-semibold motion-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
            value === null
              ? 'border-blue-500 bg-blue-100 text-blue-700'
              : 'border-gray-300 text-gray-900 hover:bg-gray-100',
          )}
        >
          {T.asOfCurrent}
        </button>

        <label className="sr-only" htmlFor="as-of-year">
          {T.asOf} {T.asOfYear}
        </label>
        <select
          id="as-of-year"
          disabled={disabled}
          value={selected?.year ?? ''}
          onChange={(e) => changeYear(Number(e.target.value))}
          className={selectClass(value !== null)}
        >
          <option value="" disabled>
            {T.asOfYear}
          </option>
          {years.map((y) => (
            <option key={y} value={y}>
              {T.asOfYearOption(y)}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="as-of-month">
          {T.asOf} {T.asOfMonth}
        </label>
        <select
          id="as-of-month"
          disabled={disabled || !selected}
          value={selected?.month ?? ''}
          onChange={(e) => selected && onChange(toYearMonth(selected.year, Number(e.target.value)))}
          className={selectClass(value !== null)}
        >
          <option value="" disabled>
            {T.asOfMonth}
          </option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const ok = selected ? inRange(toYearMonth(selected.year, m)) : false
            return (
              <option key={m} value={m} disabled={!ok}>
                {T.asOfMonthOption(m)}
                {!ok && selected ? ` (${T.asOfOutOfRangeHint})` : ''}
              </option>
            )
          })}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <History className="size-3.5 text-gray-600" aria-hidden="true" />
        {T.asOfQuick.map((q) => {
          const target = range ? shiftMonth(range.max_month, -q.months) : null
          const ok = !!target && inRange(target)
          return (
            <button
              key={q.label}
              type="button"
              disabled={disabled || !ok}
              aria-pressed={!!target && value === target}
              onClick={() => target && onChange(target)}
              className="inline-flex h-8 items-center rounded-full px-3 text-micro font-semibold text-blue-700 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:text-gray-300 aria-pressed:bg-blue-100"
            >
              {q.label}
            </button>
          )
        })}
      </div>

      {status === 'loading' && <p className="text-micro text-gray-600">{T.asOfLoading}</p>}
      {status === 'error' && (
        <p role="status" className="text-micro text-danger">
          {T.asOfUnavailable}
        </p>
      )}
      {noPast && <p className="text-micro text-gray-600">{T.asOfNoPast}</p>}
      {status === 'ready' && range?.min_month && (
        <p className="text-micro text-gray-600">
          {T.asOfRange(formatDate(range.min_month) ?? '', formatDate(range.max_month) ?? '')}
        </p>
      )}
    </div>
  )
}

function selectClass(active: boolean) {
  return cn(
    'h-10 rounded-full border bg-gray-0 px-3 text-caption font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600',
    active ? 'border-blue-500 text-blue-700' : 'border-gray-300 text-gray-900',
  )
}
