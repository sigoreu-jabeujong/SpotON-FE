/**
 * 결과 상태 라벨 (분석 로직 정의서 5장 화면 표시 규칙)
 * 모든 수치에는 아래 상태 중 하나를 함께 표시한다.
 */
export const DATA_STATUS = {
  fact: { label: '확인된 사실', tone: 'neutral' },
  estimate: { label: '통계적 추정', tone: 'info' },
  no_data: { label: '자료 없음', tone: 'muted' },
  on_hold: { label: '판단 보류', tone: 'warning' },
  info_missing: { label: '정보 없음', tone: 'muted' },
  location_unknown: { label: '상세 위치 미확인', tone: 'warning' },
} as const
export type DataStatus = keyof typeof DATA_STATUS

/** 지표 구분: 공식 지표와 Spot:ON 참고지표는 항상 분리해 표시 */
export const INDICATOR_TYPE = {
  official: '서울시 공식',
  reference: 'Spot:ON 참고지표',
} as const
export type IndicatorType = keyof typeof INDICATOR_TYPE
