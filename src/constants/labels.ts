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

/**
 * 주변·시점 점포의 상태 (API current_status) — **최신 데이터 기준** 상태다 (오늘 실시간 확인이 아님).
 * 그래서 제목·범례·열 이름에 "최신 데이터 기준"을 붙이고, 라벨 자체는 짧게 둔다
 */
export const CURRENT_STATUS_LABEL = {
  open: '영업 중',
  closed: '폐업',
  other: '기타(휴업 등)',
} as const

/** 종합 진단 지표 이름 (API indicators[].id). LQ는 범위 제외라 없다 */
export const INDICATOR_NAME = {
  official_closure_rate: '서울시 공식 폐업률',
  official_risk: '서울시 창업위험도',
  market_change: '상권변화지표',
  closure_rate_12m: '참고 폐업률 (최근 12개월)',
  /** 개업 n주년 당일에 영업 중이었는지 보는 고정 관측 지표 — 현재 잔존율 아님 (BE fe-risk-reference-api-request.md) */
  survival_rate_1y: '개업 1주년 생존율',
  survival_rate_3y: '개업 3주년 생존율',
  competitor_count: '반경 안 동종업체 수',
  day_night_ratio: '주야간 인구비',
} as const
