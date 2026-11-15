import type { IndicatorId, RiskIndicator } from '../../types/risk'

/**
 * [서울시 공식 지표] 영역의 지표와 순서. BE #142(2026-11-15)부터 official_closure_rate·official_risk는
 * 응답에서 빠질 수 있다 — 오면 지금처럼 보여주고, 없으면 그 카드·줄을 그리지 않는다 (0·"정보 없음"으로 채우지 않음)
 */
export const OFFICIAL_IDS = ['official_closure_rate', 'official_risk', 'market_change'] as const

/** 응답에 실제로 있는 공식 지표만 (고정 순서). 하나도 없으면 빈 배열 → 영역 자체를 숨긴다 */
export function presentOfficialIndicators(indicators: readonly RiskIndicator[] | null | undefined) {
  const list = indicators ?? []
  return OFFICIAL_IDS.map((id) => list.find((i) => i.id === id)).filter(
    (i): i is RiskIndicator => !!i,
  )
}

/** 이 지표가 응답에 있는지 (없으면 화면·진단서·요약 이미지에서 그 칸을 뺀다) */
export function hasIndicator(
  indicators: readonly RiskIndicator[] | null | undefined,
  id: IndicatorId,
): boolean {
  return (indicators ?? []).some((i) => i.id === id)
}
