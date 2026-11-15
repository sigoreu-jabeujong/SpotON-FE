import { Info } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'

/**
 * 세부 업종 기준 안내 — 음식점을 고른 경우에만 (카페는 세부 업종이 없다).
 * 원본 인허가의 신고 업태 그대로라 치킨·커피집 등이 "한식"으로 나올 수 있다 — FE에서 이름으로 거르지 않고 안내만 한다
 */
export default function SubCategoryNote() {
  const { query } = useDiagnosisQuery()
  if (query.category !== 'restaurant') return null
  return (
    <p className="mt-2 flex max-w-[44em] items-start gap-1.5 text-caption leading-relaxed text-gray-600">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {MESSAGES.store.subCategoryBasis}
    </p>
  )
}
