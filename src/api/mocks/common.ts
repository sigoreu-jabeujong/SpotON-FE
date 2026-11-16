/**
 * 목업 공통 도우미. 모든 값은 시연용 가상 값이며 실제 공공데이터 검증 결과가 아니다.
 * (06 API 명세서 v1.1 응답 예시를 Spot:ON 범위 — 카페 + 음식점 4종, LQ 제외 — 에 맞게 고침)
 */
import type { ApiMeta, ApiSpace } from '../../types/api'
import type { MockResult } from './index'

/**
 * 목업 전용: 정보 없음 포함 플래그 (실제 BE와 같은 규칙)
 * - include_unknown(legacy)과 include_unknown_area·include_unknown_franchise를 섞으면 422
 * - true/false 문자열이 아니면 422, 생략하면 true
 */
export function unknownFlags(query: URLSearchParams): { area: boolean } | MockResult {
  const bad = () => fail(422, 'INVALID_PARAM', '요청 값을 확인해 주세요')
  const legacy = query.get('include_unknown')
  const areaRaw = query.get('include_unknown_area')
  if (legacy !== null && areaRaw !== null) return bad()
  const parse = (v: string | null) =>
    v === null ? true : v === 'true' ? true : v === 'false' ? false : null
  const area = parse(legacy ?? areaRaw)
  if (area === null) return bad()
  return { area }
}

/** unknownFlags 결과가 오류(MockResult)인지 */
export const isMockResult = (v: unknown): v is MockResult =>
  typeof v === 'object' && v !== null && 'status' in v && 'body' in v

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

/**
 * 목업 전용: 화면 주소의 bk·address에 "v142"가 있으면 BE #142(2026-11-15) 이후 응답 —
 * /risk에서 official_closure_rate·official_risk가 빠진다 (공식 영역 숨김 확인용)
 */
export function beV142Scenario(): boolean {
  if (typeof window === 'undefined') return false
  const q = new URLSearchParams(window.location.search)
  return /v142/i.test(`${q.get('bk') ?? ''} ${q.get('address') ?? ''}`)
}

/** BE #142: 연도별 개폐업 추이는 2010년부터만 반환한다 (그 이전 연도는 만들지 않음) */
export const TREND_MIN_YEAR = 2010
