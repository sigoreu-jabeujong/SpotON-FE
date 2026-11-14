import type { CommonQueryParams } from '../types/api'
import type { Risk, RiskInclude, RiskInterpretation, RiskInterpretRequest } from '../types/risk'
import { apiGet, apiPost, DEFAULT_TIMEOUT_MS } from './client'

/** F-07 공식 지표 + 참고지표 (GET /api/risk) */
export function getRisk(params: CommonQueryParams, include: RiskInclude[] = []) {
  return apiGet<Risk>('/risk', { ...params, include })
}

/**
 * AI 해석 대기 시간 — 기본 요청 제한(45초)보다 짧지 않게 같은 값.
 * 서버 예산은 20초(DB 준비·생성·검증 재생성 1회)지만, 무료 BE는 DB 연결이 1개라 다른 요청 뒤에 줄을 서면
 * 그만큼 늦게 시작한다. 25초로 두면 서버가 오류 응답(503 등)을 보내기 전에 FE가 먼저 끊을 수 있다
 * (BE fe-risk-interpret-api-request.md 4장). 자동 재시도는 하지 않는다
 */
export const INTERPRET_TIMEOUT_MS = DEFAULT_TIMEOUT_MS

/**
 * F-08 AI 해석 (POST /api/risk/interpret). 사용자가 "AI 해석 보기"를 눌렀을 때만 호출.
 * 본문은 원래 조회 조건만 (query-only) — 자동 재호출하지 않고, 다시 시도는 사용자 버튼으로만
 */
export function postRiskInterpret(body: RiskInterpretRequest) {
  return apiPost<RiskInterpretation>('/risk/interpret', body, { timeoutMs: INTERPRET_TIMEOUT_MS })
}
