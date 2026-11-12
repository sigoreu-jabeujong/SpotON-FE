import type { CommonQueryParams } from '../types/api'
import type { Risk, RiskInclude, RiskInterpretation, RiskInterpretRequest } from '../types/risk'
import { apiGet, apiPost } from './client'

/** F-07 공식 지표 + 참고지표 (GET /api/risk) */
export function getRisk(params: CommonQueryParams, include: RiskInclude[] = []) {
  return apiGet<Risk>('/risk', { ...params, include })
}

/**
 * AI 해석 대기 시간. 서버 예산이 20초(DB 준비·생성·검증 재생성 1회 포함)라
 * 서버의 오류 응답(503 등)을 받을 수 있게 FE는 5초 여유를 둔다 (BE fe-risk-interpret-api-request.md 4장)
 */
const INTERPRET_TIMEOUT_MS = 25000

/**
 * F-08 AI 해석 (POST /api/risk/interpret). 사용자가 "AI 해석 보기"를 눌렀을 때만 호출.
 * 본문은 원래 조회 조건만 (query-only) — 자동 재호출하지 않고, 다시 시도는 사용자 버튼으로만
 */
export function postRiskInterpret(body: RiskInterpretRequest) {
  return apiPost<RiskInterpretation>('/risk/interpret', body, { timeoutMs: INTERPRET_TIMEOUT_MS })
}
