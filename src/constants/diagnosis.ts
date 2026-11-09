/**
 * Spot:ON 진단 조건 상수
 * 기준: 팀 회의 논의사항(API 명세서 v1.2 업종 ID) · 분석 로직 정의서 4-4
 * ⚠️ 회의 확정 전 값 포함 — 확정되면 이 파일만 수정한다.
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
  { id: 'snack', label: '분식' },
  { id: 'chicken', label: '치킨·호프' }, // 표시명 회의 확정 필요
  { id: 'pub', label: '주점' },
  { id: 'etc', label: '기타' },
] as const

/** 카페 세부 업종. kids_cafe·live_cafe는 사용자가 직접 선택할 때만 포함 */
export const CAFE_SUB_CATEGORIES = [
  { id: 'cafe', label: '카페', defaultSelected: true },
  { id: 'kids_cafe', label: '키즈카페', defaultSelected: false },
  { id: 'live_cafe', label: '라이브카페', defaultSelected: false },
] as const

export type SubCategory =
  (typeof RESTAURANT_SUB_CATEGORIES)[number]['id'] | (typeof CAFE_SUB_CATEGORIES)[number]['id']

/** 시설 규모 구간 (신고 면적 기준, 경계: 이상·미만) */
export const FACILITY_SIZE_OPTIONS = [
  { id: 'lt33', label: '10평 미만', range: '33㎡ 미만' },
  { id: '33to66', label: '10~20평', range: '33㎡ 이상 66㎡ 미만' },
  { id: '66to99', label: '20~30평', range: '66㎡ 이상 99㎡ 미만' },
  { id: 'gte99', label: '30평 이상', range: '99㎡ 이상' },
  { id: 'unknown', label: '정보 없음', range: '면적 정보 없음' },
] as const
export type FacilitySize = (typeof FACILITY_SIZE_OPTIONS)[number]['id']

/** 프랜차이즈 필터 */
export const FRANCHISE_OPTIONS = [
  { id: 'all', label: '전체' },
  { id: 'franchise', label: '프랜차이즈' },
  { id: 'independent', label: '개인 매장' },
] as const
export type FranchiseFilter = (typeof FRANCHISE_OPTIONS)[number]['id']
