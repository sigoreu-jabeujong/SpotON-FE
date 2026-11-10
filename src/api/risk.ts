import type { CommonQueryParams } from '../types/api'
import type { Risk, RiskInclude, RiskInterpretation, RiskInterpretRequest } from '../types/risk'
import { apiGet, apiPost } from './client'

/** F-07 공식 지표 + 참고지표 (GET /api/risk) */
export function getRisk(params: CommonQueryParams, include: RiskInclude[] = []) {
  return apiGet<Risk>('/risk', { ...params, include })
}

/** F-08 AI 해석 (POST /api/risk/interpret). 사용자가 "AI 해석 보기"를 눌렀을 때만 호출 */
export function postRiskInterpret(body: RiskInterpretRequest) {
  return apiPost<RiskInterpretation>('/risk/interpret', body)
}
