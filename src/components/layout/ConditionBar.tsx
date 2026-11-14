import { History, MapPin, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router'
import {
  CATEGORIES,
  FACILITY_SIZE_OPTIONS,
  FRANCHISE_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
} from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { formatYearMonthKo } from '../../utils/format'
import { cn } from '../../utils/cn'

const T = MESSAGES.conditionBar

/**
 * 진단 대상 요약 바 (STEP 02~04 공통, 화면 제목 아래에 붙어 있음).
 * 주소·업종·반경·기준 시점·필터를 칩으로 보여주고, 입력 화면으로 돌아가 조건을 바꿀 수 있다.
 * 값은 URL 쿼리(useDiagnosisQuery)에서만 가져오고 API를 새로 부르지 않는다.
 */
export default function ConditionBar() {
  const { query, search } = useDiagnosisQuery()
  const category = CATEGORIES.find((c) => c.id === query.category)?.label
  const subs = RESTAURANT_SUB_CATEGORIES.filter((s) => query.subCategories.includes(s.id))
    .map((s) => s.label)
    .join('·')
  const area =
    query.area !== 'all' ? FACILITY_SIZE_OPTIONS.find((a) => a.id === query.area)?.label : null
  const franchise =
    query.franchise !== 'all'
      ? FRANCHISE_OPTIONS.find((f) => f.id === query.franchise)?.label
      : null
  const past = formatYearMonthKo(query.asOf)
  const barRef = useRef<HTMLElement>(null)

  // 실제 높이를 CSS 변수로 알려 표 머리글이 이 바 바로 아래에 붙게 한다 (칩이 두 줄이 되어도)
  useLayoutEffect(() => {
    const el = barRef.current
    if (!el) return
    const root = document.documentElement
    const apply = () => root.style.setProperty('--condition-bar-h', `${el.offsetHeight}px`)
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--condition-bar-h')
    }
  }, [])

  return (
    <section
      ref={barRef}
      aria-label={T.label}
      className="sticky top-0 z-20 border-b border-gray-300 bg-bg/95 px-4 py-2.5 backdrop-blur sm:px-10"
    >
      <div className="flex max-w-[1080px] flex-wrap items-center justify-between gap-4">
        <ul className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Chip icon={MapPin} strong>
            {query.address}
            {query.floorUnit && ` ${query.floorUnit}`}
          </Chip>
          {category && <Chip>{subs ? `${category} (${subs})` : category}</Chip>}
          <Chip>{T.radius(query.radius)}</Chip>
          {past ? (
            // 과거 시점이면 STEP 02의 "과거 시점" 안내와 같은 주황 계열로 한눈에 알 수 있게
            <Chip icon={History} tone="past">
              {T.asOfPast(past)} · {T.pastNotice}
            </Chip>
          ) : (
            <Chip>{T.asOfCurrent}</Chip>
          )}
          {area && <Chip>{T.area(area)}</Chip>}
          {franchise && <Chip>{T.franchise(franchise)}</Chip>}
          {!query.includeUnknown && <Chip>{T.excludeUnknown}</Chip>}
        </ul>
        <Link
          to={{ pathname: ROUTES.input, search }}
          title={T.editHint}
          className="group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gray-0 px-4 text-caption font-semibold text-blue-700 ring-1 ring-blue-500/40 motion-colors ring-inset hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {T.edit}
        </Link>
      </div>
    </section>
  )
}

function Chip({
  icon: Icon,
  strong,
  tone,
  children,
}: {
  icon?: LucideIcon
  strong?: boolean
  tone?: 'past'
  children: ReactNode
}) {
  return (
    <li
      className={cn(
        'inline-flex min-w-0 items-center gap-1 rounded-full border px-3 py-1 text-caption',
        tone === 'past'
          ? 'border-orange-500/40 bg-orange-100 font-semibold text-orange-700'
          : 'border-gray-300 bg-gray-0 text-gray-900',
        strong && 'font-semibold',
      )}
    >
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </li>
  )
}
