import { INDICATOR_NAME } from '../../../constants/labels'
import { MESSAGES } from '../../../constants/messages'
import type { IndicatorId } from '../../../types/risk'

/**
 * AI 근거 칩 표시 — 이름과 이동할 지표 카드.
 * - Risk 지표 ID(종합 진단 화면에 카드가 있음) → 지표 이름 + 그 카드로 이동
 * - 상권 활동 참고 계산 ID(recent_open_close·avg_operating_months) → 이름만, 이동하지 않음
 *   (해당 카드는 STEP 02에 있어 옮겨 가면 지금 보고 있는 AI 해석이 사라지므로)
 * - 이름 표에 없는 새 ID → "기타 근거" (영문 코드를 화면에 보이지 않게), 이동하지 않음
 */
export function evidenceChip(id: string): { label: string; target: IndicatorId | null } {
  // 객체 기본 속성(toString 등)을 지표로 오인하지 않게 자기 속성만 본다
  if (Object.hasOwn(INDICATOR_NAME, id))
    return { label: INDICATOR_NAME[id as keyof typeof INDICATOR_NAME], target: id as IndicatorId }
  if (Object.hasOwn(MESSAGES.ai.evidenceNames, id))
    return { label: MESSAGES.ai.evidenceNames[id], target: null }
  return { label: MESSAGES.ai.otherEvidence, target: null }
}
