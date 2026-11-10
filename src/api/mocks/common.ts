/**
 * 목업 공통 도우미. 모든 값은 시연용 가상 값이며 실제 공공데이터 검증 결과가 아니다.
 * (06 API 명세서 v1.1 응답 예시를 Spot:ON 범위 — 카페 + 음식점 4종, LQ 제외 — 에 맞게 고침)
 */
import type { ApiMeta, ApiSpace } from '../../types/api'
import type { MockResult } from './index'

/** 시연용 기본 meta (is_demo: true) */
export const DEMO_META: ApiMeta = {
  source: ['R5', 'R6'],
  as_of: '2026-10-31',
  space: 'radius_500m',
  denominator: null,
  data_updated_at: '2026-11-08',
  collected_at: '2026-11-09',
  is_demo: true,
  data_version: {
    stores_batch_ids: ['rest_20261108-0300', 'general_20261109-0300'],
    trdar_quarter: null,
    map_version: 'v1.1',
    rule_version: 'v1.1',
  },
}

export function ok<T>(data: T, meta: ApiMeta = DEMO_META): MockResult {
  return { status: 200, body: { data, meta, error: null } }
}

export function fail(
  status: number,
  code: string,
  message: string,
  detail: Record<string, unknown> | null = null,
): MockResult {
  return { status, body: { data: null, meta: null, error: { code, message, detail } } }
}

/** 목업 전용: YYYY-MM → 그 달 말일 YYYY-MM-DD (없으면 시연 기준일) */
export function monthEnd(asOf: string | null): string {
  if (!asOf) return '2026-10-31'
  const [y, m] = asOf.split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return `${asOf}-${String(last).padStart(2, '0')}`
}

/** 목업 전용: 요청 radius → 공간 단위 */
export function radiusSpace(query: URLSearchParams): { radius: number; space: ApiSpace } {
  const radius = Number(query.get('radius') ?? 500) || 500
  return { radius, space: `radius_${radius}m` }
}

export const isRestaurant = (query: URLSearchParams) => query.get('category') === 'restaurant'
