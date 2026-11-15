import { describe, expect, it } from 'vitest'
import { ApiRequestError, COLD_START_TIMEOUT_MS, DEFAULT_TIMEOUT_MS } from './client'
import { INTERPRET_TIMEOUT_MS } from './risk'
import { MAX_AUTO_RETRY, shouldRetryQuery } from './retry'

const err = (code: string, status: number | null) => new ApiRequestError(code, code, status)

describe('조회 자동 재시도 규칙', () => {
  it('시간 초과·연결 실패는 1번만 다시 부른다', () => {
    expect(shouldRetryQuery(0, err('TIMEOUT', null))).toBe(true)
    expect(shouldRetryQuery(0, err('NETWORK_ERROR', null))).toBe(true)
    expect(shouldRetryQuery(1, err('TIMEOUT', null))).toBe(false)
    expect(MAX_AUTO_RETRY).toBe(1)
  })

  it('서버가 보낸 오류 응답(4xx 입력 오류·5xx 공통 오류)은 다시 부르지 않는다', () => {
    expect(shouldRetryQuery(0, err('INVALID_PARAM', 422))).toBe(false)
    expect(shouldRetryQuery(0, err('AS_OF_OUT_OF_RANGE', 422))).toBe(false)
    expect(shouldRetryQuery(0, err('INTERNAL_ERROR', 500))).toBe(false)
    expect(shouldRetryQuery(0, err('UPSTREAM_ERROR', 502))).toBe(false)
    expect(shouldRetryQuery(0, err('INVALID_RESPONSE', 503))).toBe(false)
  })

  it('ApiRequestError가 아닌 오류(화면 코드 오류 등)는 다시 부르지 않는다', () => {
    expect(shouldRetryQuery(0, new Error('boom'))).toBe(false)
  })
})

describe('요청 제한 시간', () => {
  it('기본 45초, 첫 요청(깨우기·첫 주소 검색) 60초', () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(45000)
    expect(COLD_START_TIMEOUT_MS).toBe(60000)
  })

  it('AI 해석은 기본 제한보다 짧지 않다', () => {
    expect(INTERPRET_TIMEOUT_MS).toBeGreaterThanOrEqual(DEFAULT_TIMEOUT_MS)
  })
})
