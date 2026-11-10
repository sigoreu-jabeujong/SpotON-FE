/**
 * 결과 상태 라벨 (분석 로직 정의서 5장, docs/display-rules.md)
 * 키는 API의 status 값과 같다. 모든 수치에는 아래 상태 중 하나를 함께 표시한다.
 */
export const DATA_STATUS = {
  fact: { label: '확인된 사실', tone: 'neutral' },
  estimate: { label: '통계적 추정', tone: 'info' },
  no_data: { label: '자료 없음', tone: 'muted' },
  pending: { label: '판단 보류', tone: 'warning' },
  unknown: { label: '정보 없음', tone: 'muted' },
  location_unverified: { label: '상세 위치 미확인', tone: 'warning' },
  /** official_risk 링크 안내 전용 — BE 보완안, 확인 대기 */
  link_only: { label: '공식 사이트에서 확인', tone: 'info' },
} as const
export type DataStatus = keyof typeof DATA_STATUS

/** 지표 구분: 공식 지표와 Spot:ON 참고지표는 항상 분리해 표시 */
export const INDICATOR_TYPE = {
  official: '서울시 공식',
  reference: 'Spot:ON 참고지표',
} as const
export type IndicatorType = keyof typeof INDICATOR_TYPE

/** 업종 표시 이름 (API sub_category / category) — 지원 업종만 */
export const SUB_CATEGORY_LABEL = {
  cafe: '카페',
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
} as const

/** 점포 영업 상태 (API store_status·current_status) */
export const STORE_STATUS_LABEL = {
  open: '영업 중',
  closed: '폐업',
  other: '기타(휴업 등)',
} as const

/** 위치 일치 (API location_match). unverified는 StatusLabel(location_unverified)로 표시 */
export const LOCATION_MATCH_LABEL = {
  same_spot: '같은 자리',
  same_building: '같은 건물 다른 위치',
  unverified: '상세 위치 미확인',
} as const

/** 프랜차이즈 (API franchise). "가맹/비가맹" 표현은 쓰지 않는다 */
export const FRANCHISE_LABEL = {
  franchise: '프랜차이즈(추정)',
  independent: '개인 매장',
  unknown: '정보 없음',
} as const
