import type { RiskInterpretation } from '../../../types/risk'

export type ChecklistItem = RiskInterpretation['checklist'][number]

/**
 * 서버가 보낸 계약 전 확인사항 그대로 (FE가 만들거나 고치지 않는다).
 * 배열이 없거나 항목 글자가 비어 있으면 뺀다 → 남는 항목이 없으면 화면·진단서에서 블록을 숨긴다
 */
export function checklistItems(
  result: Pick<RiskInterpretation, 'checklist'> | null | undefined,
): ChecklistItem[] {
  return (result?.checklist ?? []).filter((c) => !!c?.item?.trim())
}

/** 진단서 한 줄: "□ 항목 (이유)" — 이유가 없으면 "□ 항목" */
export function reportChecklistLine(c: ChecklistItem): string {
  const why = c.why?.trim()
  return why ? `□ ${c.item} (${why})` : `□ ${c.item}`
}
