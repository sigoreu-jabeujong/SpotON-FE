import { DATA_STATUS } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import type { ApiMeta } from '../../../types/api'
import type { ActivityInclude, MarketActivity } from '../../../types/market'
import { indicatorReasonText } from '../../summary/indicatorFormat'

/**
 * 상권 활동 선택 항목(추정매출·생활인구)의 표시 상태 — 화면 블록과 출력용 진단서가 같이 쓴다.
 * - data: 값이 있음
 * - pending: 서버가 확인 중(meta.optional_data[item].status = pending) → "자료 확인 중" + 사유 문구
 * - no_data: 값이 없음 → "자료 없음"
 * 값이 없을 때 숫자(0 등)를 만들지 않는다.
 */
export type OptionalDataState =
  { kind: 'data' } | { kind: 'pending' | 'no_data'; label: string; reason: string }

export function optionalDataState(
  activity: MarketActivity,
  meta: ApiMeta | null | undefined,
  item: ActivityInclude,
): OptionalDataState {
  const value = item === 'sales' ? activity.sales : activity.living_pop
  if (value && !(activity.flags?.missing ?? []).includes(item)) return { kind: 'data' }
  const status = meta?.optional_data?.[item]
  if (status?.status === 'pending')
    return {
      kind: 'pending',
      label: MESSAGES.activity.pendingData,
      reason: indicatorReasonText(status.reason ?? null) ?? MESSAGES.summary.reasonUnknown,
    }
  return {
    kind: 'no_data',
    label: DATA_STATUS.no_data.label,
    reason: MESSAGES.activity.missingData,
  }
}
