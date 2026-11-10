import type { ApiArea } from '../types/api'

/**
 * Spot:ON 진단 조건 상수
 * 지원 업종 기준: SpotON-BE/docs/be-work-plan.md의 최종 개발 범위
 * 반경·시설 규모 등 나머지 조건은 API 명세서 v1.2와 대조 후 확정한다.
 */

/** 반경 선택값(m). 모든 수치의 공간 기준 */
export const RADIUS_OPTIONS = [300, 500, 1000] as const
export type RadiusMeters = (typeof RADIUS_OPTIONS)[number]
export const DEFAULT_RADIUS: RadiusMeters = 500

/** 서비스 업종 (API category) */
export const CATEGORIES = [
  { id: 'cafe', label: '카페' },
  { id: 'restaurant', label: '음식점' },
] as const
export type Category = (typeof CATEGORIES)[number]['id']

/** 음식점 세부 업종 (API sub_category) */
export const RESTAURANT_SUB_CATEGORIES = [
  { id: 'korean', label: '한식' },
  { id: 'chinese', label: '중식' },
  { id: 'japanese', label: '일식' },
  { id: 'western', label: '양식' },
] as const

/** 카페는 별도 세부 업종을 선택하지 않는다. */
export type SubCategory = (typeof RESTAURANT_SUB_CATEGORIES)[number]['id']

/**
 * 시설 규모 구간 (신고 면적 기준, 경계: 이상·미만). id는 API area 값과 같다.
 * API가 하나만 받으므로 단일 선택 (여러 개 선택은 BE 확인 후 결정 — docs/decisions.md)
 */
export const FACILITY_SIZE_OPTIONS = [
  { id: 'all', label: '전체', pyeong: null, range: '전체 면적' },
  { id: 'lt33', label: '33㎡ 미만', pyeong: '약 10평 미만', range: '33㎡ 미만' },
  { id: '33to66', label: '33~66㎡', pyeong: '약 10~20평', range: '33㎡ 이상 66㎡ 미만' },
  { id: '66to99', label: '66~99㎡', pyeong: '약 20~30평', range: '66㎡ 이상 99㎡ 미만' },
  { id: 'gte99', label: '99㎡ 이상', pyeong: '약 30평 이상', range: '99㎡ 이상' },
] as const satisfies readonly {
  id: ApiArea
  label: string
  /** 화면에 괄호로 붙이는 평 환산 (1평 ≈ 3.3058㎡) */
  pyeong: string | null
  range: string
}[]
export type FacilitySize = (typeof FACILITY_SIZE_OPTIONS)[number]['id']
export const DEFAULT_AREA: FacilitySize = 'all'

/** 면적·프랜차이즈 값이 "정보 없음"인 점포 포함 여부 (API include_unknown) */
export const DEFAULT_INCLUDE_UNKNOWN = true

/** 프랜차이즈 필터 */
export const FRANCHISE_OPTIONS = [
  { id: 'all', label: '전체' },
  { id: 'franchise', label: '프랜차이즈(추정)' },
  { id: 'independent', label: '개인 매장' },
] as const
export type FranchiseFilter = (typeof FRANCHISE_OPTIONS)[number]['id']
