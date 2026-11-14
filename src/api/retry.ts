import { ApiRequestError } from './client'

/** 자동 재시도 대상 — 서버 응답을 못 받은 경우(시간 초과·연결 실패)만. 무료 BE가 줄을 서다 늦은 경우가 대부분 */
const RETRYABLE_CODES: ReadonlySet<string> = new Set(['TIMEOUT', 'NETWORK_ERROR'])

/** 자동 재시도는 1번만 */
export const MAX_AUTO_RETRY = 1

/**
 * 조회(GET, TanStack Query의 query)가 실패했을 때 자동으로 한 번 더 부를지.
 * - TIMEOUT·NETWORK_ERROR만, 1번까지 (재시도 중에도 화면은 로딩 상태 그대로 — 오류 화면이 깜빡이지 않는다)
 * - 서버가 보낸 오류 응답(4xx 입력 오류·5xx 공통 오류)은 다시 불러도 같으므로 재시도하지 않는다
 * - POST(AI 해석)·주소 검색은 mutation이라 이 규칙을 쓰지 않는다 (자동 재시도 없음, 기존 결정)
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_AUTO_RETRY) return false
  return error instanceof ApiRequestError && RETRYABLE_CODES.has(error.code)
}
