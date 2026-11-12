/**
 * 목업 공통 도우미. 모든 값은 시연용 가상 값이며 실제 공공데이터 검증 결과가 아니다.
 * (06 API 명세서 v1.1 응답 예시를 Spot:ON 범위 — 카페 + 음식점 4종, LQ 제외 — 에 맞게 고침)
 */
import type { ApiFranchiseClassification, ApiMeta, ApiSpace } from '../../types/api'
import type { FranchiseBasis, FranchiseStatus } from '../../types/stores'
import type { MockResult } from './index'

/** 가맹 분류 상태 — 개발 DB처럼 2025년 브랜드 목록 적용(estimate/partial) (BE 가맹 추정 요청서 4장) */
export const FRANCHISE_CLASSIFICATION: ApiFranchiseClassification = {
  status: 'estimate',
  reason: 'reference_catalog_name_match',
  reference_year: 2025,
  source: ['R7'],
  coverage: 'partial',
  historical_contract_verified: false,
  industry_mapping_verified: false,
}

/**
 * 목업 전용: 가맹 근거 — franchise는 목록명 일치 추정(2025), external이면 기존 외부 분류,
 * independent는 기존 외부 분류(false), unknown은 근거 없음
 */
export function franchiseBasis(
  franchise: FranchiseStatus,
  external = false,
): { franchise_basis: FranchiseBasis | null; franchise_reference_year: number | null } {
  if (franchise === 'unknown') return { franchise_basis: null, franchise_reference_year: null }
  if (franchise === 'independent' || external)
    return { franchise_basis: 'external_classification', franchise_reference_year: null }
  return { franchise_basis: 'catalog_exact_name', franchise_reference_year: 2025 }
}

/**
 * 목업 전용: 정보 없음 포함 플래그 (실제 BE와 같은 규칙)
 * - include_unknown(legacy)과 include_unknown_area·include_unknown_franchise를 섞으면 422
 * - true/false 문자열이 아니면 422, 생략하면 true
 */
export function unknownFlags(
  query: URLSearchParams,
): { area: boolean; franchise: boolean } | MockResult {
  const bad = () => fail(422, 'INVALID_PARAM', '요청 값을 확인해 주세요')
  const legacy = query.get('include_unknown')
  const areaRaw = query.get('include_unknown_area')
  const franchiseRaw = query.get('include_unknown_franchise')
  if (legacy !== null && (areaRaw !== null || franchiseRaw !== null)) return bad()
  const parse = (v: string | null) =>
    v === null ? true : v === 'true' ? true : v === 'false' ? false : null
  const area = parse(legacy ?? areaRaw)
  const franchise = parse(legacy ?? franchiseRaw)
  if (area === null || franchise === null) return bad()
  return { area, franchise }
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
  franchise_classification: FRANCHISE_CLASSIFICATION,
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
