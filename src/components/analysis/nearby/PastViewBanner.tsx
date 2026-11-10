import { History, RotateCcw } from 'lucide-react'
import { MESSAGES } from '../../../constants/messages'
import { useDiagnosisQuery } from '../../../hooks/useDiagnosisQuery'
import { formatYearMonthKo } from '../../../utils/format'

/**
 * 과거 시점을 보고 있을 때 섹션 위에 눈에 띄게 알려 준다.
 * "현재로 돌아가기"는 필터 바 밖의 바로 실행 버튼이라 누르면 즉시 URL asOf를 지운다.
 */
export default function PastViewBanner() {
  const { query, updateQuery } = useDiagnosisQuery()
  const label = formatYearMonthKo(query.asOf)
  if (!label) return null
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-orange-500/40 bg-orange-100 px-4 py-3"
    >
      <div className="flex items-start gap-2">
        <History className="mt-0.5 size-5 shrink-0 text-orange-700" aria-hidden="true" />
        <div>
          <p className="text-body font-bold text-orange-700">{MESSAGES.nearby.pastView(label)}</p>
          <p className="text-caption text-gray-900">{MESSAGES.nearby.pastViewHint}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => updateQuery({ asOf: null })}
        className="flex h-9 items-center gap-1.5 rounded-full bg-gray-0 px-4 text-caption font-semibold text-orange-700 ring-1 ring-orange-500/40 hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        {MESSAGES.filter.asOfBackToCurrent}
      </button>
    </div>
  )
}
