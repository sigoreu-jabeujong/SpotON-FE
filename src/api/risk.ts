import type { CommonQueryParams } from '../types/api'
import type { Risk, RiskInclude, RiskInterpretation, RiskInterpretRequest } from '../types/risk'
import { apiGet, apiPost } from './client'

/** F-07 공식 지표 + 참고지표 (GET /api/risk) */
export function getRisk(params: CommonQueryParams, include: RiskInclude[] = []) {
  return apiGet<Risk>('/risk', { ...params, include })
}

/** AI 해석은 서버가 LLM을 부르고 검증까지 하므로 최대 20초까지 기다린다 (API 명세서 6장) */
const INTERPRET_TIMEOUT_MS = 20000

/** F-08 AI 해석 (POST /api/risk/interpret). 사용자가 "AI 해석 보기"를 눌렀을 때만 호출 */
export function postRiskInterpret(body: RiskInterpretRequest) {
  return apiPost<RiskInterpretation>('/risk/interpret', body, { timeoutMs: INTERPRET_TIMEOUT_MS })
}
