/**
 * API 공통 응답 형식 — 06 API 명세서 v1.2 기준 { data, meta, error }
 * ⚠️ 형식을 바꾸면 SpotON-BE와 반드시 함께 맞춘다 (명세서 선행 수정 원칙)
 */

/** 모든 응답에 공통으로 붙는 출처·기준 정보 */
export type ApiMeta = {
  /** 데이터 출처 (API v1.2: source는 문자열 배열) */
  source?: string[]
  /** 실제 적용된 기준 시점 (현재월 요청 시 서버가 확정) */
  effective_as_of?: string
  /** 집계 공간 단위 (반경/상권/격자 등) */
  space?: string
  /** 분모(표본 수) */
  denominator?: number
  /** 명세서에 추가되는 필드는 위에 타입으로 명시한 뒤 사용한다 */
  [key: string]: unknown
}

export type ApiError = {
  code: string
  message: string
}

export type ApiResponse<T> = {
  data: T | null
  meta: ApiMeta | null
  error: ApiError | null
}
