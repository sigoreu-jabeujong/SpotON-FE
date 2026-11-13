import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import {
  FACILITY_SIZE_OPTIONS,
  FRANCHISE_OPTIONS,
  RESTAURANT_SUB_CATEGORIES,
} from '../../../constants/diagnosis'
import { MESSAGES } from '../../../constants/messages'
import { useDiagnosisQuery } from '../../../hooks/useDiagnosisQuery'
import { cn } from '../../../utils/cn'
import { formatYearMonthKo } from '../../../utils/format'

const T = MESSAGES.filter

type Props = {
  open: boolean
  onToggle: () => void
  /** 펼쳐지는 조건 패널 id (aria-controls) */
  panelId: string
}

/**
 * 지금 적용된 조회 조건 칩 + [조건 변경] 버튼 (주변 점포 탭).
 * 값은 URL 쿼리에서만 읽고, 바꾸는 일은 아래 패널(ConditionFilterBar, 기존 필터 그대로)이 한다.
 */
export default function FilterSummary({ open, onToggle, panelId }: Props) {
  const { query } = useDiagnosisQuery()
  const subs = RESTAURANT_SUB_CATEGORIES.filter((s) => query.subCategories.includes(s.id))
    .map((s) => s.label)
    .join('·')
  const area = FACILITY_SIZE_OPTIONS.find((a) => a.id === query.area)?.label
  const franchise = FRANCHISE_OPTIONS.find((f) => f.id === query.franchise)?.label
  const chips: { key: string; name: string; value: string }[] = [
    { key: 'radius', name: T.radius, value: `${query.radius.toLocaleString('ko-KR')}m` },
    ...(query.category === 'restaurant'
      ? [{ key: 'sub', name: T.subCategory, value: subs || T.chipAll }]
      : []),
    { key: 'area', name: T.area, value: area ?? T.chipAll },
    { key: 'franchise', name: T.franchise, value: franchise ?? T.chipAll },
    { key: 'asOf', name: T.asOf, value: formatYearMonthKo(query.asOf) ?? T.asOfCurrent },
    {
      key: 'unknown',
      name: T.chipUnknown,
      value: query.includeUnknown ? T.chipInclude : T.chipExclude,
    },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-stack-2">
      <ul aria-label={T.chipsLabel} className="flex min-w-0 flex-wrap gap-stack-1">
        {chips.map((c) => (
          <li
            key={c.key}
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-caption text-gray-900"
          >
            <span className="text-gray-600">{c.name}</span>
            <span className="font-semibold">{c.value}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-stack-2 text-caption font-semibold motion-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
          open
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-500/15'
            : 'border border-blue-500 bg-gray-0 text-blue-700 hover:bg-blue-100',
        )}
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {T.change}
        <ChevronDown
          className={cn('size-4 motion-colors', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
