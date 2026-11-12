import type { FranchiseFilter } from '../../constants/diagnosis'
import { MESSAGES } from '../../constants/messages'
import type { ApiMeta } from '../../types/api'
import InfoBox from './InfoBox'

type Props = { franchise: FranchiseFilter; meta: ApiMeta | null | undefined; className?: string }

/**
 * 가맹 필터(프랜차이즈·개인 매장)를 골랐을 때 수치의 기준 안내 — 상권 활동·종합 진단 공통.
 * - 분류 미적용(pending): 분류 확인 중
 * - 프랜차이즈: 브랜드 목록 상호 일치로 고른 점포의 계산 (실제 가맹계약·과거 코호트 아님)
 * - 개인 매장: 분류 자료가 거의 없어 0곳으로 보일 수 있음 (점포 부재 아님)
 */
export default function FranchiseFilterNotice({ franchise, meta, className }: Props) {
  if (franchise === 'all') return null
  const F = MESSAGES.store.franchise
  const A = MESSAGES.activity
  const c = meta?.franchise_classification
  if (c?.status === 'pending')
    return (
      <InfoBox
        showTitle
        title={A.franchisePendingTitle}
        description={A.franchisePending}
        className={className}
      />
    )
  return (
    <InfoBox
      showTitle
      title={F.filterNoticeTitle}
      description={
        franchise === 'independent'
          ? F.filterIndependent
          : F.filterFranchise(c?.reference_year ?? null)
      }
      className={className}
    />
  )
}
