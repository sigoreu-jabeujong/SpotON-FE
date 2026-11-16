import { Info } from 'lucide-react'
import { BRAND_API_ENABLED } from '../../api/analysisProfile'
import { MESSAGES } from '../../constants/messages'
import { franchiseEstimateYear, type storeFranchise } from '../../utils/storeDisplay'

type Props = { rows: readonly Parameters<typeof storeFranchise>[0][] }

/**
 * 표 아래 안내 — 목록명 일치 추정 행이 있을 때만 (실제 계약·과거 소속 아님).
 * 브랜드·체인(v2)에서는 보이지 않는다: 추정이라는 사실은 표의 "브랜드·체인(추정)" 표시와 행별 근거 도움말에 남는다
 */
export default function FranchiseNote({ rows }: Props) {
  const year = franchiseEstimateYear(rows)
  if (BRAND_API_ENABLED || year === undefined) return null
  return (
    <p className="mt-2 flex max-w-[44em] items-start gap-1.5 text-caption leading-relaxed text-gray-600">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {MESSAGES.store.franchise.note(year)}
    </p>
  )
}
