import type { ApiResponse } from '../../types/api'

/**
 * 목업 응답 등록소. VITE_USE_MOCK=true 일 때 실제 서버 대신 사용한다.
 * 경로(쿼리 제외)를 키로, API 명세서 v1.2의 예시 응답을 값으로 등록한다.
 * 예) mockRoutes['/meta/data-range'] = { data: {...}, meta: {...}, error: null }
 */
const mockRoutes: Record<string, ApiResponse<unknown>> = {}

export function getMockResponse<T>(path: string): ApiResponse<T> | null {
  const key = path.split('?')[0]
  return (mockRoutes[key] as ApiResponse<T> | undefined) ?? null
}
