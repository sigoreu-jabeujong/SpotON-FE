import { ChartColumn, History, MapPin, type LucideIcon } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { MESSAGES } from '../../constants/messages'
import {
  analysisPanelId as panelId,
  analysisTabId as tabId,
  ANALYSIS_SECTIONS,
  type AnalysisSectionId,
} from '../../constants/routes'
import { cn } from '../../utils/cn'

const ICON: Record<AnalysisSectionId, LucideIcon> = {
  history: History,
  nearby: MapPin,
  activity: ChartColumn,
}
const IDS = ANALYSIS_SECTIONS.map((s) => s.id)

type Props = {
  active: AnalysisSectionId
  onSelect: (id: AnalysisSectionId) => void
}

/**
 * STEP 02 탭 바 — 진단 조건 바 바로 아래에 붙어 있다.
 * 키보드: 왼쪽·오른쪽 화살표로 이전·다음 탭(끝에서 돌아감), Home·End로 처음·마지막 탭 (고르면 바로 열림)
 */
export default function AnalysisTabs({ active, onSelect }: Props) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = IDS.indexOf(active)
    const next =
      e.key === 'ArrowRight'
        ? IDS[(i + 1) % IDS.length]
        : e.key === 'ArrowLeft'
          ? IDS[(i - 1 + IDS.length) % IDS.length]
          : e.key === 'Home'
            ? IDS[0]
            : e.key === 'End'
              ? IDS[IDS.length - 1]
              : null
    if (!next) return
    e.preventDefault()
    onSelect(next)
    document.getElementById(tabId(next))?.focus()
  }

  return (
    <div className="sticky top-condition-bar z-10 -mx-10 border-b border-gray-300 bg-bg/95 px-10 backdrop-blur">
      <div
        role="tablist"
        aria-label={MESSAGES.analysisTabs.label}
        onKeyDown={onKeyDown}
        className="flex gap-stack-1"
      >
        {ANALYSIS_SECTIONS.map((s) => {
          const selected = s.id === active
          const Icon = ICON[s.id]
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={tabId(s.id)}
              aria-selected={selected}
              aria-controls={panelId(s.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(s.id)}
              className={cn(
                '-mb-px inline-flex h-13 items-center gap-stack-1 border-b-2 px-stack-2 text-subtitle font-semibold motion-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-blue-500',
                selected
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900',
              )}
            >
              <Icon className="size-4.5" aria-hidden="true" />
              {s.tab}
            </button>
          )
        })}
      </div>
    </div>
  )
}
